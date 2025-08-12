// server/controllers/commentController.js
const Comment = require("../models/Comment");
const Story = require("../models/Story");
const crypto = require("crypto");
const DOMPurify = require("isomorphic-dompurify");
const mongoose = require("mongoose");

// Helper function to generate session ID
const generateSessionId = (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const timestamp = Date.now();
    return crypto.createHash('md5').update(`${ip}-${userAgent}-${timestamp}`).digest('hex');
};

// Helper function to get or create session ID
const getSessionId = (req) => {
    // Check if session ID exists in cookies or session
    if (req.session && req.session.commentSessionId) {
        return req.session.commentSessionId;
    }

    // Generate new session ID
    const sessionId = generateSessionId(req);

    // Store in session if available
    if (req.session) {
        req.session.commentSessionId = sessionId;
    }

    return sessionId;
};

// Helper function to sanitize comment content
const sanitizeContent = (content) => {
    // Remove any HTML tags but keep line breaks
    const sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true
    });

    // Convert URLs to links (simple regex)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return sanitized.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

// Get comments for a story
exports.getComments = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { page = 1, limit = 20, sort = 'newest' } = req.query;

        // Verify story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        // Build sort options
        let sortOptions = {};
        switch (sort) {
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'popular':
                sortOptions = { 'reactions.love': -1, 'reactions.thumbsUp': -1 };
                break;
            case 'newest':
            default:
                sortOptions = { createdAt: -1 };
        }

        // Get comments with pagination
        const comments = await Comment.getCommentsForStory(storyId, {
            page: parseInt(page),
            limit: parseInt(limit),
            includeReplies: true,
            status: 'approved'
        });

        // Get total count for pagination
        const totalCount = await Comment.countDocuments({
            storyId,
            status: 'approved',
            parentId: null
        });

        // Add session-specific data (like whether user has voted)
        const sessionId = getSessionId(req);
        comments.forEach(comment => {
            comment.hasVoted = comment.voters &&
                comment.voters.some(v => v.sessionId === sessionId);

            // Process replies too
            if (comment.replies) {
                comment.replies.forEach(reply => {
                    reply.hasVoted = reply.voters &&
                        reply.voters.some(v => v.sessionId === sessionId);
                });
            }
        });

        res.json({
            comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { author, content, parentId } = req.body;

        // Validate story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        // Validate parent comment if replying
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ error: "Parent comment not found" });
            }

            // Don't allow nested replies (only 1 level deep)
            if (parentComment.parentId) {
                return res.status(400).json({ error: "Cannot reply to a reply. Only one level of nesting is allowed." });
            }
        }

        // Get IP and user agent for anti-spam
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        // Check rate limiting (10 comments per hour per IP)
        const isRateLimited = await Comment.checkRateLimit(ipAddress, 10, 60);
        if (isRateLimited) {
            return res.status(429).json({
                error: "Too many comments. Please wait before posting again."
            });
        }

        // Basic spam detection
        const spamKeywords = ['viagra', 'casino', 'lottery', 'click here', 'buy now'];
        const contentLower = content.toLowerCase();
        const isSpam = spamKeywords.some(keyword => contentLower.includes(keyword));

        // Sanitize content
        const sanitizedContent = sanitizeContent(content);

        // Create comment
        const comment = new Comment({
            storyId,
            parentId: parentId || null,
            author: {
                name: author.name.trim(),
                email: author.email ? author.email.trim().toLowerCase() : null,
                website: author.website ? author.website.trim() : null
            },
            content: sanitizedContent,
            status: isSpam ? 'spam' : 'approved', // Auto-moderate spam
            metadata: {
                ipAddress,
                userAgent,
                sessionId: getSessionId(req)
            }
        });

        await comment.save();

        // Update story comment count (denormalized for performance)
        await Story.findByIdAndUpdate(storyId, {
            $inc: { commentCount: 1 }
        });

        // Return the created comment
        res.status(201).json({
            message: "Comment posted successfully",
            comment: {
                ...comment.toObject(),
                hasVoted: false,
                canEdit: true
            }
        });

    } catch (error) {
        console.error("Error creating comment:", error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({ errors });
        }

        res.status(500).json({ error: "Failed to create comment" });
    }
};

// Update a comment (within 5-minute edit window)
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const sessionId = getSessionId(req);

        // Find comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check if comment belongs to this session
        if (comment.metadata.sessionId !== sessionId) {
            return res.status(403).json({ error: "You can only edit your own comments" });
        }

        // Check if still within edit window
        if (!comment.canEdit) {
            return res.status(403).json({ error: "Edit window has expired (5 minutes)" });
        }

        // Save old content to edit history
        if (!comment.metadata.editHistory) {
            comment.metadata.editHistory = [];
        }
        comment.metadata.editHistory.push({
            content: comment.content,
            editedAt: new Date()
        });

        // Update content
        comment.content = sanitizeContent(content);
        await comment.save();

        res.json({
            message: "Comment updated successfully",
            comment
        });

    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ error: "Failed to update comment" });
    }
};

// Delete a comment (soft delete)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const sessionId = getSessionId(req);

        // Find comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check if comment belongs to this session
        if (comment.metadata.sessionId !== sessionId) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        // Soft delete
        await comment.softDelete('user');

        // Update story comment count
        await Story.findByIdAndUpdate(comment.storyId, {
            $inc: { commentCount: -1 }
        });

        res.json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

// Add reaction to a comment
exports.addReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reaction } = req.body;
        const sessionId = getSessionId(req);

        // Validate reaction type
        const validReactions = ['love', 'thumbsUp', 'thumbsDown', 'laugh', 'wow'];
        if (!validReactions.includes(reaction)) {
            return res.status(400).json({ error: "Invalid reaction type" });
        }

        // Find comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Add or update reaction
        await comment.addReaction(reaction, sessionId);

        res.json({
            message: "Reaction added successfully",
            reactions: comment.reactions
        });

    } catch (error) {
        console.error("Error adding reaction:", error);
        res.status(500).json({ error: "Failed to add reaction" });
    }
};

// Flag comment as spam/inappropriate
exports.flagComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason } = req.body;

        // Find comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Flag the comment
        await comment.flag();

        // Log the flag reason (you might want to store this in a separate collection)
        console.log(`Comment ${commentId} flagged for: ${reason}`);

        res.json({ message: "Comment has been flagged for review" });

    } catch (error) {
        console.error("Error flagging comment:", error);
        res.status(500).json({ error: "Failed to flag comment" });
    }
};

// Get comment stats for a story
exports.getCommentStats = async (req, res) => {
    try {
        const { storyId } = req.params;

        const stats = await Comment.aggregate([
            {
                $match: {
                    storyId: new mongoose.Types.ObjectId(storyId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 },
                    totalReactions: {
                        $sum: {
                            $add: [
                                '$reactions.love',
                                '$reactions.thumbsUp',
                                '$reactions.thumbsDown',
                                '$reactions.laugh',
                                '$reactions.wow'
                            ]
                        }
                    },
                    uniqueAuthors: { $addToSet: '$author.email' }
                }
            }
        ]);

        res.json({
            totalComments: stats[0]?.totalComments || 0,
            totalReactions: stats[0]?.totalReactions || 0,
            uniqueAuthors: stats[0]?.uniqueAuthors.filter(e => e).length || 0
        });

    } catch (error) {
        console.error("Error getting comment stats:", error);
        res.status(500).json({ error: "Failed to get comment statistics" });
    }
};