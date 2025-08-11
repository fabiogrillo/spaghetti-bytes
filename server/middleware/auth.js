const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 * This middleware checks for a valid JWT token in either:
 * - Authorization header (Bearer token)
 * - Cookie (for session-based auth)
 */
const requireAuth = async (req, res, next) => {
    try {
        // Extract token from Authorization header or cookies
        let token;
        
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        // If no token in header, check cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        // If still no token, check session (for passport.js compatibility)
        if (!token && req.isAuthenticated && req.isAuthenticated()) {
            // User is authenticated via passport session
            req.user = req.user || {};
            req.userId = req.user._id || req.user.id;
            return next();
        }
        
        // No token found anywhere
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please login to access this resource.'
            });
        }
        
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        
        // Find user and attach to request
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found. Invalid token.'
            });
        }
        
        // Check if user is still active
        if (user.status === 'banned' || user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                error: 'Account suspended or banned. Contact support.'
            });
        }
        
        // Attach user to request
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. Please login again.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        
        // Generic error
        return res.status(500).json({
            success: false,
            error: 'Authentication failed. Please try again.'
        });
    }
};

/**
 * Middleware to check if user has admin privileges
 * Must be used AFTER requireAuth middleware
 */
const requireAdmin = async (req, res, next) => {
    try {
        // Ensure user is authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        // Check admin role
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Admin privileges required for this action'
            });
        }
        
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authorization check failed'
        });
    }
};

/**
 * Middleware for optional authentication
 * Attaches user if authenticated, but doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
    try {
        // Extract token from various sources
        let token;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token && req.isAuthenticated && req.isAuthenticated()) {
            req.user = req.user || {};
            req.userId = req.user._id || req.user.id;
            return next();
        }
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User.findById(decoded.userId).select('-password');
                if (user) {
                    req.user = user;
                    req.userId = user._id;
                }
            } catch (err) {
                // Token invalid, but continue without user
                console.log('Optional auth: Invalid token, continuing without user');
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continue even if there's an error
    }
};

module.exports = {
    requireAuth,
    requireAdmin,
    optionalAuth
};