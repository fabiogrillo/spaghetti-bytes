const Analytics = require("../models/Analytics");

const getAnalyticsData = async (req, res) => {
    try {
        const { range } = req.query;

        // Temporaneamente mockato — da sostituire con dati reali se disponibili
        const data = {
            overview: {
                totalSubscribers: 1234,
                growthRate: 4.7,
                avgOpenRate: 56.2,
                avgClickRate: 23.1,
            },
            growthData: [
                { date: "2025-07-25", value: 10 },
                { date: "2025-07-26", value: 20 },
                { date: "2025-07-27", value: 25 },
                { date: "2025-07-28", value: 30 },
                { date: "2025-07-29", value: 35 },
                { date: "2025-07-30", value: 40 },
                { date: "2025-07-31", value: 45 },
            ],
            sourceBreakdown: [
                { name: "Organic", value: 55, color: "#FF6B9D" },
                { name: "Paid Ads", value: 25, color: "#4ECDC4" },
                { name: "Social Media", value: 20, color: "#FFC107" },
            ],
            campaignPerformance: [
                { name: "Campaign A", openRate: 70, clickRate: 30 },
                { name: "Campaign B", openRate: 60, clickRate: 25 },
            ],
            topLocations: [
                { location: "USA", subscribers: 500 },
                { location: "Italy", subscribers: 300 },
                { location: "UK", subscribers: 200 },
            ],
            engagementByDay: [
                { day: "Mon", value: 20 },
                { day: "Tue", value: 30 },
                { day: "Wed", value: 40 },
                { day: "Thu", value: 35 },
                { day: "Fri", value: 50 },
                { day: "Sat", value: 45 },
                { day: "Sun", value: 25 },
            ],
        };

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAnalyticsData };