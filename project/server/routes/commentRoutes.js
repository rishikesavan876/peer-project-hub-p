const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getComments).post(protect, addComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
