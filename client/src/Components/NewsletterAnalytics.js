import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    BiTrendingUp, BiTrendingDown, BiEnvelope, BiUser,
    BiCheck, BiMouse, BiMapPin
} from 'react-icons/bi';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import api from '../Api';
import { BiBarChart } from 'react-icons/bi';

const NewsletterAnalytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get(`/api/newsletter/analytics?range=${timeRange}`);
                setAnalyticsData(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
            </div>
        );
    }

    // Mock data for demonstration
    const mockData = {
        overview: {
            totalSubscribers: 1247,
            activeSubscribers: 1156,
            monthlyGrowth: 12.5,
            avgOpenRate: 24.5,
            avgClickRate: 8.3,
            totalCampaigns: 23,
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
        ...analyticsData,
        sourceBreakdown: (analyticsData?.sourceBreakdown || mockData.sourceBreakdown).map((entry, index) => ({
            ...entry,
            color: entry.color || mockData.sourceBreakdown[index % mockData.sourceBreakdown.length].color
        }))
    };

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl text-gray-800 font-bold flex items-center gap-2">
                                <BiBarChart className="text-cartoon-pink" />
                                Newsletter Analytics
                            </h1>
                            <p className="text-gray-800">
                                Track performance and grow your audience
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {['7d', '30d', '90d', '1y'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`btn btn-sm text-gray-600 ${timeRange === range
                                        ? 'bg-cartoon-pink '
                                        : 'btn-ghost'
                                        } rounded-cartoon`}
                                >
                                    {range === '7d' && 'Week'}
                                    {range === '30d' && 'Month'}
                                    {range === '90d' && 'Quarter'}
                                    {range === '1y' && 'Year'}
                                </button>
                            ))}
                            : {(
                                <p className="text-gray-800 text-center py-4">No campaign data available yet</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-500">
                    <MetricCard
                        title="Total Subscribers"
                        value={safeData.overview.totalSubscribers}
                        change={safeData.overview.monthlyGrowth}
                        icon={BiUser}
                        color="cartoon-pink"
                    />
                    <MetricCard
                        title="Active Subscribers"
                        value={safeData.overview.activeSubscribers}
                        subtitle={`${((safeData.overview.activeSubscribers / safeData.overview.totalSubscribers) * 100).toFixed(1)}% active`}
                        icon={BiCheck}
                        color="cartoon-green"
                    />
                    <MetricCard
                        title="Avg. Open Rate"
                        value={`${safeData.overview.avgOpenRate}%`}
                        change={2.3}
                        icon={BiEnvelope}
                        color="cartoon-blue"
                    />
                    <MetricCard
                        title="Avg. Click Rate"
                        value={`${safeData.overview.avgClickRate}%`}
                        change={-0.8}
                        icon={BiMouse}
                        color="cartoon-yellow"
                    />
                </div>

                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6"
                >
                    <h2 className="text-xl text-gray-700 font-bold mb-4">Subscriber Growth</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={safeData.growthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="subscribers"
                                stroke="#FF6B9D"
                                strokeWidth={3}
                                dot={{ fill: '#FF6B9D' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="active"
                                stroke="#4ECDC4"
                                strokeWidth={3}
                                dot={{ fill: '#4ECDC4' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Performance */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white text-gray-600 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h2 className="text-xl font-bold mb-4">Campaign Performance</h2>
                        <div className="space-y-3">
                            {safeData.campaignPerformance && safeData.campaignPerformance.length > 0 ? (
                                safeData.campaignPerformance.map((campaign, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium truncate flex-1 mr-2">
                                                {campaign.name}
                                            </span>
                                            <span className="text-sm text-gray-800">
                                                {campaign.sent} sent
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Open Rate</span>
                                                    <span>{campaign.openRate}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-cartoon-pink h-2 rounded-full"
                                                        style={{ width: `${campaign.openRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Click Rate</span>
                                                    <span>{campaign.clickRate}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-cartoon-blue h-2 rounded-full"
                                                        style={{ width: `${campaign.clickRate * 3}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-800 text-center py-4">No campaign data available yet</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Source Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white text-gray-600 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h2 className="text-xl font-bold mb-4">Subscription Sources</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={safeData.sourceBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {safeData.sourceBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {safeData.sourceBreakdown.map((source, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: source.color }}
                                    />
                                    <span className="text-sm">
                                        {source.name} ({source.value}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Engagement by Day */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white text-gray-600 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h2 className="text-xl font-bold mb-4">Engagement by Day of Week</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={safeData.engagementByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="opens" fill="#FF6B9D" />
                                <Bar dataKey="clicks" fill="#4ECDC4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Top Locations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white text-gray-600 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                    >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BiMapPin className="text-cartoon-orange" />
                            Top Locations
                        </h2>
                        <div className="space-y-3">
                            {safeData.topLocations.map((location, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-gray-800">
                                            #{index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium">{location.country}</p>
                                            <p className="text-sm text-gray-800">
                                                {location.subscribers} subscribers
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{location.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, change, subtitle, icon: Icon, color }) => {
    const isPositive = change > 0;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-gray-800 text-sm">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 bg-${color}/20 rounded-cartoon`}>
                    <Icon size={24} className={`text-${color}`} />
                </div>
            </div>

            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {isPositive ? <BiTrendingUp /> : <BiTrendingDown />}
                    <span>{Math.abs(change)}%</span>
                    <span className="text-gray">vs last period</span>
                </div>
            )}

            {subtitle && (
                <p className="text-sm text-gray-800 mt-1">{subtitle}</p>
            )}
        </motion.div>
    );
};

// Generate mock growth data
function generateGrowthData(range) {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    let baseSubscribers = 1000;
    let baseActive = 920;

    return dates.map((date, index) => {
        baseSubscribers += Math.floor(Math.random() * 10) + 2;
        baseActive += Math.floor(Math.random() * 8) + 1;

        return {
            date: format(date, days > 30 ? 'MMM d' : 'd'),
            subscribers: baseSubscribers,
            active: baseActive
        };
    });
}

export default NewsletterAnalytics;