// server/controllers/commentController.js
// Fixed version - admin is anyone who is authenticated

const Comment = require('../models/Comment');
const Story = require('../models/Story');
const { validationResult } = require('express-validator');

// Get comments for a story (only approved for non-authenticated users)
exports.getComments = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { page = 1, limit = 50, sort = 'newest' } = req.query;

        // Build query based on authentication status
        let query = { story: storyId };

        // Non-authenticated users only see approved comments
        // Authenticated users (admin) see ALL comments
        if (!req.user) {
            query.status = 'approved';
        }

        // Sorting options
        let sortOption = {};
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'popular':
                sortOption = { 'reactions.totalCount': -1, createdAt: -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
        }

        const comments = await Comment.find(query)
            .populate('author.userId', 'username avatar')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Comment.countDocuments(query);

        // Add admin flags if user is authenticated
        if (req.user) {
            comments.forEach(comment => {
                comment.isAdmin = true;
                comment.canDelete = true;
            });
        }

        res.json({
            comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

// Create new comment
exports.createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { storyId } = req.params;
        const { content, author, parentId } = req.body;

        // Verify story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Handle author data
        const authorData = {
            name: author.name || 'Anonymous',
            userId: req.user ? req.user._id : null
        };

        // Only add email if provided and valid
        if (author.email && author.email.trim()) {
            authorData.email = author.email.trim();
        }

        // Add sessionId if provided
        if (author.sessionId) {
            authorData.sessionId = author.sessionId;
        }

        // Create comment data
        // If user is authenticated (admin), auto-approve. Otherwise, set as pending
        const commentData = {
            story: storyId,
            content: content.trim(),
            author: authorData,
            status: req.user ? 'approved' : 'pending',
            reactions: {
                likes: [],
                hearts: [],
                claps: [],
                totalCount: 0
            }
        };

        // Add parent comment if replying
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
            commentData.parentComment = parentId;
        }

        const comment = await Comment.create(commentData);

        // Update story comment count only if approved
        if (comment.status === 'approved') {
            await Story.findByIdAndUpdate(storyId, {
                $inc: { commentCount: 1 },
                lastCommentAt: new Date()
            });
        }

        res.status(201).json({
            message: req.user
                ? 'Comment posted successfully'
                : 'Comment submitted for moderation',
            comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};

// Add reaction to comment
exports.addReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { type, sessionId } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only allow reactions on approved comments
        if (comment.status !== 'approved') {
            return res.status(403).json({ error: 'Cannot react to unapproved comments' });
        }

        // Use userId if authenticated, otherwise sessionId
        const identifier = req.user ? req.user._id.toString() : sessionId;

        if (!identifier) {
            return res.status(400).json({ error: 'User identification required' });
        }

        // Check if user already reacted
        const reactionTypes = ['likes', 'hearts', 'claps'];
        for (const reactionType of reactionTypes) {
            const index = comment.reactions[reactionType].indexOf(identifier);
            if (index > -1) {
                comment.reactions[reactionType].splice(index, 1);
            }
        }

        // Add new reaction
        if (type === 'like') comment.reactions.likes.push(identifier);
        if (type === 'heart') comment.reactions.hearts.push(identifier);
        if (type === 'clap') comment.reactions.claps.push(identifier);

        // Update total count
        comment.reactions.totalCount =
            comment.reactions.likes.length +
            comment.reactions.hearts.length +
            comment.reactions.claps.length;

        await comment.save();

        res.json({ message: 'Reaction added', reactions: comment.reactions });
    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({ error: 'Failed to add reaction' });
    }
};

// Flag comment for review
exports.flagComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.flagReason = reason || 'Inappropriate content';
        comment.flaggedAt = new Date();
        comment.status = 'spam';

        await comment.save();

        res.json({ message: 'Comment flagged for review' });
    } catch (error) {
        console.error('Error flagging comment:', error);
        res.status(500).json({ error: 'Failed to flag comment' });
    }
};

