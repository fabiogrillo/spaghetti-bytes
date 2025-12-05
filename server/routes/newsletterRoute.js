// server/routes/newsletterRoute.js
const express = require("express");
const router = express.Router();

// Import controllers
const {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers,
    deleteSubscriber,
    getSubscriberStats
} = require("../controllers/newsletterController");

// Import middleware
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
    newsletterLimiter,
    apiLimiter,
    contentLimiter
} = require("../middleware/rateLimiter");
const {
    newsletterValidation,
    campaignValidation,
    queryValidation,
    sanitizeMongo
} = require("../middleware/validation");

// Apply MongoDB sanitization to all routes
router.use(sanitizeMongo);

// ====================================
// PUBLIC ROUTES - No authentication required
// ====================================

// Subscribe to newsletter - with rate limiting and validation
router.post(
    "/subscribe",
    newsletterLimiter, // Prevent spam subscriptions
    newsletterValidation.subscribe, // Validate email format
    subscribe
);

// Confirm subscription via email token
router.get(
    "/confirm/:token",
    apiLimiter, // Basic rate limiting
    newsletterValidation.confirmSubscription, // Validate token
    confirmSubscription
);

// Unsubscribe via email token
router.get(
    "/unsubscribe/:token",
    apiLimiter, // Basic rate limiting
    newsletterValidation.unsubscribe, // Validate token
    unsubscribe
);

// ====================================
// ADMIN ROUTES - Authentication required
// ====================================

// Get all subscribers - Admin only
router.get(
    "/subscribers",
    requireAuth, // Check authentication
    requireAdmin, // Check admin role
    queryValidation.pagination, // Validate pagination params
    getSubscribers
);

// Delete a specific subscriber - Admin only
router.delete(
    "/subscribers/:id",
    requireAuth, // Check authentication
    requireAdmin, // Check admin role
    deleteSubscriber
);

// ====================================
// STATISTICS ROUTES - Admin only
// ====================================

// Get subscriber statistics
router.get(
    "/stats",
    requireAuth, // Check authentication
    requireAdmin, // Check admin role
    getSubscriberStats
);

module.exports = router;