// server/routes/commentRoute.js
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

// Validation rules
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
        .optional()
        .isMongoId()
        .withMessage("Invalid parent comment ID")
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