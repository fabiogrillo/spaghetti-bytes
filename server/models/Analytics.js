const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    // Page view data
    path: { type: String, required: true },
    title: { type: String },

    // User data
    sessionId: { type: String, required: true },
    userId: { type: String }, // If logged in

    // Technical data
    userAgent: { type: String },
    ip: { type: String },
    country: { type: String },
    city: { type: String },

    // Referrer data
    referrer: { type: String },
    referrerDomain: { type: String },

    // Time data
    timestamp: { type: Date, default: Date.now },
    timeOnPage: { type: Number }, // In seconds

    // Device data
    device: {
        type: { type: String }, // mobile, tablet, desktop
        browser: { type: String },
        os: { type: String }
    }
});

// Indexes for performance
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ path: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;