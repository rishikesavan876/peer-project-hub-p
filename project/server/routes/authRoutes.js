const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { syncUser, getMe, updateMe } = require('../controllers/authController');

const router = express.Router();

router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
