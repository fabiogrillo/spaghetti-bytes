/**
 * Cache warmup script
 * Pre-loads frequently accessed data into cache
 */

const CacheManager = require('../server/utils/cacheManager');
const axios = require('axios');

async function warmupCache() {
    console.log('🔥 Starting cache warmup...\n');

    const cache = new CacheManager({
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD
        }
    });

    const baseURL = process.env.API_URL || 'http://localhost:5000';
    const warmupTasks = [
        {
            name: 'RSS Feed',
            endpoints: ['/api/rss.xml', '/api/atom.xml', '/api/feed.json']
        },
        {
            name: 'Recent Stories',
            endpoints: ['/api/stories?limit=10']
        },
        {
            name: 'Newsletter Stats',
            endpoints: ['/api/newsletter/stats']
        }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const task of warmupTasks) {
        console.log(`📦 Warming up: ${task.name}`);

        for (const endpoint of task.endpoints) {
            try {
                const startTime = Date.now();
                const response = await axios.get(`${baseURL}${endpoint}`);
                const duration = Date.now() - startTime;

                // Cache the response
                const key = cache.generateKey('warmup', endpoint);
                await cache.set(key, response.data, 3600);

                console.log(`  ✅ ${endpoint} (${duration}ms)`);
                successCount++;
            } catch (error) {
                console.error(`  ❌ ${endpoint}: ${error.message}`);
                errorCount++;
            }
        }
        console.log('');
    }

    // Warmup popular story pages
    try {
        console.log('📖 Warming up popular stories...');
        const storiesResponse = await axios.get(`${baseURL}/api/stories?limit=5`);
        const stories = storiesResponse.data;

        for (const story of stories) {
            try {
                const response = await axios.get(`${baseURL}/api/stories/${story._id}`);
                const key = cache.generateKey('story', story._id);
                await cache.set(key, response.data, 86400);
                console.log(`  ✅ Story: ${story.title}`);
                successCount++;
            } catch (error) {
                console.error(`  ❌ Story ${story._id}: ${error.message}`);
                errorCount++;
            }
        }
    } catch (error) {
        console.error('❌ Failed to warmup stories:', error.message);
    }

    // Summary
    console.log('\n════════════════════════════════════════');
    console.log('📊 Cache Warmup Summary:');
    console.log(`  • Successful: ${successCount}`);
    console.log(`  • Failed: ${errorCount}`);
    console.log(`  • Total: ${successCount + errorCount}`);
    console.log('════════════════════════════════════════\n');

    process.exit(errorCount > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
    warmupCache();
}

module.exports = warmupCache;