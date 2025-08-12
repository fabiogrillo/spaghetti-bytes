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
        source: String, // 'homepage', 'article', 'popup'
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
        topics: [String] // ['react', 'nodejs', 'mongodb']
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

// Indexes
subscriberSchema.index({ status: 1 });
subscriberSchema.index({ 'tokens.unsubscribeToken': 1 });

// Methods
subscriberSchema.methods.generateTokens = function () {
    this.tokens.confirmToken = require('crypto').randomBytes(32).toString('hex');
    this.tokens.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
};

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// Newsletter Campaign Schema
const campaignSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    preheader: String,
    content: {
        html: String,
        text: String,
        articles: [{
            title: String,
            summary: String,
            url: String,
            imageUrl: String
        }]
    },

    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent'],
        default: 'draft'
    },

    schedule: {
        sendAt: Date,
        timezone: String
    },

    recipients: {
        total: Number,
        sent: Number,
        opened: Number,
        clicked: Number,
        unsubscribed: Number
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = { Subscriber, Campaign };