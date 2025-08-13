// server/middleware/cacheRoutes.js - Cache integration for routes

const cache = require('../utils/simpleCache');

/**
 * Cache middleware for different route types
 */

// Cache RSS feeds for 1 hour
const cacheRSS = cache.middleware({
    ttl: 3600,
    keyGenerator: (req) => `rss:${req.originalUrl}`
});

// Cache stories for 10 minutes
const cacheStory = (req, res, next) => {
    // Don't cache for authenticated users (admin)
    if (req.user) {
        return next();
    }

    return cache.middleware({
        ttl: 600,
        keyGenerator: (req) => `story:${req.params.id || req.originalUrl}`
    })(req, res, next);
};

// Cache wall/blog list for 5 minutes
const cacheWall = cache.middleware({
    ttl: 300,
    keyGenerator: (req) => `wall:${req.originalUrl}`
});

// Cache analytics for 5 minutes
const cacheAnalytics = cache.middleware({
    ttl: 300,
    keyGenerator: (req) => `analytics:${req.originalUrl}`
});

// Cache goals for 10 minutes
const cacheGoals = cache.middleware({
    ttl: 600,
    keyGenerator: (req) => `goals:${req.originalUrl}`
});

/**
 * Invalidation functions
 */

// Invalidate story cache when updated
const invalidateStoryCache = (storyId) => {
    cache.clear(`story:${storyId}`);
    cache.clear('wall:');
    cache.clear('rss:');
};

// Invalidate analytics cache
const invalidateAnalyticsCache = () => {
    cache.clear('analytics:');
};

// Invalidate goals cache
const invalidateGoalsCache = () => {
    cache.clear('goals:');
};

/**
 * Admin endpoints for cache management
 */
const cacheAdminRoutes = (app) => {
    // Get cache stats
    app.get('/api/admin/cache/stats', (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json(cache.getStats());
    });

    // Clear cache
    app.post('/api/admin/cache/clear', (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { pattern } = req.body;
        cache.clear(pattern);

        res.json({
            success: true,
            message: pattern ? `Cache cleared for pattern: ${pattern}` : 'All cache cleared',
            stats: cache.getStats()
        });
    });
};

module.exports = {
    cache,
    cacheRSS,
    cacheStory,
    cacheWall,
    cacheAnalytics,
    cacheGoals,
    invalidateStoryCache,
    invalidateAnalyticsCache,
    invalidateGoalsCache,
    cacheAdminRoutes
};