const Analytics = require("../models/Analytics");

const getAnalyticsData = async (req, res) => {
    try {
        const { timeRange } = req.query;

        // Calcola date range
        const endDate = new Date();
        const startDate = new Date();

        switch (timeRange) {
            case 'day':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Aggregazione dati
        const stats = await Analytics.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalVisitors: { $addToSet: "$sessionId" },
                    pageViews: { $sum: 1 },
                    avgSessionDuration: { $avg: "$timeOnPage" }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAnalyticsData };