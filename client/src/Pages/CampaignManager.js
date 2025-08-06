import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiEnvelope, BiTime, BiUser, BiTrash, BiEdit, BiSend, BiGroup } from 'react-icons/bi';
import { BsArrowLeft } from 'react-icons/bs';
import { HiTemplate, HiSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../Api';
import CampaignEditor from '../Components/CampaignEditor';
import NewsletterSubscribersTable from '../Components/NewsletterSubscribersTable';

const CampaignManager = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        total: 0,
        pending: 0,
        unsubscribed: 0
    });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedTemplateData, setSelectedTemplateData] = useState(null);
    const [activeTab, setActiveTab] = useState('campaigns'); // New state for tabs

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [campaignsRes, statsRes] = await Promise.all([
                api.get('/newsletter/campaigns'),
                api.get('/newsletter/subscribers/stats')
            ]);

            setCampaigns(campaignsRes.data.campaigns || []);
            setStats(statsRes.data || {
                active: 0,
                total: 0,
                pending: 0,
                unsubscribed: 0
            });

            // Load templates
            setTemplates([
                {
                    id: 1,
                    name: 'Welcome Series',
                    description: 'Perfect for new subscribers',
                    thumbnail: '👋',
                    content: {
                        subject: 'Welcome to Spaghetti Bytes! 🍝',
                        preheader: 'Start your journey with us',
                        body: `
                            <h1>Welcome aboard!</h1>
                            <p>We're thrilled to have you join our community of tech enthusiasts!</p>
                        `
                    }
                },
                {
                    id: 2,
                    name: 'Weekly Digest',
                    description: 'Weekly roundup of articles',
                    thumbnail: '📰',
                    content: {
                        subject: 'This Week at Spaghetti Bytes 📰',
                        preheader: 'Your weekly dose of tech insights',
                        body: `
                            <h1>Weekly Highlights</h1>
                            <p>Here's what we've been cooking up this week...</p>
                        `
                    }
                }
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendCampaign = async (campaignId) => {
        try {
            await api.post(`/newsletter/campaigns/${campaignId}/send`);
            fetchData();
        } catch (error) {
            console.error('Error sending campaign:', error);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await api.delete(`/newsletter/campaigns/${campaignId}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting campaign:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-infinity loading-lg text-cartoon-pink"></span>
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
                        onClick={() => navigate('/admin')}
                        className="mb-4 btn btn-ghost rounded-cartoon"
                    >
                        <BsArrowLeft /> Back to Admin
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</p>
                                <p className="text-2xl font-bold text-cartoon-green">{stats.active}</p>
                            </div>
                            <BiUser className="text-3xl text-cartoon-green" />
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
                                <p className="text-2xl font-bold text-cartoon-purple">{stats.total}</p>
                            </div>
                            <BiGroup className="text-3xl text-cartoon-purple" />
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-cartoon-orange">{stats.pending}</p>
                            </div>
                            <BiTime className="text-3xl text-cartoon-orange" />
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unsubscribed</p>
                                <p className="text-2xl font-bold text-red-500">{stats.unsubscribed}</p>
                            </div>
                            <BiTrash className="text-3xl text-red-500" />
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon mb-8">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'campaigns'
                                    ? 'bg-cartoon-pink text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <BiEnvelope className="inline mr-2" />
                            Campaigns
                        </button>
                        <button
                            onClick={() => setActiveTab('subscribers')}
                            className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'subscribers'
                                    ? 'bg-cartoon-purple text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <BiGroup className="inline mr-2" />
                            Subscribers
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'campaigns' ? (
                            <>
                                {/* Create Campaign Button */}
                                <div className="mb-6">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="btn btn-primary bg-cartoon-pink hover:bg-cartoon-pink/80 
                                                 rounded-cartoon shadow-cartoon"
                                    >
                                        <HiSparkles className="mr-2" />
                                        Create New Campaign
                                    </button>
                                </div>

                                {/* Campaigns List */}
                                <div className="space-y-4">
                                    {campaigns.length === 0 ? (
                                        <div className="text-center py-12">
                                            <BiEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                No campaigns yet. Create your first campaign!
                                            </p>
                                        </div>
                                    ) : (
                                        campaigns.map((campaign) => (
                                            <motion.div
                                                key={campaign._id}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="border border-gray-200 dark:border-gray-700 
                                                         rounded-cartoon p-4 hover:shadow-cartoon transition-shadow"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold mb-1">
                                                            {campaign.subject}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            {campaign.preheader}
                                                        </p>
                                                        <div className="flex gap-4 text-sm">
                                                            <span className={`badge ${campaign.status === 'sent'
                                                                    ? 'badge-success'
                                                                    : campaign.status === 'scheduled'
                                                                        ? 'badge-warning'
                                                                        : 'badge-ghost'
                                                                }`}>
                                                                {campaign.status}
                                                            </span>
                                                            {campaign.recipients && (
                                                                <span className="text-gray-500">
                                                                    Sent to {campaign.recipients.sent || 0} subscribers
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {campaign.status === 'draft' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSendCampaign(campaign._id)}
                                                                    className="btn btn-sm btn-success rounded-cartoon"
                                                                >
                                                                    <BiSend />
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedCampaign(campaign)}
                                                                    className="btn btn-sm btn-info rounded-cartoon"
                                                                >
                                                                    <BiEdit />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCampaign(campaign._id)}
                                                            className="btn btn-sm btn-error rounded-cartoon"
                                                        >
                                                            <BiTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Subscribers Tab Content */
                            <NewsletterSubscribersTable />
                        )}
                    </div>
                </div>

                {/* Templates Section - Only show in campaigns tab */}
                {activeTab === 'campaigns' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <HiTemplate className="mr-2 text-cartoon-orange" />
                            Campaign Templates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <motion.div
                                    key={template.id}
                                    whileHover={{ scale: 1.05 }}
                                    className="border-2 border-gray-200 dark:border-gray-700 rounded-cartoon p-4
                                             hover:border-cartoon-pink hover:shadow-cartoon cursor-pointer transition-all"
                                    onClick={() => {
                                        setSelectedTemplateData(template.content);
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <div className="text-4xl mb-2">{template.thumbnail}</div>
                                    <h3 className="font-bold mb-1">{template.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {template.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Campaign Editor Modal */}
            <AnimatePresence>
                {(showCreateModal || selectedCampaign) && (
                    <CampaignEditor
                        isOpen={showCreateModal || !!selectedCampaign}
                        onClose={() => {
                            setShowCreateModal(false);
                            setSelectedCampaign(null);
                            setSelectedTemplateData(null);
                        }}
                        campaign={selectedCampaign}
                        templateData={selectedTemplateData}
                        onSave={() => {
                            fetchData();
                            setShowCreateModal(false);
                            setSelectedCampaign(null);
                            setSelectedTemplateData(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CampaignManager;