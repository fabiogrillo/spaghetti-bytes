import React, { useState, useEffect } from 'react';
import { generateGrowthData } from '../utils/newsletterUtils';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../Api';
import {
    BiTrendingUp, BiEnvelope, BiUserCheck,
    BiBarChart
} from 'react-icons/bi';
import { BsArrowLeft } from 'react-icons/bs';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewsletterAnalytics = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('7d');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);


    // Import utility for growth data

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                // Fetch campaigns and stats
                const [campaignsRes, statsRes] = await Promise.all([
                    api.get('/newsletter/campaigns'),
                    api.get('/newsletter/stats')
                ]);

                const campaigns = campaignsRes.data.campaigns || [];
                const stats = statsRes.data || {};

                // Process campaign data safely
                const processedCampaigns = campaigns.map(campaign => ({
                    name: campaign.subject || 'Untitled Campaign',
                    sent: campaign.recipients?.sent || 0,
                    total: campaign.recipients?.total || 0,
                    opened: campaign.recipients?.opened || 0,
                    clicked: campaign.recipients?.clicked || 0,
                    openRate: campaign.recipients?.total > 0
                        ? ((campaign.recipients?.opened || 0) / campaign.recipients.total * 100).toFixed(1)
                        : 0,
                    clickRate: campaign.recipients?.total > 0
                        ? ((campaign.recipients?.clicked || 0) / campaign.recipients.total * 100).toFixed(1)
                        : 0,
                    status: campaign.status || 'draft',
                    sentAt: campaign.sentAt
                }));

                // Calculate aggregate statistics
                const totalSent = processedCampaigns.reduce((sum, c) => sum + c.sent, 0);
                const totalOpened = processedCampaigns.reduce((sum, c) => sum + c.opened, 0);
                const totalClicked = processedCampaigns.reduce((sum, c) => sum + c.clicked, 0);

                const avgOpenRate = totalSent > 0
                    ? (totalOpened / totalSent * 100).toFixed(1)
                    : 0;
                const avgClickRate = totalSent > 0
                    ? (totalClicked / totalSent * 100).toFixed(1)
                    : 0;

                // Build analytics object
                const analyticsData = {
                    stats: {
                        totalSubscribers: stats.total || 0,
                        activeSubscribers: stats.active || 0,
                        avgOpenRate: parseFloat(avgOpenRate),
                        avgClickRate: parseFloat(avgClickRate),
                        totalCampaigns: campaigns.length,
                        totalEmailsSent: totalSent,
                        growth: stats.growth || {
                            thisMonth: 0,
                            lastMonth: 0,
                            percentChange: 0
                        }
                    },
                    growthData: generateGrowthData(timeRange),
                    campaignPerformance: processedCampaigns.slice(0, 10), // Last 10 campaigns
                    sourceBreakdown: stats.sourceBreakdown?.length > 0 ? stats.sourceBreakdown.map((source, index) => ({
                        ...source,
                        color: ['#FF6B9D', '#4ECDC4', '#FFC107', '#9B59B6', '#34D399'][index % 5]
                    })) : [
                        { name: 'No data', value: 100, color: '#94A3B8' }
                    ],
                    // Remove hardcoded locations for now - would need geolocation data
                    topLocations: [],
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

                setAnalytics(analyticsData);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                toast.error('Failed to load analytics data');

                // Set default data to prevent crashes
                setAnalytics({
                    stats: {
                        totalSubscribers: 0,
                        activeSubscribers: 0,
                        avgOpenRate: 0,
                        avgClickRate: 0,
                        totalCampaigns: 0,
                        totalEmailsSent: 0,
                        growth: {
                            thisMonth: 0,
                            lastMonth: 0,
                            percentChange: 0
                        }
                    },
                    growthData: [],
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
                <FaSpinner className="animate-spin text-4xl text-cartoon-pink" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/manager')}
                        className="mb-4 btn btn-ghost rounded-cartoon"
                    >
                        <BsArrowLeft className="mr-2" /> Back to Admin
                    </button>

                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                                Newsletter Analytics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Track your newsletter performance and subscriber engagement
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2">
                            {['7d', '30d', '90d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-cartoon ${timeRange === range
                                        ? 'bg-cartoon-purple text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-600'
                                        }`}
                                >
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Subscribers</p>
                                <p className="text-3xl font-bold text-cartoon-purple">
                                    {analytics.stats.totalSubscribers.toLocaleString()}
                                </p>
                                <p className="text-sm text-green-500 mt-1">
                                    +{analytics.stats.growth?.percentChange || 0}% this month
                                </p>
                            </div>
                            <BiUserCheck className="text-4xl text-cartoon-purple opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Avg Open Rate</p>
                                <p className="text-3xl font-bold text-cartoon-pink">
                                    {analytics.stats.avgOpenRate}%
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Industry avg: 21.5%
                                </p>
                            </div>
                            <BiEnvelope className="text-4xl text-cartoon-pink opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Avg Click Rate</p>
                                <p className="text-3xl font-bold text-cartoon-green">
                                    {analytics.stats.avgClickRate}%
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Industry avg: 2.6%
                                </p>
                            </div>
                            <BiTrendingUp className="text-4xl text-cartoon-green opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Sent</p>
                                <p className="text-3xl font-bold text-cartoon-orange">
                                    {analytics.stats.totalEmailsSent.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {analytics.stats.totalCampaigns} campaigns
                                </p>
                            </div>
                            <BiBarChart className="text-4xl text-cartoon-orange opacity-50" />
                        </div>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Subscriber Growth</h3>
                        {analytics.growthData && analytics.growthData.length > 0 ? (
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
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No growth data available</p>
                        )}
                    </motion.div>

                    {/* Engagement by Day */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Engagement by Day</h3>
                        {analytics.engagementByDay && analytics.engagementByDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.engagementByDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="opens" fill="#4ECDC4" />
                                    <Bar dataKey="clicks" fill="#FF6B9D" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No engagement data available</p>
                        )}
                    </motion.div>
                </div>

                {/* Campaign Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                >
                    <h3 className="text-xl font-bold mb-4">Recent Campaign Performance</h3>
                    {analytics.campaignPerformance && analytics.campaignPerformance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="text-left py-3 px-4">Campaign</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Sent</th>
                                        <th className="text-left py-3 px-4">Open Rate</th>
                                        <th className="text-left py-3 px-4">Click Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.campaignPerformance.map((campaign, index) => (
                                        <tr key={index} className="border-b dark:border-gray-700">
                                            <td className="py-3 px-4 font-medium">{campaign.name}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs text-white ${campaign.status === 'sent' ? 'bg-green-500' :
                                                    campaign.status === 'sending' ? 'bg-blue-500' :
                                                        campaign.status === 'scheduled' ? 'bg-yellow-500' :
                                                            'bg-gray-500'
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{campaign.sent.toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`font-bold ${parseFloat(campaign.openRate) > 30 ? 'text-green-500' :
                                                    parseFloat(campaign.openRate) > 20 ? 'text-yellow-500' :
                                                        'text-red-500'
                                                    }`}>
                                                    {campaign.openRate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`font-bold ${parseFloat(campaign.clickRate) > 10 ? 'text-green-500' :
                                                    parseFloat(campaign.clickRate) > 5 ? 'text-yellow-500' :
                                                        'text-red-500'
                                                    }`}>
                                                    {campaign.clickRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No campaign data available</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default NewsletterAnalytics;