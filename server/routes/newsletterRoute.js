const express = require("express");
const router = express.Router();
const {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers,
    getSubscriberStats,
    createCampaign,
    getCampaigns,
    sendCampaign
} = require("../controllers/newsletterController");

// Middleware
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

function requireAdmin(req, res, next) {
    // For now, any authenticated user is admin
    // You can add role checking here
    if (req.user) {
        return next();
    }
    res.status(403).json({ error: "Admin access required" });
}

// Public routes
router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

// Admin routes
router.get("/subscribers", requireAuth, requireAdmin, getSubscribers);
router.get("/subscribers/stats", requireAuth, requireAdmin, getSubscriberStats);

// Campaign routes
router.get("/campaigns", requireAuth, requireAdmin, getCampaigns);
router.post("/campaigns", requireAuth, requireAdmin, createCampaign);
router.post("/campaigns/:campaignId/send", requireAuth, requireAdmin, sendCampaign);

module.exports = router;