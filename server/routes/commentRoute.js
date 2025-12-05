// server/routes/commentRoute.js
// Using centralized authentication middleware

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { body, param, validationResult } = require('express-validator');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Public routes
// GET /api/comments/story/:storyId - Get comments for a story
router.get('/story/:storyId',
    [param('storyId').isMongoId().withMessage('Invalid story ID')],
    validate,
    commentController.getComments
);

// POST /api/comments/story/:storyId - Create new comment
router.post('/story/:storyId',
    [
        param('storyId').isMongoId().withMessage('Invalid story ID'),
        body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
        body('author.name').optional().trim().isLength({ max: 100 }),
        body('author.email')
            .optional({ checkFalsy: true })
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
    ],
    validate,
    commentController.createComment
);

// POST /api/comments/:commentId/reaction - Add reaction to comment
router.post('/:commentId/reaction',
    [
        param('commentId').isMongoId().withMessage('Invalid comment ID'),
        body('type').isIn(['like', 'heart', 'clap']).withMessage('Invalid reaction type'),
        body('sessionId').optional().isString()
    ],
    validate,
    commentController.addReaction
);

// POST /api/comments/:commentId/flag - Flag comment for review
router.post('/:commentId/flag',
    [
        param('commentId').isMongoId().withMessage('Invalid comment ID'),
        body('reason').optional().trim().isLength({ max: 500 })
    ],
    validate,
    commentController.flagComment
);

// Admin routes (require authentication)
// GET /api/comments/moderate - Get pending comments for moderation
router.get('/moderate',
    requireAdmin,
    commentController.getPendingComments
);

// GET /api/comments/pending-count - Get count of pending comments (for navbar badge)
router.get('/pending-count',
    requireAdmin,
    commentController.getPendingCount
);

// POST /api/comments/:commentId/approve - Approve comment
router.post('/:commentId/approve',
    requireAdmin,
    [param('commentId').isMongoId().withMessage('Invalid comment ID')],
    validate,
    commentController.approveComment
);

// POST /api/comments/:commentId/reject - Reject comment
router.post('/:commentId/reject',
    requireAdmin,
    [
        param('commentId').isMongoId().withMessage('Invalid comment ID'),
        body('reason').optional().trim().isLength({ max: 500 })
    ],
    validate,
    commentController.rejectComment
);

// DELETE /api/comments/:commentId - Delete comment
router.delete('/:commentId',
    [param('commentId').isMongoId().withMessage('Invalid comment ID')],
    validate,
    commentController.deleteComment
);

// DELETE /api/comments/:commentId/admin - Force delete (admin only)
router.delete('/:commentId/admin',
    requireAdmin,
    [param('commentId').isMongoId().withMessage('Invalid comment ID')],
    validate,
    commentController.adminDeleteComment
);

// GET /api/comments/stats - Get comment statistics (admin only)
router.get('/stats',
    requireAdmin,
    commentController.getCommentStats
);

module.exports = router;