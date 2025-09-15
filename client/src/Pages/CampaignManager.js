import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope, FaUsers, FaChartLine, FaPaperPlane,
    FaPlus, FaTrash, FaSpinner, FaTimes
} from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../Api';
import { FaClock, FaCalendarAlt } from 'react-icons/fa';


const CampaignManager = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');
    const [subscriberFilter, setSubscriberFilter] = useState('all'); // all, active, pending, unsubscribed

    // Data states with proper initialization
    const [campaigns, setCampaigns] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        total: 0,
        pending: 0,
        unsubscribed: 0,
        growth: {
            thisMonth: 0,
            lastMonth: 0,
            percentChange: 0
        }
    });

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'campaign' or 'subscriber'

    // Form states
    const [campaignForm, setCampaignForm] = useState({
        subject: '',
        preheader: '',
        content: {
            html: '',
            text: ''
        },
        schedule: {
            sendAt: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    });

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const formatScheduleInfo = (datetime) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return `Scheduled for: ${date.toLocaleString('en-US', {
            timeZone: 'Europe/Rome',
            dateStyle: 'medium',
            timeStyle: 'short'
        })} (Rome Time)`;
    };

    // Fetch data function - NOT using useCallback to avoid dependency issues
    const fetchData = async () => {
        try {
            setLoading(true);

            const [campaignsRes, subscribersRes, statsRes] = await Promise.all([
                api.get('/newsletter/campaigns'),
                api.get('/newsletter/subscribers'),
                api.get('/newsletter/stats')
            ]);

            setCampaigns(campaignsRes.data.campaigns || []);
            setSubscribers(subscribersRes.data.subscribers || []);

            // Merge stats with defaults to ensure all properties exist
            setStats(prevStats => ({
                ...prevStats,
                ...(statsRes.data || {})
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load newsletter data');
        } finally {
            setLoading(false);
        }
    };

    // Use effect with empty dependency array - fetch only once on mount
    useEffect(() => {
        fetchData();
    }, []); // Empty array ensures this runs only once

    const handleCreateCampaign = async () => {
        if (!campaignForm.subject || !campaignForm.content.html) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setLoading(true);
            await api.post('/newsletter/campaigns', campaignForm);
            toast.success('Campaign created successfully');
            setShowCreateModal(false);
            resetCampaignForm();
            await fetchData(); // Refresh data after creation
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCampaign = async (campaignId) => {
        if (!window.confirm('Are you sure you want to send this campaign now?')) {
            return;
        }

        try {
            await api.post(`/newsletter/campaigns/${campaignId}/send`);
            toast.success('Campaign is being sent');
            await fetchData(); // Refresh data after sending
        } catch (error) {
            console.error('Error sending campaign:', error);
            toast.error('Failed to send campaign');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setLoading(true);

            if (deleteType === 'campaign') {
                await api.delete(`/newsletter/campaigns/${itemToDelete}`);
                toast.success('Campaign deleted successfully');
            } else if (deleteType === 'subscriber') {
                await api.delete(`/newsletter/subscribers/${itemToDelete}`);
                toast.success('Subscriber removed successfully');
            }

            setShowDeleteModal(false);
            setItemToDelete(null);
            setDeleteType('');
            await fetchData(); // Refresh data after deletion
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(`Failed to delete ${deleteType}`);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id, type) => {
        setItemToDelete(id);
        setDeleteType(type);
        setShowDeleteModal(true);
    };

    const resetCampaignForm = () => {
        setCampaignForm({
            subject: '',
            preheader: '',
            content: {
                html: '',
                text: ''
            },
            schedule: {
                sendAt: '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        });
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Filter subscribers based on selected filter
    const filteredSubscribers = subscriberFilter === 'all' 
        ? subscribers 
        : subscribers.filter(subscriber => subscriber.status === subscriberFilter);

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-500',
            scheduled: 'bg-yellow-500',
            sending: 'bg-blue-500',
            sent: 'bg-green-500',
            failed: 'bg-red-500',
            active: 'bg-green-500',
            pending: 'bg-yellow-500',
            unsubscribed: 'bg-gray-500'
        };
        return badges[status] || 'bg-gray-500';
    };

    // Show loading spinner only on initial load
    if (loading && campaigns.length === 0 && subscribers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-4xl text-cartoon-pink" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto p-4 md:p-8">
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

                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Newsletter Manager
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your email campaigns and subscribers
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Active Subscribers</p>
                                <p className="text-3xl font-bold text-cartoon-green">{stats.active}</p>
                            </div>
                            <FaUsers className="text-3xl text-cartoon-green opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Total Campaigns</p>
                                <p className="text-3xl font-bold text-cartoon-purple">{campaigns.length}</p>
                            </div>
                            <FaEnvelope className="text-3xl text-cartoon-purple opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">This Month</p>
                                <p className="text-3xl font-bold text-cartoon-pink">
                                    {stats.growth?.thisMonth || 0}
                                </p>
                            </div>
                            <FaChartLine className="text-3xl text-cartoon-pink opacity-50" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Growth Rate</p>
                                <p className="text-3xl font-bold text-cartoon-orange">
                                    {stats.growth?.percentChange > 0 ? '+' : ''}
                                    {stats.growth?.percentChange || 0}%
                                </p>
                            </div>
                            <FaChartLine className="text-3xl text-cartoon-orange opacity-50" />
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-6 py-3 rounded-cartoon font-medium transition-all ${activeTab === 'campaigns'
                            ? 'bg-cartoon-purple text-white shadow-cartoon'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <FaEnvelope className="inline mr-2" />
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('subscribers')}
                        className={`px-6 py-3 rounded-cartoon font-medium transition-all ${activeTab === 'subscribers'
                            ? 'bg-cartoon-purple text-white shadow-cartoon'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <FaUsers className="inline mr-2" />
                        Subscribers
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'campaigns' ? (
                        <motion.div
                            key="campaigns"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    Email Campaigns
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn btn-primary bg-cartoon-green hover:bg-cartoon-green/80 
                                             rounded-cartoon shadow-cartoon"
                                >
                                    <FaPlus className="mr-2" />
                                    New Campaign
                                </button>
                            </div>

                            {campaigns.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaEnvelope className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No campaigns yet. Create your first campaign!
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b dark:border-gray-700">
                                                <th className="text-left py-3 px-4">Subject</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Recipients</th>
                                                <th className="text-left py-3 px-4">Scheduled</th>
                                                <th className="text-left py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {campaigns.map((campaign) => (
                                                <tr key={campaign._id} className="border-b dark:border-gray-700">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium">{campaign.subject}</p>
                                                            {campaign.preheader && (
                                                                <p className="text-sm text-gray-500">
                                                                    {campaign.preheader}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusBadge(campaign.status)}`}>
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {campaign.recipients?.sent || 0} / {campaign.recipients?.total || 0}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {campaign.schedule?.sendAt ? formatDate(campaign.schedule.sendAt) : 'Not scheduled'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            {campaign.status === 'draft' && (
                                                                <button
                                                                    onClick={() => handleSendCampaign(campaign._id)}
                                                                    className="btn btn-sm bg-cartoon-green text-white rounded"
                                                                    title="Send Now"
                                                                >
                                                                    <FaPaperPlane />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openDeleteModal(campaign._id, 'campaign')}
                                                                className="btn btn-sm bg-red-500 text-white rounded"
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="subscribers"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    Subscribers ({filteredSubscribers.length} of {subscribers.length})
                                </h2>
                                
                                {/* Filter Controls */}
                                <div className="flex gap-2">
                                    <select
                                        value={subscriberFilter}
                                        onChange={(e) => setSubscriberFilter(e.target.value)}
                                        className="select select-bordered select-sm rounded-cartoon"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="pending">Pending Only</option>
                                        <option value="unsubscribed">Unsubscribed Only</option>
                                    </select>
                                    
                                    {subscriberFilter !== 'all' && (
                                        <button
                                            onClick={() => setSubscriberFilter('all')}
                                            className="btn btn-sm btn-ghost rounded-cartoon"
                                            title="Clear filter"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {filteredSubscribers.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaUsers className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {subscribers.length === 0 ? 'No subscribers yet.' : `No ${subscriberFilter} subscribers.`}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b dark:border-gray-700">
                                                <th className="text-left py-3 px-4">Email</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Subscribed</th>
                                                <th className="text-left py-3 px-4">Source</th>
                                                <th className="text-left py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubscribers.map((subscriber) => (
                                                <tr key={subscriber._id} className="border-b dark:border-gray-700">
                                                    <td className="py-3 px-4 font-medium">{subscriber.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusBadge(subscriber.status)}`}>
                                                            {subscriber.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {formatDate(subscriber.dates?.subscribedAt)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {subscriber.metadata?.source || 'website'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => openDeleteModal(subscriber._id, 'subscriber')}
                                                            className="btn btn-sm bg-red-500 text-white rounded"
                                                            title="Remove Subscriber"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Campaign Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Create Campaign</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Subject Line *
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.subject}
                                            onChange={(e) => setCampaignForm({
                                                ...campaignForm,
                                                subject: e.target.value
                                            })}
                                            className="w-full p-3 border rounded-cartoon dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Your awesome newsletter subject"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Preheader Text
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.preheader}
                                            onChange={(e) => setCampaignForm({
                                                ...campaignForm,
                                                preheader: e.target.value
                                            })}
                                            className="w-full p-3 border rounded-cartoon dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Preview text that appears in inbox"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            HTML Content *
                                        </label>
                                        <textarea
                                            value={campaignForm.content.html}
                                            onChange={(e) => setCampaignForm({
                                                ...campaignForm,
                                                content: {
                                                    ...campaignForm.content,
                                                    html: e.target.value
                                                }
                                            })}
                                            className="w-full p-3 border rounded-cartoon dark:bg-gray-700 dark:border-gray-600 h-48"
                                            placeholder="Your email HTML content..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Schedule Send (Optional)
                                            <span className="ml-2 text-xs text-gray-500">
                                                Leave empty to send immediately
                                            </span>
                                        </label>

                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    value={campaignForm.schedule.sendAt}
                                                    onChange={(e) => setCampaignForm({
                                                        ...campaignForm,
                                                        schedule: {
                                                            ...campaignForm.schedule,
                                                            sendAt: e.target.value,
                                                            timezone: 'Europe/Rome'
                                                        }
                                                    })}
                                                    min={getCurrentDateTime()}
                                                    className="w-full p-3 pl-10 border rounded-cartoon dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <FaCalendarAlt className="absolute left-3 top-4 text-gray-400" />
                                            </div>

                                            {campaignForm.schedule.sendAt && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                    <FaClock className="inline mr-2" />
                                                    {formatScheduleInfo(campaignForm.schedule.sendAt)}
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const now = new Date();
                                                        now.setMinutes(now.getMinutes() + 5);
                                                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                                                        setCampaignForm({
                                                            ...campaignForm,
                                                            schedule: {
                                                                ...campaignForm.schedule,
                                                                sendAt: now.toISOString().slice(0, 16)
                                                            }
                                                        });
                                                    }}
                                                    className="text-xs btn btn-sm btn-ghost"
                                                >
                                                    +5 min
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const now = new Date();
                                                        now.setHours(now.getHours() + 1);
                                                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                                                        setCampaignForm({
                                                            ...campaignForm,
                                                            schedule: {
                                                                ...campaignForm.schedule,
                                                                sendAt: now.toISOString().slice(0, 16)
                                                            }
                                                        });
                                                    }}
                                                    className="text-xs btn btn-sm btn-ghost"
                                                >
                                                    +1 hour
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const tomorrow = new Date();
                                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                                        tomorrow.setHours(9, 0, 0, 0);
                                                        tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
                                                        setCampaignForm({
                                                            ...campaignForm,
                                                            schedule: {
                                                                ...campaignForm.schedule,
                                                                sendAt: tomorrow.toISOString().slice(0, 16)
                                                            }
                                                        });
                                                    }}
                                                    className="text-xs btn btn-sm btn-ghost"
                                                >
                                                    Tomorrow 9AM
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCampaignForm({
                                                        ...campaignForm,
                                                        schedule: {
                                                            ...campaignForm.schedule,
                                                            sendAt: ''
                                                        }
                                                    })}
                                                    className="text-xs btn btn-sm btn-ghost text-red-500"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="alert alert-info text-sm mt-4">
                                        <FaClock className="inline mr-2" />
                                        <div>
                                            <p><strong>How scheduling works:</strong></p>
                                            <ul className="list-disc list-inside mt-1">
                                                <li>Leave empty to send immediately to all active subscribers</li>
                                                <li>Set a future date/time to schedule the campaign</li>
                                                <li>All times are in Rome timezone (UTC+1/+2)</li>
                                                <li>Campaigns will be sent at the exact time specified</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="btn btn-ghost rounded-cartoon"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateCampaign}
                                            disabled={loading}
                                            className="btn btn-primary bg-cartoon-green hover:bg-cartoon-green/80 rounded-cartoon"
                                        >
                                            {loading ? <FaSpinner className="animate-spin" /> : 'Create Campaign'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this {deleteType}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-ghost rounded-cartoon"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="btn bg-red-500 text-white hover:bg-red-600 rounded-cartoon"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CampaignManager;