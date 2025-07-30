const express = require("express");
const router = express.Router();
const {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers
} = require("../controllers/newsletterController");

// Public routes
router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

// Admin routes
router.get("/subscribers", requireAuth, requireAdmin, getSubscribers);

// Middleware
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: "Admin access required" });
}

module.exports = router;