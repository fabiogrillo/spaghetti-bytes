// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for whitelisted IPs (e.g., monitoring services)
        const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
        return whitelist.includes(req.ip);
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Newsletter subscription rate limiter
 * Prevents spam subscriptions
 */
const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 subscription attempts per hour
    message: {
        success: false,
        error: 'Too many subscription attempts. Please try again in an hour.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use IP for key generation (fixed for IPv6)
        // The library handles IPv6 addresses automatically when we don't override
        return req.ip;
    }
});

/**
 * Content creation rate limiter
 * For posts, comments, etc.
 */
const contentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each IP to 30 content creations per hour
    message: {
        success: false,
        error: 'Too many content submissions. Please slow down.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * File upload rate limiter
 * Stricter limits for resource-intensive operations
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: {
        success: false,
        error: 'Too many file uploads. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Search rate limiter
 * Prevents search abuse
 */
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        success: false,
        error: 'Too many search requests. Please wait a moment.',
        retryAfter: 1
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Dynamic rate limiter based on user role
 * Premium users get higher limits
 */
const createDynamicLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: (req) => {
            // Check user role for dynamic limits
            if (req.user) {
                switch (req.user.role) {
                    case 'premium':
                        return options.premiumMax || 500;
                    case 'admin':
                    case 'superadmin':
                        return options.adminMax || 1000;
                    default:
                        return options.defaultMax || 100;
                }
            }
            return options.defaultMax || 100;
        },
        message: {
            success: false,
            error: 'Rate limit exceeded. Please upgrade your account for higher limits.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

module.exports = {
    apiLimiter,
    authLimiter,
    newsletterLimiter,
    contentLimiter,
    uploadLimiter,
    searchLimiter,
    createDynamicLimiter
};