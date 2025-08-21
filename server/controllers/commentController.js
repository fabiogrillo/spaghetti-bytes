// server/controllers/commentController.js
// Complete comment system with moderation workflow - UPDATED

const Comment = require('../models/Comment');
const Story = require('../models/Story');
const { validationResult } = require('express-validator');

// Get comments for a story (only approved for non-admin)
exports.getComments = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        // Build query based on user role
        let query = { story: storyId };

        // Non-admin users only see approved comments
        if (!req.user || req.user.role !== 'admin') {
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

        // Add admin flag to comments if user is admin
        if (req.user && req.user.role === 'admin') {
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

// Create new comment (defaults to pending status)
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

        // Handle empty email properly
        const authorData = {
            name: author.name || 'Anonymous',
            userId: req.user ? req.user._id : null,
            sessionId: author.sessionId
        };

        // Only add email if it's not empty
        if (author.email && author.email.trim() !== '') {
            authorData.email = author.email;
        }

        // Create comment with pending status for moderation
        const newComment = new Comment({
            story: storyId,
            content,
            author: authorData,
            parentComment: parentId || null,
            status: 'pending', // All new comments start as pending
            reactions: {
                likes: [],
                hearts: [],
                claps: [],
                totalCount: 0
            }
        });

        await newComment.save();

        // Update story comment count (only approved comments)
        const approvedCount = await Comment.countDocuments({
            story: storyId,
            status: 'approved'
        });
        story.commentsCount = approvedCount;
        await story.save();

        res.status(201).json({
            message: 'Comment submitted for moderation',
            comment: newComment,
            requiresModeration: true
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};

// Get comments pending moderation (admin only)
exports.getPendingComments = async (req, res) => {
    try {
        // First check if user is admin
        if (!req.user) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Fetch comments with safer population
        const comments = await Comment.find({
            status: { $in: ['pending', 'spam'] }
        })
            .populate({
                path: 'story',
                select: 'title slug',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(); // Use lean() for better performance and to avoid toJSON issues

        // Clean up the comments data before sending
        const cleanedComments = comments.map(comment => {
            return {
                _id: comment._id,
                content: comment.content,
                status: comment.status,
                createdAt: comment.createdAt,
                author: {
                    name: comment.author?.name || 'Anonymous',
                    email: comment.author?.email || '',
                    sessionId: comment.author?.sessionId || null
                },
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
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
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
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
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

        // Update story comment count
        const story = await Story.findById(comment.story);
        if (story) {
            const approvedCount = await Comment.countDocuments({
                story: story._id,
                status: 'approved'
            });
            story.commentsCount = approvedCount;
            await story.save();
        }

        res.json({
            message: 'Comment approved successfully',
            comment
        });
    } catch (error) {
        console.error('Error approving comment:', error);
        res.status(500).json({ error: 'Failed to approve comment' });
    }
};

// Reject comment (admin only)
exports.rejectComment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
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
        comment.moderationReason = reason || 'Rejected by moderator';
        await comment.save();

        res.json({
            message: 'Comment rejected successfully',
            comment
        });
    } catch (error) {
        console.error('Error rejecting comment:', error);
        res.status(500).json({ error: 'Failed to reject comment' });
    }
};

// Delete comment (owner or admin)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check permission
        const canDelete = req.user && (
            req.user.role === 'admin' ||
            (comment.author.userId && comment.author.userId.toString() === req.user._id.toString())
        );

        if (!canDelete) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        await Comment.findByIdAndDelete(commentId);

        // Update story comment count
        const story = await Story.findById(comment.story);
        if (story) {
            const approvedCount = await Comment.countDocuments({
                story: story._id,
                status: 'approved'
            });
            story.commentsCount = approvedCount;
            await story.save();
        }

        res.json({
            message: 'Comment deleted successfully',
            deletedId: commentId
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Admin delete (force delete regardless of status)
exports.adminDeleteComment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Delete comment and all its replies
        const deleteCommentAndReplies = async (id) => {
            const replies = await Comment.find({ parentComment: id });
            for (const reply of replies) {
                await deleteCommentAndReplies(reply._id);
            }
            await Comment.findByIdAndDelete(id);
        };

        await deleteCommentAndReplies(commentId);

        // Update story comment count
        const story = await Story.findById(comment.story);
        if (story) {
            const approvedCount = await Comment.countDocuments({
                story: story._id,
                status: 'approved'
            });
            story.commentsCount = approvedCount;
            await story.save();
        }

        res.json({
            message: 'Comment and all replies deleted successfully',
            deletedId: commentId
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Add reaction to comment
exports.addReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { type, sessionId } = req.body;

        if (!['like', 'heart', 'clap'].includes(type)) {
            return res.status(400).json({ error: 'Invalid reaction type' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if already reacted
        const reactionField = `reactions.${type}s`;
        const userId = req.user ? req.user._id.toString() : sessionId;

        const alreadyReacted = comment.reactions[`${type}s`].some(
            r => r.toString() === userId
        );

        if (alreadyReacted) {
            // Remove reaction
            comment.reactions[`${type}s`] = comment.reactions[`${type}s`].filter(
                r => r.toString() !== userId
            );
            comment.reactions.totalCount--;
        } else {
            // Add reaction
            comment.reactions[`${type}s`].push(userId);
            comment.reactions.totalCount++;
        }

        await comment.save();

        res.json({
            message: alreadyReacted ? 'Reaction removed' : 'Reaction added',
            reactions: comment.reactions
        });
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

        comment.status = 'spam';
        comment.flagReason = reason || 'Flagged by user';
        comment.flaggedAt = new Date();
        await comment.save();

        res.json({
            message: 'Comment flagged for review',
            commentId
        });
    } catch (error) {
        console.error('Error flagging comment:', error);
        res.status(500).json({ error: 'Failed to flag comment' });
    }
};

// Get comment statistics (admin only)
exports.getCommentStats = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stats = await Comment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            spam: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.json(formattedStats);
    } catch (error) {
        console.error('Error fetching comment stats:', error);
        res.status(500).json({ error: 'Failed to fetch comment statistics' });
    }
};

module.exports = exports;