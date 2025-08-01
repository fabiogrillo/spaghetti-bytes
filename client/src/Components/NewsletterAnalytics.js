import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../Api'; // Import the Api module
import {
    BiTrendingUp, BiEnvelope, BiUserCheck, BiTime,
    BiBarChart, BiGlobe
} from 'react-icons/bi';
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const NewsletterAnalytics = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('7d');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data generator for growth trends
    const generateGrowthData = (range) => {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const data = [];
        let subscribers = 1000;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            subscribers += Math.floor(Math.random() * 20) - 5;
            data.push({
                date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                subscribers: Math.max(0, subscribers),
                opens: Math.floor(Math.random() * 40) + 10,
                clicks: Math.floor(Math.random() * 20) + 5
            });
        }
        return data;
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                // Use the api module instead of direct fetch
                const response = await api.get(`/newsletter/analytics?range=${timeRange}`);

                // Mock data for demonstration
                const mockData = {
                    stats: {
                        totalSubscribers: 1243,
                        activeSubscribers: 1156,
                        avgOpenRate: 32.5,
                        avgClickRate: 8.7,
                        totalCampaigns: 24,
                        totalEmailsSent: 26581
                    },
                    growthData: generateGrowthData(timeRange),
                    campaignPerformance: [
                        { name: 'Welcome Series', openRate: 45.2, clickRate: 12.5, sent: 342 },
                        { name: 'Weekly Digest #1', openRate: 28.3, clickRate: 9.1, sent: 1156 },
                        { name: 'Special Announcement', openRate: 38.7, clickRate: 15.2, sent: 1156 },
                        { name: 'Weekly Digest #2', openRate: 25.1, clickRate: 7.8, sent: 1142 },
                        { name: 'Year in Review', openRate: 41.3, clickRate: 11.9, sent: 1098 }
                    ],
                    sourceBreakdown: [
                        { name: 'Homepage', value: 45, color: '#FF6B9D' },
                        { name: 'Blog Posts', value: 30, color: '#4ECDC4' },
                        { name: 'About Page', value: 15, color: '#FFC107' },
                        { name: 'Direct', value: 10, color: '#9B59B6' }
                    ],
                    topLocations: [
                        { country: 'United States', subscribers: 412, percentage: 33 },
                        { country: 'United Kingdom', subscribers: 198, percentage: 16 },
                        { country: 'Canada', subscribers: 149, percentage: 12 },
                        { country: 'Germany', subscribers: 112, percentage: 9 },
                        { country: 'France', subscribers: 87, percentage: 7 }
                    ],
                    engagementByDay: [
                        { day: 'Mon', opens: 22, clicks: 8 },
                        { day: 'Tue', opens: 28, clicks: 10 },
                        { day: 'Wed', opens: 32, clicks: 12 },
                        { day: 'Thu', opens: 29, clicks: 11 },
                        { day: 'Fri', opens: 25, clicks: 9 },
                        { day: 'Sat', opens: 18, clicks: 6 },
                        { day: 'Sun', opens: 16, clicks: 5 }
                    ]
                };

                const safeData = {
                    ...mockData,
                    ...response.data
                };

                setAnalytics(safeData);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                // Use mock data on error for better UX
                setAnalytics({
                    stats: {
                        totalSubscribers: 1243,
                        activeSubscribers: 1156,
                        avgOpenRate: 32.5,
                        avgClickRate: 8.7,
                        totalCampaigns: 24,
                        totalEmailsSent: 26581
                    },
                    growthData: generateGrowthData(timeRange),
                    campaignPerformance: [],
                    sourceBreakdown: [],
                    topLocations: [],
                    engagementByDay: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, change, color }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
                    <Icon className={`text-2xl ${color.replace('bg-', 'text-')}`} />
                </div>
                {change && (
                    <span className={`text-sm font-bold ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{label}</p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BiBarChart className="text-cartoon-pink" />
                                Newsletter Analytics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Track your newsletter performance and growth
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="select select-bordered rounded-cartoon"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                            </select>

                            <button
                                onClick={() => navigate('/manager')}
                                className="btn btn-ghost rounded-cartoon"
                            >
                                <BsArrowLeft /> Back
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={BiUserCheck}
                        label="Total Subscribers"
                        value={analytics.stats.totalSubscribers.toLocaleString()}
                        change={5.2}
                        color="bg-cartoon-pink"
                    />
                    <StatCard
                        icon={BiEnvelope}
                        label="Avg Open Rate"
                        value={`${analytics.stats.avgOpenRate}%`}
                        change={2.1}
                        color="bg-cartoon-blue"
                    />
                    <StatCard
                        icon={BiTrendingUp}
                        label="Avg Click Rate"
                        value={`${analytics.stats.avgClickRate}%`}
                        change={-0.5}
                        color="bg-cartoon-yellow"
                    />
                    <StatCard
                        icon={BiTime}
                        label="Active Subscribers"
                        value={analytics.stats.activeSubscribers.toLocaleString()}
                        change={3.8}
                        color="bg-cartoon-purple"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Subscriber Growth</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.growthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="subscribers"
                                    stroke="#FF6B9D"
                                    strokeWidth={2}
                                    name="Subscribers"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Engagement Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Engagement by Day</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.engagementByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="opens" fill="#4ECDC4" name="Opens" />
                                <Bar dataKey="clicks" fill="#FFC107" name="Clicks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Source Breakdown & Campaign Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Source Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Subscriber Sources</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.sourceBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label
                                >
                                    {analytics.sourceBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Top Locations */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BiGlobe className="text-cartoon-pink" />
                            Top Locations
                        </h3>
                        <div className="space-y-3">
                            {analytics.topLocations.map((location, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400">#{index + 1}</span>
                                        <span className="font-medium">{location.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {location.subscribers} subscribers
                                        </span>
                                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-cartoon-pink h-2 rounded-full"
                                                style={{ width: `${location.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Campaign Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                >
                    <h3 className="text-xl font-bold mb-4">Recent Campaign Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Sent</th>
                                    <th>Open Rate</th>
                                    <th>Click Rate</th>
                                    <th>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.campaignPerformance.map((campaign, index) => (
                                    <tr key={index}>
                                        <td className="font-medium">{campaign.name}</td>
                                        <td>{campaign.sent.toLocaleString()}</td>
                                        <td>
                                            <span className={`font-bold ${campaign.openRate > 30 ? 'text-green-500' : 'text-orange-500'
                                                }`}>
                                                {campaign.openRate}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`font-bold ${campaign.clickRate > 10 ? 'text-green-500' : 'text-orange-500'
                                                }`}>
                                                {campaign.clickRate}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-cartoon-blue h-2 rounded-full"
                                                        style={{ width: `${campaign.openRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NewsletterAnalytics;