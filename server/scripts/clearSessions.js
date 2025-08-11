// server/scripts/clearSessions.js
// Run this script to clear all sessions from MongoDB
// Usage: node server/scripts/clearSessions.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearSessions() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get the sessions collection
        const db = mongoose.connection.db;
        const sessionsCollection = db.collection('sessions');

        // Count existing sessions
        const count = await sessionsCollection.countDocuments();
        console.log(`📊 Found ${count} sessions in database`);

        if (count > 0) {
            // Delete all sessions
            const result = await sessionsCollection.deleteMany({});
            console.log(`🗑️  Deleted ${result.deletedCount} sessions`);
        }

        console.log('✨ Session cleanup complete');

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
clearSessions();