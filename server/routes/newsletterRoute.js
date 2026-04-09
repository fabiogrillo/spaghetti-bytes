const express = require("express");
const router = express.Router();

const {
    subscribe,
    confirmSubscription,
    unsubscribe,
    requestUnsubscribe,
    getSubscribers,
    deleteSubscriber,
    getSubscriberStats
} = require("../controllers/newsletterController");

const { requireAuth, requireAdmin } = require("../middleware/auth");
const { newsletterLimiter, apiLimiter } = require("../middleware/rateLimiter");
const { newsletterValidation, queryValidation, sanitizeMongo } = require("../middleware/validation");

router.use(sanitizeMongo);

// ── Public routes ─────────────────────────────────────────────────────────────

router.post("/subscribe", newsletterLimiter, newsletterValidation.subscribe, subscribe);

router.get("/confirm/:token", apiLimiter, newsletterValidation.confirmSubscription, confirmSubscription);

router.get("/unsubscribe/:token", apiLimiter, newsletterValidation.unsubscribe, unsubscribe);

router.post("/unsubscribe/request", newsletterLimiter, requestUnsubscribe);

// ── Admin routes ──────────────────────────────────────────────────────────────

router.get("/subscribers", requireAuth, requireAdmin, queryValidation.pagination, getSubscribers);

router.delete("/subscribers/:id", requireAuth, requireAdmin, deleteSubscriber);

router.get("/stats", requireAuth, requireAdmin, getSubscriberStats);

module.exports = router;
