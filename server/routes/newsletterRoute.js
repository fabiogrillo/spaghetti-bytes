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
    sendCampaign,
    getAnalytics
} = require("../controllers/newsletterController");

// Middleware
function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

// Public routes
router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

// Protected routes
router.get("/subscribers", requireAuth, getSubscribers);
router.get("/subscribers/stats", requireAuth, getSubscriberStats);
router.get("/campaigns", requireAuth, getCampaigns);
router.post("/campaigns", requireAuth, createCampaign);
router.post("/campaigns/:campaignId/send", requireAuth, sendCampaign);
router.get("/analytics", requireAuth, getAnalytics);

module.exports = router;