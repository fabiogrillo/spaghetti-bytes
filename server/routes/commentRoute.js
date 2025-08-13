// server/routes/commentRoute.js - FIXED VERSION
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { body, param, validationResult } = require("express-validator");


// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}; 

// Middleware per autenticazione admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Admin authentication required' });
};

// GET /api/comments/moderate - Elenco commenti da moderare (pending/spam)
router.get(
    '/moderate',
    isAdmin,
    async (req, res) => {
        const Comment = require('../models/Comment');
        try {
            const comments = await Comment.find({ status: { $in: ['pending', 'spam'] } })
                .sort({ createdAt: -1 })
                .limit(100);
            res.json({ comments });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch comments for moderation' });
        }
    }
);

// POST /api/comments/:commentId/approve - Approva commento
router.post(
    '/:commentId/approve',
    isAdmin,
    [param('commentId').isMongoId().withMessage('Invalid comment ID')],
    validate,
    async (req, res) => {
        const Comment = require('../models/Comment');
        try {
            const comment = await Comment.findById(req.params.commentId);
            if (!comment) return res.status(404).json({ error: 'Comment not found' });
            comment.status = 'approved';
            await comment.save();
            res.json({ message: 'Comment approved', comment });
        } catch (error) {
            res.status(500).json({ error: 'Failed to approve comment' });
        }
    }
);

// DELETE /api/comments/:commentId/admin - Elimina commento (admin)
router.delete(
    '/:commentId/admin',
    isAdmin,
    [param('commentId').isMongoId().withMessage('Invalid comment ID')],
    validate,
    async (req, res) => {
        const Comment = require('../models/Comment');
        try {
            const comment = await Comment.findById(req.params.commentId);
            if (!comment) return res.status(404).json({ error: 'Comment not found' });
            await comment.softDelete('admin');
            res.json({ message: 'Comment deleted by admin' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete comment' });
        }
    }
);

// Validation rules - FIXED parentId validation
const commentValidation = [
    body("author.name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    body("author.email")
        .optional({ checkFalsy: true })
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),
    body("author.website")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("Please provide a valid URL"),
    body("content")
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage("Comment must be between 1 and 5000 characters"),
    body("parentId")
        .optional({ nullable: true })  // ← FIX: Allow null values
        .custom((value) => {
            // Only validate if value is not null
            if (value !== null && value !== undefined && value !== '') {
                // Check if it's a valid MongoDB ObjectId
                const ObjectId = require('mongoose').Types.ObjectId;
                if (!ObjectId.isValid(value)) {
                    throw new Error("Invalid parent comment ID");
                }
            }
            return true;
        })
];

const reactionValidation = [
    body("reaction")
        .isIn(["love", "thumbsUp", "thumbsDown", "laugh", "wow"])
        .withMessage("Invalid reaction type")
];

// Routes
// GET /api/comments/story/:storyId - Get all comments for a story
router.get(
    "/story/:storyId",
    [
        param("storyId").isMongoId().withMessage("Invalid story ID")
    ],
    validate,
    commentController.getComments
);

// POST /api/comments/story/:storyId - Create a new comment
router.post(
    "/story/:storyId",
    [
        param("storyId").isMongoId().withMessage("Invalid story ID"),
        ...commentValidation
    ],
    validate,
    commentController.createComment
);

// PUT /api/comments/:commentId - Update a comment (within edit window)
router.put(
    "/:commentId",
    [
        param("commentId").isMongoId().withMessage("Invalid comment ID"),
        body("content")
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Comment must be between 1 and 5000 characters")
    ],
    validate,
    commentController.updateComment
);

// DELETE /api/comments/:commentId - Delete a comment (soft delete)
router.delete(
    "/:commentId",
    [
        param("commentId").isMongoId().withMessage("Invalid comment ID")
    ],
    validate,
    commentController.deleteComment
);

// POST /api/comments/:commentId/reaction - Add a reaction to a comment
router.post(
    "/:commentId/reaction",
    [
        param("commentId").isMongoId().withMessage("Invalid comment ID"),
        ...reactionValidation
    ],
    validate,
    commentController.addReaction
);

// POST /api/comments/:commentId/flag - Flag a comment as inappropriate
router.post(
    "/:commentId/flag",
    [
        param("commentId").isMongoId().withMessage("Invalid comment ID"),
        body("reason")
            .optional()
            .isString()
            .isLength({ max: 500 })
            .withMessage("Reason must be less than 500 characters")
    ],
    validate,
    commentController.flagComment
);

// GET /api/comments/story/:storyId/stats - Get comment statistics for a story
router.get(
    "/story/:storyId/stats",
    [
        param("storyId").isMongoId().withMessage("Invalid story ID")
    ],
    validate,
    commentController.getCommentStats
);

module.exports = router;