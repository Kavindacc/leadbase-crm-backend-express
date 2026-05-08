const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Get dashboard statistics - requires valid JWT token
router.get('/', protect, getDashboardStats);

module.exports = router;
