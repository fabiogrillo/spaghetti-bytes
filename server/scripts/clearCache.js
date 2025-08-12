// scripts/clearCache.js
/**
 * Cache clearing utility
 * Clears specific or all cache entries
 */

const CacheManager = require('../server/utils/cacheManager');

async function clearCache(pattern = null) {
    console.log('🗑️  Cache Clearing Utility\n');

    const cache = new CacheManager({
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD
        }
    });

    try {
        // Get stats before clearing
        const statsBefore = cache.getStats();
        console.log('📊 Cache stats before clearing:');
        console.log(`  • Memory keys: ${statsBefore.memory.keys}`);
        console.log(`  • Hit rate: ${(statsBefore.memory.hitRate * 100).toFixed(1)}%\n`);

        // Clear cache
        if (pattern) {
            console.log(`🔍 Clearing cache pattern: ${pattern}`);
            await cache.clearPattern(pattern);
        } else {
            console.log('🧹 Clearing all cache...');
            // Clear all patterns
            await cache.clearPattern('');
        }

        // Get stats after clearing
        const statsAfter = cache.getStats();
        console.log('\n✅ Cache cleared successfully!');
        console.log('📊 Cache stats after clearing:');
        console.log(`  • Memory keys: ${statsAfter.memory.keys}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const pattern = args[0];

if (args.includes('--help')) {
    console.log('Usage: node clearCache.js [pattern]');
    console.log('Examples:');
    console.log('  node clearCache.js          # Clear all cache');
    console.log('  node clearCache.js story    # Clear story cache');
    console.log('  node clearCache.js rss      # Clear RSS cache');
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    clearCache(pattern);
}

module.exports = clearCache;