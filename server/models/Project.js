const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    githubRepo: {
      type: String,
      required: [true, 'GitHub repo link is required'],
      trim: true,
    },
    liveDemo: { type: String, trim: true, default: '' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ratings: [ratingSchema],
  },
  { timestamps: true }
);

projectSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  return this.ratings.reduce((sum, r) => sum + r.value, 0) / this.ratings.length;
});

projectSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
