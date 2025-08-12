// server/middleware/cacheIntegration.js

const CacheManager = require('../utils/cacheManager');

// Initialize cache manager with configuration
const cache = new CacheManager({
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        prefix: 'spaghetti:'
    },
    memoryTTL: 300,
    maxKeys: 1000,
    ttl: {
        rss: 3600,        // 1 hour for RSS feeds
        story: 86400,     // 24 hours for stories
        analytics: 300,   // 5 minutes for analytics
        image: 2592000,   // 30 days for images
        api: 60,          // 1 minute for general API
        wall: 600         // 10 minutes for blog wall
    }
});

/**
 * Cache middleware for RSS feeds
 */
const cacheRSS = cache.middleware({
    namespace: 'rss',
    type: 'rss',
    ttl: 3600
});

/**
 * Cache middleware for stories
 */
const cacheStory = (req, res, next) => {
    // Don't cache for authenticated users (admin)
    if (req.user) {
        return next();
    }

    return cache.middleware({
        namespace: 'story',
        type: 'story',
        ttl: 86400
    })(req, res, next);
};

/**
 * Cache middleware for analytics
 */
const cacheAnalytics = cache.middleware({
    namespace: 'analytics',
    type: 'analytics',
    ttl: 300
});

/**
 * Cache middleware for blog wall (story list)
 */
const cacheWall = cache.middleware({
    namespace: 'wall',
    type: 'wall',
    ttl: 600
});

/**
 * Invalidate story cache when updated
 */
const invalidateStoryCache = async (storyId) => {
    await cache.clearPattern(`story:*${storyId}*`);
    await cache.clearPattern('wall:*'); // Clear wall cache too
    await cache.clearPattern('rss:*');  // Clear RSS cache
};

/**
 * Invalidate analytics cache
 */
const invalidateAnalyticsCache = async () => {
    await cache.clearPattern('analytics:*');
};

/**
 * Express route integration example
 */
const setupCachedRoutes = (app) => {
    // RSS Feed routes with caching
    app.get('/api/rss.xml', cacheRSS, require('../controllers/rssController').generateRSSFeed);
    app.get('/api/atom.xml', cacheRSS, require('../controllers/rssController').generateAtomFeed);
    app.get('/api/feed.json', cacheRSS, require('../controllers/rssController').generateJSONFeed);

    // Story routes with caching
    app.get('/api/stories', cacheWall, require('../controllers/storyController').getAllStories);
    app.get('/api/stories/:id', cacheStory, require('../controllers/storyController').getStoryById);

    // Analytics routes with caching
    app.get('/api/newsletter/stats', cacheAnalytics, require('../controllers/newsletterController').getStats);
    app.get('/api/newsletter/analytics', cacheAnalytics, require('../controllers/newsletterController').getAnalytics);

    // Admin routes to clear cache
    app.post('/api/admin/cache/clear', requireAuth, async (req, res) => {
        const { pattern } = req.body;

        if (pattern) {
            await cache.clearPattern(pattern);
        } else {
            // Clear all cache
            await cache.clearPattern('');
        }

        res.json({
            success: true,
            message: 'Cache cleared',
            stats: cache.getStats()
        });
    });

    // Cache statistics endpoint
    app.get('/api/admin/cache/stats', requireAuth, (req, res) => {
        res.json(cache.getStats());
    });
};

/**
 * Service Worker for client-side caching
 */
const serviceWorkerScript = `
// service-worker.js
const CACHE_NAME = 'spaghetti-bytes-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache images and API responses
          if (event.request.url.includes('/images/') || 
              event.request.url.includes('/api/stories/')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

// Helper function for auth check
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

module.exports = {
    cache,
    cacheRSS,
    cacheStory,
    cacheAnalytics,
    cacheWall,
    invalidateStoryCache,
    invalidateAnalyticsCache,
    setupCachedRoutes,
    serviceWorkerScript
};