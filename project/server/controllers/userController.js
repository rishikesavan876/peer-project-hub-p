const User = require('../models/User');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const projects = await Project.find({ owner: user._id })
      .populate('owner', 'displayName photoURL')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { user, projects } });
  } catch (err) {
    next(err);
  }
};
