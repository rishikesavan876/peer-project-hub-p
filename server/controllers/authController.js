const User = require('../models/User');

exports.syncUser = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.displayName !== undefined) updates.displayName = req.body.displayName;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
