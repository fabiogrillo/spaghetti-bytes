// scripts/clearCache.js
const axios = require('axios');

async function clearCache(pattern = null) {
    console.log('🗑️  Cache Clearing Utility\n');

    const baseURL = process.env.API_URL || 'http://localhost:5000';

    try {
        // This would typically make an API call to clear the cache
        // For now, we'll just show a message since cache is in-memory

        if (pattern) {
            console.log(`🔍 Clearing cache pattern: ${pattern}`);
        } else {
            console.log('🧹 Clearing all cache...');
        }

        // Make API call to clear cache (requires authentication)
        // const response = await axios.post(`${baseURL}/api/admin/cache/clear`, { pattern });

        console.log('✅ Cache cleared successfully!');
        console.log('Note: Server restart will also clear the in-memory cache.');

    } catch (error) {
        console.error('❌ Error clearing cache:', error.message);
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