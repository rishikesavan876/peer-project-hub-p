const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: {
      type: String,
      required: true,
      trim: true,
      default: 'Anonymous Dev',
      maxlength: 60,
    },
    photoURL: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
