// server/utils/simpleCache.js - Simple in-memory cache for Vercel

/**
 * Simple in-memory cache implementation
 * Note: This cache is per-instance and will be cleared on each deployment
 * Perfect for Vercel serverless functions
 */
class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    /**
     * Get a value from cache
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        return item.value;
    }

    /**
     * Set a value in cache with optional TTL (in seconds)
     */
    set(key, value, ttl = 3600) {
        const expiry = ttl ? Date.now() + (ttl * 1000) : null;
        this.cache.set(key, { value, expiry });
        this.stats.sets++;

        // Limit cache size to prevent memory issues
        if (this.cache.size > 1000) {
            this.cleanup();
        }
    }

    /**
     * Delete a key from cache
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) this.stats.deletes++;
        return deleted;
    }

    /**
     * Clear entire cache or by pattern
     */
    clear(pattern = null) {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        // Clear keys matching pattern
        for (const [key] of this.cache) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache) {
            if (item.expiry && now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: (hitRate * 100).toFixed(2) + '%'
        };
    }

    /**
     * Express middleware for caching
     */
    middleware(options = {}) {
        const { ttl = 300, keyGenerator } = options;

        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            // Generate cache key
            const key = keyGenerator ? keyGenerator(req) : req.originalUrl;

            // Check cache
            const cached = this.get(key);
            if (cached) {
                res.set('X-Cache', 'HIT');
                return res.json(cached);
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache the response
            res.json = (body) => {
                // Only cache successful responses
                if (res.statusCode === 200) {
                    this.set(key, body, ttl);
                }
                res.set('X-Cache', 'MISS');
                return originalJson(body);
            };

            next();
        };
    }
}

// Create singleton instance
const cache = new SimpleCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
    cache.cleanup();
}, 5 * 60 * 1000);

module.exports = cache;