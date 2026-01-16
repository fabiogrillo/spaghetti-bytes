// server/controllers/analyticsController.js
// Analytics controller for dashboard statistics

const Story = require('../models/Story');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get story count
        const totalStories = await Story.countDocuments({ published: true });

        // Get stories from last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStories = await Story.countDocuments({
            published: true,
            createdAt: { $gte: lastMonth }
        });

        // Get goals count
        const totalGoals = await Goal.countDocuments();
        const completedGoals = await Goal.countDocuments({ completed: true });

        // Get user/visitor statistics
        const registeredUsers = await User.countDocuments();
        const uniqueConversations = await Conversation.countDocuments();
        const estimatedVisitors = registeredUsers + uniqueConversations;

        // Get recent activity metrics
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const recentActivity = {
            stories: await Story.countDocuments({
                published: true,
                createdAt: { $gte: last7Days }
            }),
            goals: await Goal.countDocuments({
                createdAt: { $gte: last7Days }
            })
        };

        res.json({
            stats: {
                stories: {
                    total: totalStories,
                    lastMonth: lastMonthStories,
                    recent: recentActivity.stories
                },
                goals: {
                    total: totalGoals,
                    completed: completedGoals,
                    recent: recentActivity.goals
                },
                visitors: {
                    total: estimatedVisitors,
                    registered: registeredUsers,
                    anonymous: uniqueConversations
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

// Get quick stats (lighter version for components)
exports.getQuickStats = async (req, res) => {
    try {
        const [stories, goals, users] = await Promise.all([
            Story.countDocuments(),
            Goal.countDocuments(),
            User.countDocuments()
        ]);

        const conversations = await Conversation.countDocuments();
        const visitors = users + conversations;

        res.json({
            stories,
            goals,
            visitors
        });
    } catch (error) {
        console.error('Error fetching quick stats:', error);
        res.status(500).json({ error: 'Failed to fetch quick statistics' });
    }
};

// Get trending content
exports.getTrendingContent = async (req, res) => {
    try {
        const trendingStories = await Story.find({ published: true })
            .sort({ views: -1 })
            .limit(5)
            .select('title slug views');

        res.json({
            trendingStories
        });
    } catch (error) {
        console.error('Error fetching trending content:', error);
        res.status(500).json({ error: 'Failed to fetch trending content' });
    }
};

module.exports = exports;
