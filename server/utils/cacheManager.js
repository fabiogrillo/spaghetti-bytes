// server/utils/cacheManager.js

// Install required packages:
// npm install node-cache redis ioredis cache-manager cache-manager-redis-store

const NodeCache = require('node-cache');
const Redis = require('ioredis');
const crypto = require('crypto');

/**
 * Multi-layer Cache Manager
 * 
 * Layers:
 * 1. Memory Cache (L1) - Ultra fast, limited size
 * 2. Redis Cache (L2) - Fast, shared between instances
 * 3. HTTP Cache Headers - Browser caching
 */
class CacheManager {
    constructor(config = {}) {
        // Initialize memory cache
        this.memoryCache = new NodeCache({
            stdTTL: config.memoryTTL || 300, // 5 minutes default
            checkperiod: config.checkPeriod || 60, // Check every minute
            maxKeys: config.maxKeys || 1000, // Limit memory usage
            useClones: false // Better performance
        });

        // Initialize Redis if configured
        if (config.redis) {
            this.redis = new Redis({
                host: config.redis.host || 'localhost',
                port: config.redis.port || 6379,
                password: config.redis.password,
                db: config.redis.db || 0,
                keyPrefix: config.redis.prefix || 'cache:',
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                }
            });

            // Redis error handling
            this.redis.on('error', (err) => {
                console.error('Redis cache error:', err);
                this.redisAvailable = false;
            });

            this.redis.on('connect', () => {
                console.log('Redis cache connected');
                this.redisAvailable = true;
            });
        }

        // Cache configuration
        this.config = {
            // TTL for different content types (in seconds)
            ttl: {
                rss: config.ttl?.rss || 3600,           // 1 hour
                story: config.ttl?.story || 86400,      // 1 day
                analytics: config.ttl?.analytics || 300, // 5 minutes
                image: config.ttl?.image || 2592000,    // 30 days
                api: config.ttl?.api || 60,             // 1 minute
                session: config.ttl?.session || 1800    // 30 minutes
            },

            // Cache key versioning
            version: config.version || '1.0',

            // Enable/disable layers
            layers: {
                memory: config.layers?.memory !== false,
                redis: config.layers?.redis !== false && this.redis,
                http: config.layers?.http !== false
            }
        };

