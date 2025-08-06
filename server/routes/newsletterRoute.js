const express = require("express");
const router = express.Router();
const {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers,
    deleteSubscriber,
    createCampaign,
    getCampaigns,
    sendCampaign,
    deleteCampaign,
    getSubscriberStats
} = require("../controllers/newsletterController");

// Authentication middleware (optional - add if you want to protect admin routes)
const requireAuth = (req, res, next) => {
    // Add your authentication logic here
    // For now, we'll pass through
    next();
};

// Public routes - no authentication required
router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

// Admin routes - authentication recommended
router.get("/subscribers", requireAuth, getSubscribers);
router.delete("/subscribers/:id", requireAuth, deleteSubscriber);

router.post("/campaigns", requireAuth, createCampaign);
router.get("/campaigns", requireAuth, getCampaigns);
router.post("/campaigns/:campaignId/send", requireAuth, sendCampaign);
router.delete("/campaigns/:campaignId", requireAuth, deleteCampaign);

router.get("/stats", requireAuth, getSubscriberStats);

module.exports = router;