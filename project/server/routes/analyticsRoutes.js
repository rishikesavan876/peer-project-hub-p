const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireOwner } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, requireOwner, getAnalytics);

module.exports = router;
