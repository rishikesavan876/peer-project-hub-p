const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProjects,
  getFavoriteProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
  toggleFavorite,
  rateProject,
} = require('../controllers/projectController');

const router = express.Router();

router.route('/').get(getProjects).post(protect, createProject);
router.get('/favorites/my', protect, getFavoriteProjects);
router.route('/:id').get(getProject).put(protect, updateProject).delete(protect, deleteProject);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/favorite', protect, toggleFavorite);
router.put('/:id/rating', protect, rateProject);

module.exports = router;