// Delete comment - simplified logic
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Allow deletion if:
        // 1. User is authenticated (admin)
        // 2. OR user created the comment (by userId)
        const canDelete =
            req.user || // Admin can delete any
            (comment.author.userId && comment.author.userId.toString() === req.user?._id.toString());

        if (!canDelete) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Delete the comment and all its replies
        await deleteCommentAndReplies(commentId);

        // Update story comment count
        await Story.findByIdAndUpdate(comment.story, {
            $inc: { commentCount: -1 }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Admin force delete - only for authenticated users
exports.adminDeleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Delete comment and all replies
        const deletedCount = await deleteCommentAndReplies(commentId);

        // Update story comment count
        await Story.findByIdAndUpdate(comment.story, {
            $inc: { commentCount: -deletedCount }
        });

        res.json({ message: 'Comment and replies deleted permanently' });
    } catch (error) {
        console.error('Error in admin delete:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Helper function to delete comment and all its replies
async function deleteCommentAndReplies(commentId) {
    let deletedCount = 1; // Count the comment itself

    // Find all replies
    const replies = await Comment.find({ parentComment: commentId });

    // Recursively delete replies
    for (const reply of replies) {
        deletedCount += await deleteCommentAndReplies(reply._id);
    }

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);

    return deletedCount;
}

// Get pending comments for moderation (admin only)
exports.getPendingComments = async (req, res) => {
    try {
        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const comments = await Comment.find({
            status: { $in: ['pending', 'spam'] }
        })
            .populate('story', 'title slug')
            .populate('author.userId', 'username')
            .sort('-createdAt')
            .lean();

        // Clean up the response
        const cleanedComments = comments.map(comment => {
            return {
                _id: comment._id,
                content: comment.content,
                author: {
                    name: comment.author?.name || 'Anonymous',
                    email: comment.author?.email || '',
                    userId: comment.author?.userId || null
                },
                status: comment.status,
                createdAt: comment.createdAt,
                story: comment.story ? {
                    _id: comment.story._id,
                    title: comment.story.title,
                    slug: comment.story.slug
                } : null,
                reactions: comment.reactions || {
                    likes: [],
                    hearts: [],
                    claps: [],
                    totalCount: 0
                },
                flagReason: comment.flagReason || null
            };
        });

        res.json({
            comments: cleanedComments,
            total: cleanedComments.length
        });
    } catch (error) {
        console.error('Error fetching pending comments:', error);
        res.status(500).json({ error: 'Failed to fetch pending comments' });
    }
};

// Get count of pending comments (for navbar badge)
exports.getPendingCount = async (req, res) => {
    try {
        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const count = await Comment.countDocuments({
            status: { $in: ['pending', 'spam'] }
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching pending count:', error);
        res.status(500).json({ error: 'Failed to fetch pending count' });
    }
};

// Approve comment (admin only)
exports.approveComment = async (req, res) => {
    try {
        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.status = 'approved';
        comment.moderatedBy = req.user._id;
        comment.moderatedAt = new Date();

        await comment.save();

        // Update story comment count when approving
        await Story.findByIdAndUpdate(comment.story, {
            $inc: { commentCount: 1 }
        });

        res.json({ message: 'Comment approved', comment });
    } catch (error) {
        console.error('Error approving comment:', error);
        res.status(500).json({ error: 'Failed to approve comment' });
    }
};

// Reject comment (admin only)
exports.rejectComment = async (req, res) => {
    try {
        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const { commentId } = req.params;
        const { reason } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.status = 'rejected';
        comment.moderatedBy = req.user._id;
        comment.moderatedAt = new Date();
        comment.moderationReason = reason || 'Content violates community guidelines';

        await comment.save();

        res.json({ message: 'Comment rejected', comment });
    } catch (error) {
        console.error('Error rejecting comment:', error);
        res.status(500).json({ error: 'Failed to reject comment' });
    }
};

// Get comment statistics (admin only)
exports.getCommentStats = async (req, res) => {
    try {
        // Check if user is authenticated (admin)
        if (!req.user) {
            return res.status(403).json({ error: 'Authentication required' });
        }

        const stats = await Comment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const storyStats = await Comment.aggregate([
            {
                $match: { status: 'approved' } // Only count approved comments
            },
            {
                $group: {
                    _id: '$story',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'stories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'story'
                }
            },
            {
                $unwind: '$story'
            },
            {
                $project: {
                    title: '$story.title',
                    slug: '$story.slug',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        const result = {
            statusBreakdown: {
                pending: 0,
                approved: 0,
                rejected: 0,
                spam: 0
            },
            topStoriesByComments: storyStats,
            totalComments: 0
        };

        // Fill in the stats
        stats.forEach(stat => {
            result.statusBreakdown[stat._id] = stat.count;
            result.totalComments += stat.count;
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching comment stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

module.exports = exports;