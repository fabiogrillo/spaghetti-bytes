const { body, param, query, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Handle validation errors
 * Extracts validation errors and sends formatted response
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

/**
 * Newsletter validation rules
 */
const newsletterValidation = {
    subscribe: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
            .isLength({ max: 255 })
            .withMessage('Email address too long'),
        body('source')
            .optional()
            .isIn(['website', 'blog', 'social', 'referral', 'other'])
            .withMessage('Invalid source'),
        body('referrer')
            .optional()
            .isURL()
            .withMessage('Invalid referrer URL'),
        handleValidationErrors
    ],

    unsubscribe: [
        param('token')
            .isString()
            .isLength({ min: 20, max: 100 })
            .withMessage('Invalid unsubscribe token'),
        handleValidationErrors
    ],

    confirmSubscription: [
        param('token')
            .isString()
            .isLength({ min: 20, max: 100 })
            .withMessage('Invalid confirmation token'),
        handleValidationErrors
    ]
};

/**
 * Campaign validation rules
 */
const campaignValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Campaign name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Campaign name must be between 3 and 100 characters'),
        body('subject')
            .trim()
            .notEmpty()
            .withMessage('Email subject is required')
            .isLength({ min: 5, max: 200 })
            .withMessage('Subject must be between 5 and 200 characters'),
        body('content')
            .notEmpty()
            .withMessage('Email content is required')
            .isLength({ max: 50000 })
            .withMessage('Content too long (max 50,000 characters)'),
        body('scheduledFor')
            .optional()
            .isISO8601()
            .withMessage('Invalid date format')
            .custom((value) => {
                if (new Date(value) < new Date()) {
                    throw new Error('Scheduled date must be in the future');
                }
                return true;
            }),
        body('segments')
            .optional()
            .isArray()
            .withMessage('Segments must be an array'),
        handleValidationErrors
    ],

    send: [
        param('campaignId')
            .isMongoId()
            .withMessage('Invalid campaign ID'),
        body('testEmail')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid test email address'),
        handleValidationErrors
    ]
};

/**
 * Authentication validation rules
 */
const authValidation = {
    register: [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
        handleValidationErrors
    ],

    login: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        handleValidationErrors
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain uppercase, lowercase, number, and special character')
            .custom((value, { req }) => value !== req.body.currentPassword)
            .withMessage('New password must be different from current password'),
        handleValidationErrors
    ]
};

/**
 * Content validation rules
 */
const contentValidation = {
    createPost: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be between 5 and 200 characters')
            .escape(), // Prevent XSS
        body('content')
            .notEmpty()
            .withMessage('Content is required')
            .isLength({ min: 50, max: 100000 })
            .withMessage('Content must be between 50 and 100,000 characters'),
        body('tags')
            .optional()
            .isArray({ max: 10 })
            .withMessage('Maximum 10 tags allowed'),
        body('tags.*')
            .optional()
            .isString()
            .isLength({ max: 50 })
            .withMessage('Tag too long')
            .matches(/^[a-zA-Z0-9-]+$/)
            .withMessage('Tags can only contain letters, numbers, and hyphens'),
        handleValidationErrors
    ],

    updatePost: [
        param('id')
            .isMongoId()
            .withMessage('Invalid post ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be between 5 and 200 characters')
            .escape(),
        body('content')
            .optional()
            .isLength({ min: 50, max: 100000 })
            .withMessage('Content must be between 50 and 100,000 characters'),
        handleValidationErrors
    ]
};

/**
 * Query parameter validation
 */
const queryValidation = {
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
            .toInt(),
        query('sort')
            .optional()
            .isIn(['asc', 'desc', 'newest', 'oldest', 'popular'])
            .withMessage('Invalid sort option'),
        handleValidationErrors
    ],

    search: [
        query('q')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Search query must be between 2 and 100 characters')
            .escape(),
        query('category')
            .optional()
            .isIn(['all', 'posts', 'pages', 'users', 'comments'])
            .withMessage('Invalid search category'),
        handleValidationErrors
    ]
};

/**
 * File upload validation
 */
const fileValidation = {
    image: (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
            });
        }

        // Check file size (5MB limit)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 5MB'
            });
        }

        next();
    }
};

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 */
const sanitizeMongo = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Attempted NoSQL injection in ${key} from IP: ${req.ip}`);
    }
});

/**
 * Custom validators
 */
const customValidators = {
    isValidDate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    },

    isStrongPassword: (password) => {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongRegex.test(password);
    },

    sanitizeHtml: (html) => {
        // Basic HTML sanitization - in production, use a library like DOMPurify
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/on\w+\s*=\s*'[^']*'/gi, '');
    }
};

module.exports = {
    handleValidationErrors,
    newsletterValidation,
    campaignValidation,
    authValidation,
    contentValidation,
    queryValidation,
    fileValidation,
    sanitizeMongo,
    customValidators
};