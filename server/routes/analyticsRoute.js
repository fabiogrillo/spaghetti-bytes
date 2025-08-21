// server/routes/analyticsRoute.js
// Analytics routes for dashboard and statistics

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Middleware for optional authentication
const optionalAuth = (req, res, next) => {
    // Pass through even if not authenticated
    next();
};

// Public routes

// GET /api/analytics/quick-stats - Get quick statistics
router.get('/quick-stats', analyticsController.getQuickStats);

// GET /api/analytics/dashboard - Get full dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// GET /api/analytics/trending - Get trending content
router.get('/trending', analyticsController.getTrendingContent);

module.exports = router;