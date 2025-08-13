// server/models/Comment.js
// Complete comment model with moderation workflow

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    author: {
        name: {
            type: String,
            default: 'Anonymous',
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        sessionId: {
            type: String,
            default: null
        }
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'spam'],
        default: 'pending',
        index: true
    },
    reactions: {
        likes: [{
            type: String // Can be userId or sessionId
        }],
        hearts: [{
            type: String
        }],
        claps: [{
            type: String
        }],
        totalCount: {
            type: Number,
            default: 0
        }
    },
    // Moderation fields
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    moderatedAt: {
        type: Date,
        default: null
    },
    moderationReason: {
        type: String,
        default: null
    },
    flagReason: {
        type: String,
        default: null
    },
    flaggedAt: {
        type: Date,
        default: null
    },
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        },
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Indexes for performance
commentSchema.index({ story: 1, status: 1, createdAt: -1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index({ 'author.userId': 1 });
commentSchema.index({ parentComment: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
    count: true
});

// Method to check if user can delete
commentSchema.methods.canDelete = function (user) {
    if (!user) return false;

    // Admin can delete any comment
    if (user.role === 'admin') return true;

    // User can delete their own comment
    if (this.author.userId && this.author.userId.toString() === user._id.toString()) {
        return true;
    }

    return false;
};

// Method to check if user has reacted
commentSchema.methods.hasReacted = function (userId, type) {
    if (!userId || !type) return false;

    const reactions = this.reactions[`${type}s`];
    return reactions && reactions.includes(userId.toString());
};

// Static method to get pending count
commentSchema.statics.getPendingCount = async function () {
    return await this.countDocuments({ status: 'pending' });
};

// Static method to get moderation queue
commentSchema.statics.getModerationQueue = async function (limit = 50) {
    return await this.find({
        status: { $in: ['pending', 'spam'] }
    })
        .populate('story', 'title slug')
        .populate('author.userId', 'username')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Pre-save hook to update totalCount
commentSchema.pre('save', function (next) {
    this.reactions.totalCount =
        this.reactions.likes.length +
        this.reactions.hearts.length +
        this.reactions.claps.length;
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;