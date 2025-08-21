// server/controllers/analyticsController.js
// Analytics controller for dashboard statistics

const Story = require('../models/Story');
const Comment = require('../models/Comment');
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

        // Get comment statistics
        const totalComments = await Comment.countDocuments();
        const approvedComments = await Comment.countDocuments({ status: 'approved' });
        const pendingComments = await Comment.countDocuments({ status: 'pending' });

        // Get goals count
        const totalGoals = await Goal.countDocuments();
        const completedGoals = await Goal.countDocuments({ completed: true });

        // Get user/visitor statistics
        // For now, we'll count registered users + estimate visitors from conversations
        const registeredUsers = await User.countDocuments();
        const uniqueConversations = await Conversation.countDocuments();

        // Estimate total visitors (registered users + unique chat sessions)
        const estimatedVisitors = registeredUsers + uniqueConversations;

        // Get recent activity metrics
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const recentActivity = {
            stories: await Story.countDocuments({
                published: true,
                createdAt: { $gte: last7Days }
            }),
            comments: await Comment.countDocuments({
                createdAt: { $gte: last7Days }
            }),
            goals: await Goal.countDocuments({
                createdAt: { $gte: last7Days }
            })
        };

        // Calculate engagement metrics
        const storiesWithComments = await Story.countDocuments({
            published: true,
            commentsCount: { $gt: 0 }
        });

        const engagementRate = totalStories > 0
            ? Math.round((storiesWithComments / totalStories) * 100)
            : 0;

        res.json({
            stats: {
                stories: {
                    total: totalStories,
                    lastMonth: lastMonthStories,
                    recent: recentActivity.stories
                },
                comments: {
                    total: totalComments,
                    approved: approvedComments,
                    pending: pendingComments,
                    recent: recentActivity.comments
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
                },
                engagement: {
                    rate: engagementRate,
                    storiesWithComments
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
        const [stories, comments, goals, users] = await Promise.all([
            Story.countDocuments(),
            Comment.countDocuments(),
            Goal.countDocuments(),
            User.countDocuments()
        ]);

        // Get unique visitors from localStorage data if available
        // In production, you'd track this with analytics
        const conversations = await Conversation.countDocuments();
        const visitors = users + conversations;

        res.json({
            stories,
            comments,
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
        // Get most viewed stories (assuming you track views)
        const trendingStories = await Story.find({ published: true })
            .sort({ views: -1, commentsCount: -1 })
            .limit(5)
            .select('title slug views commentsCount');

        // Get most active commenters
        const activeCommenters = await Comment.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$author.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            trendingStories,
            activeCommenters
        });
    } catch (error) {
        console.error('Error fetching trending content:', error);
        res.status(500).json({ error: 'Failed to fetch trending content' });
    }
};

module.exports = exports;