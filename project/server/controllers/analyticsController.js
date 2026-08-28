const User = require('../models/User');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalProjects, totalUsers, totalComments, likesAgg, mostLikedAgg, topTagsAgg] =
      await Promise.all([
        Project.countDocuments(),
        User.countDocuments(),
        Comment.countDocuments(),
        Project.aggregate([
          { $project: { likeCount: { $size: { $ifNull: ['$likes', []] } } } },
          { $group: { _id: null, total: { $sum: '$likeCount' } } },
        ]),
        Project.aggregate([
          {
            $project: {
              title: 1,
              owner: 1,
              createdAt: 1,
              likeCount: { $size: { $ifNull: ['$likes', []] } },
            },
          },
          { $sort: { likeCount: -1, createdAt: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
            },
          },
          { $unwind: '$owner' },
          { $project: { title: 1, likeCount: 1, 'owner.displayName': 1 } },
        ]),
        Project.aggregate([
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalUsers,
        totalComments,
        totalLikes: likesAgg.length ? likesAgg[0].total : 0,
        mostLikedProject: mostLikedAgg[0]
          ? {
              _id: mostLikedAgg[0]._id,
              title: mostLikedAgg[0].title,
              likeCount: mostLikedAgg[0].likeCount,
              ownerName: mostLikedAgg[0].owner?.displayName || 'Unknown',
            }
          : null,
        topTags: topTagsAgg.map((t) => ({ tag: t._id, count: t.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};
