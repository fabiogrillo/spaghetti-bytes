const express = require("express");
const router = express.Router();
const { getAnalyticsData } = require("../controllers/analyticsController");

// GET /api/newsletter/analytics?range=7d
router.get("/analytics", getAnalyticsData);

module.exports = router;