        // Statistics
        this.stats = {
            hits: { memory: 0, redis: 0 },
            misses: { memory: 0, redis: 0 },
            sets: 0,
            deletes: 0
        };
    }

    /**
     * Generate cache key
     */
    generateKey(namespace, identifier, options = {}) {
        const parts = [
            this.config.version,
            namespace,
            identifier
        ];

        // Add query params to key if present
        if (options.query) {
            const queryString = JSON.stringify(options.query);
            const hash = crypto.createHash('md5').update(queryString).digest('hex');
            parts.push(hash.substring(0, 8));
        }

        // Add user-specific key if needed
        if (options.userId) {
            parts.push(`u:${options.userId}`);
        }

        return parts.join(':');
    }

    /**
     * Get value from cache (checks all layers)
     */
    async get(key, options = {}) {
        try {
            // 1. Check memory cache (L1)
            if (this.config.layers.memory) {
                const memoryValue = this.memoryCache.get(key);
                if (memoryValue !== undefined) {
                    this.stats.hits.memory++;
                    return memoryValue;
                }
                this.stats.misses.memory++;
            }

            // 2. Check Redis cache (L2)
            if (this.config.layers.redis && this.redisAvailable) {
                const redisValue = await this.redis.get(key);
                if (redisValue) {
                    this.stats.hits.redis++;

                    // Parse JSON if needed
                    let value;
                    try {
                        value = JSON.parse(redisValue);
                    } catch {
                        value = redisValue;
                    }

                    // Promote to memory cache
                    if (this.config.layers.memory && options.promoteToMemory !== false) {
                        this.memoryCache.set(key, value, options.memoryTTL || 60);
                    }

                    return value;
                }
                this.stats.misses.redis++;
            }

            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set value in cache (sets in all configured layers)
     */
    async set(key, value, ttl = null, options = {}) {
        try {
            this.stats.sets++;

            // Determine TTL
            const finalTTL = ttl || this.config.ttl[options.type] || 300;

            // 1. Set in memory cache
            if (this.config.layers.memory) {
                this.memoryCache.set(key, value, finalTTL);
            }

            // 2. Set in Redis cache
            if (this.config.layers.redis && this.redisAvailable) {
                const serialized = typeof value === 'object'
                    ? JSON.stringify(value)
                    : value;

                await this.redis.setex(key, finalTTL, serialized);
            }

            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Delete from cache
     */
    async delete(key) {
        try {
            this.stats.deletes++;

            // Delete from all layers
            const promises = [];

            if (this.config.layers.memory) {
                this.memoryCache.del(key);
            }

            if (this.config.layers.redis && this.redisAvailable) {
                promises.push(this.redis.del(key));
            }

            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Clear cache by pattern
     */
    async clearPattern(pattern) {
        try {
            // Clear from memory cache
            if (this.config.layers.memory) {
                const keys = this.memoryCache.keys();
                const matchingKeys = keys.filter(key => key.includes(pattern));
                matchingKeys.forEach(key => this.memoryCache.del(key));
            }

            // Clear from Redis
            if (this.config.layers.redis && this.redisAvailable) {
                const keys = await this.redis.keys(`*${pattern}*`);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            }

            return true;
        } catch (error) {
            console.error('Cache clear pattern error:', error);
            return false;
        }
    }

    /**
     * Middleware for Express routes
     */
    middleware(options = {}) {
        return async (req, res, next) => {
            // Skip cache for non-GET requests
            if (req.method !== 'GET') {
                return next();
            }

            // Generate cache key
            const key = this.generateKey(
                options.namespace || 'api',
                req.originalUrl,
                {
                    query: req.query,
                    userId: req.user?.id
                }
            );

            // Check cache
            const cached = await this.get(key, options);
            if (cached) {
                // Set cache headers
                if (this.config.layers.http) {
                    res.set({
                        'X-Cache': 'HIT',
                        'Cache-Control': `public, max-age=${options.ttl || 60}`,
                        'ETag': crypto.createHash('md5').update(JSON.stringify(cached)).digest('hex')
                    });
                }

                return res.json(cached);
            }

            // Cache miss - store original send function
            const originalSend = res.json;
            res.json = (body) => {
                // Cache successful responses
                if (res.statusCode === 200) {
                    this.set(key, body, options.ttl, { type: options.type });
                }

                // Set cache headers
                if (this.config.layers.http) {
                    res.set({
                        'X-Cache': 'MISS',
                        'Cache-Control': `public, max-age=${options.ttl || 60}`
                    });
                }

                return originalSend.call(res, body);
            };

            next();
        };
    }

    /**
     * Decorator for caching function results
     */
    cached(fn, options = {}) {
        return async (...args) => {
            // Generate cache key from function name and arguments
            const key = this.generateKey(
                options.namespace || fn.name || 'function',
                crypto.createHash('md5').update(JSON.stringify(args)).digest('hex')
            );

            // Check cache
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }

            // Execute function
            const result = await fn(...args);

            // Cache result
            await this.set(key, result, options.ttl, options);

            return result;
        };
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const memoryStats = this.memoryCache.getStats();

        return {
            ...this.stats,
            memory: {
                keys: memoryStats.keys,
                hits: memoryStats.hits,
                misses: memoryStats.misses,
                hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) || 0
            },
            redis: {
                available: this.redisAvailable,
                hitRate: this.stats.hits.redis / (this.stats.hits.redis + this.stats.misses.redis) || 0
            }
        };
    }

    /**
     * Warmup cache with critical data
     */
    async warmup() {
        console.log('Starting cache warmup...');

        try {
            // Add your warmup logic here
            // Example: preload popular stories, RSS feed, etc.

            console.log('Cache warmup completed');
        } catch (error) {
            console.error('Cache warmup error:', error);
        }
    }
}

module.exports = CacheManager;