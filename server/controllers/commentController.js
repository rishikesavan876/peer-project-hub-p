const Comment = require('../models/Comment');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ project: req.params.projectId })
      .populate('author', 'displayName photoURL')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return next(new ErrorResponse('Comment text is required', 400));
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    const comment = await Comment.create({
      project: req.params.projectId,
      author: req.user._id,
      text: text.trim(),
    });

    await comment.populate('author', 'displayName photoURL');
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(new ErrorResponse('Comment not found', 404));
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to delete this comment', 403));
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
