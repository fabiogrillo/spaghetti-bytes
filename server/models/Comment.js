// server/models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    // Reference to the story this comment belongs to
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        required: true,
        index: true // Index for fast queries by story
    },

    // Parent comment ID for nested replies (null for top-level comments)
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
        index: true // Index for fast queries of replies
    },

    // Guest user information (no auth required)
    author: {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            // Email is optional but if provided, must be valid
            required: false
        },
        website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+\..+/, 'Please provide a valid URL'],
            required: false
        },
        avatarUrl: {
            type: String,
            default: null // Will generate Gravatar URL if email provided
        }
    },

    // Comment content
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 5000, // Reasonable limit for comments
        trim: true
    },

    // Moderation and status
    status: {
        type: String,
        enum: ['pending', 'approved', 'spam', 'deleted'],
        default: 'pending', // 'approved' -> Auto-approve by default, can change to 'pending' for moderation
        index: true
    },

    // Reactions (similar to Story model)
    reactions: {
        love: { type: Number, default: 0 },
        thumbsUp: { type: Number, default: 0 },
        thumbsDown: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        wow: { type: Number, default: 0 }
    },

    // Track unique voters to prevent multiple votes
    voters: [{
        sessionId: String, // Session ID or IP+UserAgent hash
        reaction: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Anti-spam and tracking
    metadata: {
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        },
        sessionId: String, // For tracking same user across comments
        flagCount: {
            type: Number,
            default: 0 // Number of times flagged as spam/inappropriate
        },
        editHistory: [{
            content: String,
            editedAt: { type: Date, default: Date.now }
        }]
    },

    // Computed fields for performance
    replyCount: {
        type: Number,
        default: 0 // Denormalized count of direct replies
    },

    // Soft delete functionality
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: String, // 'user', 'moderator', 'admin', 'system'
        default: null
    },

    // Edit window - comments can be edited for 5 minutes after creation
    isEditable: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for performance
commentSchema.index({ storyId: 1, createdAt: -1 }); // For fetching comments by story, newest first
commentSchema.index({ storyId: 1, status: 1, createdAt: -1 }); // For fetching approved comments
commentSchema.index({ 'author.email': 1 }); // For finding all comments by email
commentSchema.index({ 'metadata.ipAddress': 1, createdAt: -1 }); // For rate limiting
commentSchema.index({ parentId: 1, status: 1 }); // For fetching replies
commentSchema.index({ status: 1, flagCount: 1 }); // For moderation queries

// Virtual for Gravatar URL
commentSchema.virtual('author.gravatarUrl').get(function () {
    if (!this.author.email) return null;

    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(this.author.email.toLowerCase()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=128`;
});

// Virtual to check if comment can still be edited (5 minute window)
commentSchema.virtual('canEdit').get(function () {
    const fiveMinutes = 5 * 60 * 1000;
    const now = new Date();
    const created = new Date(this.createdAt);
    return (now - created) < fiveMinutes && this.isEditable;
});

// Method to soft delete a comment
commentSchema.methods.softDelete = function (deletedBy = 'user') {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.status = 'deleted';
    return this.save();
};

// Method to add a reaction
commentSchema.methods.addReaction = function (reaction, sessionId) {
    // Check if this session already voted
    const existingVote = this.voters.find(v => v.sessionId === sessionId);

    if (existingVote) {
        // Remove the old reaction
        if (this.reactions[existingVote.reaction] > 0) {
            this.reactions[existingVote.reaction]--;
        }
        // Update to new reaction
        existingVote.reaction = reaction;
        existingVote.timestamp = new Date();
    } else {
        // Add new vote
        this.voters.push({ sessionId, reaction, timestamp: new Date() });
    }

    // Increment the new reaction
    this.reactions[reaction]++;

    return this.save();
};

// Method to flag as spam
commentSchema.methods.flag = function () {
    this.metadata.flagCount++;

    // Auto-mark as spam after 3 flags
    if (this.metadata.flagCount >= 3) {
        this.status = 'spam';
    }

    return this.save();
};

// Static method to get comments for a story with pagination
commentSchema.statics.getCommentsForStory = async function (storyId, options = {}) {
    const {
        page = 1,
        limit = 20,
        includeReplies = true,
        status = 'approved'
    } = options;

    const query = {
        storyId: new mongoose.Types.ObjectId(storyId),
        status: status,
        parentId: null // Only top-level comments
    };

    const comments = await this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

    if (includeReplies) {
        // Fetch all replies for these comments in one query
        const commentIds = comments.map(c => c._id);
        const replies = await this.find({
            parentId: { $in: commentIds },
            status: status
        })
            .sort({ createdAt: 1 }) // Oldest first for replies
            .lean();

        // Group replies by parent comment
        const repliesByParent = {};
        replies.forEach(reply => {
            const parentId = reply.parentId.toString();
            if (!repliesByParent[parentId]) {
                repliesByParent[parentId] = [];
            }
            repliesByParent[parentId].push(reply);
        });

        // Attach replies to comments
        comments.forEach(comment => {
            comment.replies = repliesByParent[comment._id.toString()] || [];
        });
    }

    return comments;
};

// Static method for rate limiting check
commentSchema.statics.checkRateLimit = async function (ipAddress, limit = 10, windowMinutes = 60) {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const recentComments = await this.countDocuments({
        'metadata.ipAddress': ipAddress,
        createdAt: { $gte: windowStart }
    });

    return recentComments >= limit;
};

// Pre-save middleware to disable editing after 5 minutes
commentSchema.pre('save', function (next) {
    if (!this.isNew) {
        const fiveMinutes = 5 * 60 * 1000;
        const now = new Date();
        const created = new Date(this.createdAt);

        if ((now - created) >= fiveMinutes) {
            this.isEditable = false;
        }
    }
    next();
});

// Pre-save middleware to update reply count on parent
commentSchema.pre('save', async function (next) {
    if (this.isNew && this.parentId) {
        await this.constructor.findByIdAndUpdate(
            this.parentId,
            { $inc: { replyCount: 1 } }
        );
    }
    next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;