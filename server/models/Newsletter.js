const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    status: {
        type: String,
        enum: ['pending', 'active', 'unsubscribed'],
        default: 'pending'
    },

    metadata: {
        source: String,
        referrer: String,
        ipAddress: String,
        userAgent: String
    },

    preferences: {
        frequency: {
            type: String,
            enum: ['instant', 'daily', 'weekly', 'monthly'],
            default: 'weekly'
        },
        topics: [String]
    },

    engagement: {
        lastOpened: Date,
        openCount: { type: Number, default: 0 },
        clickCount: { type: Number, default: 0 },
        bounced: { type: Boolean, default: false }
    },

    tokens: {
        confirmToken: String,
        unsubscribeToken: String
    },

    dates: {
        subscribedAt: { type: Date, default: Date.now },
        confirmedAt: Date,
        unsubscribedAt: Date
    }
});

subscriberSchema.index({ status: 1 });
subscriberSchema.index({ 'tokens.unsubscribeToken': 1 });

subscriberSchema.methods.generateTokens = function () {
    this.tokens.confirmToken = require('crypto').randomBytes(32).toString('hex');
    this.tokens.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
};

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = { Subscriber };
