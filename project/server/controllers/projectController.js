const Project = require('../models/Project');
const Comment = require('../models/Comment');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

const escapeRegex = (text) =>
  String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const isUrl = (value) => /^https?:\/\/[^\s]+\.[^\s]+/i.test(value);

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const sendPaged = async (res, query, { page, limit, skip }) => {
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('owner', 'displayName photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    pages: Math.ceil(total / limit) || 1,
    currentPage: page,
    data: projects,
  });
};

exports.getProjects = async (req, res, next) => {
  try {
    const pagination = parsePagination(req);
    const query = {};

    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q), 'i');
      query.$or = [{ title: rx }, { description: rx }];
    }

    if (req.query.tag) {
      query.tags = String(req.query.tag).toLowerCase();
    }

    if (req.query.ownerUid) {
      const owner = await User.findOne({ firebaseUid: String(req.query.ownerUid) }).select('_id');
      if (!owner) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          pages: 1,
          currentPage: pagination.page,
          data: [],
        });
      }
      query.owner = owner._id;
    }

    await sendPaged(res, query, pagination);
  } catch (err) {
    next(err);
  }
};

exports.getFavoriteProjects = async (req, res, next) => {
  try {
    const pagination = parsePagination(req);
    await sendPaged(res, { favorites: req.user._id }, pagination);
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner',
      'displayName photoURL bio firebaseUid'
    );

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, tags, githubRepo, liveDemo } = req.body;

    if (!isUrl(githubRepo)) {
      return next(new ErrorResponse('GitHub repo link must be a valid URL', 400));
    }
    if (liveDemo && !isUrl(liveDemo)) {
      return next(new ErrorResponse('Live demo link must be a valid URL', 400));
    }

    const tagList = Array.isArray(tags)
      ? tags
      : String(tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const project = await Project.create({
      title,
      description,
      tags: tagList,
      githubRepo,
      liveDemo: liveDemo || '',
      owner: req.user._id,
    });

    await project.populate('owner', 'displayName photoURL');
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this project', 403));
    }

    const { title, description, githubRepo, liveDemo } = req.body;

    if (githubRepo !== undefined && !isUrl(githubRepo)) {
      return next(new ErrorResponse('GitHub repo link must be a valid URL', 400));
    }
    if (liveDemo !== undefined && liveDemo !== '' && !isUrl(liveDemo)) {
      return next(new ErrorResponse('Live demo link must be a valid URL', 400));
    }

    const updates = { title, description, githubRepo, liveDemo };

    if (req.body.tags !== undefined) {
      updates.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('owner', 'displayName photoURL');

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to delete this project', 403));
    }

    await Comment.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    const alreadyLiked = project.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      alreadyLiked
        ? { $pull: { likes: req.user._id } }
        : { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: updated.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    const alreadyFavorited = project.favorites.some(
      (id) => id.toString() === req.user._id.toString()
    );

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      alreadyFavorited
        ? { $pull: { favorites: req.user._id } }
        : { $addToSet: { favorites: req.user._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      favorited: !alreadyFavorited,
      favoriteCount: updated.favorites.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.rateProject = async (req, res, next) => {
  try {
    const value = Number(req.body.value);

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return next(new ErrorResponse('Rating must be an integer between 1 and 5', 400));
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    const existing = project.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existing) {
      existing.value = value;
    } else {
      project.ratings.push({ user: req.user._id, value });
    }

    await project.save();

    const averageRating =
      project.ratings.reduce((sum, r) => sum + r.value, 0) /
      (project.ratings.length || 1);

    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCount: project.ratings.length,
        yourRating: value,
      },
    });
  } catch (err) {
    next(err);
  }
};
