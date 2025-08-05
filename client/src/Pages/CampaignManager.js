import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiEnvelope, BiTime, BiUser, BiTrash, BiEdit, BiSend, BiCheck } from 'react-icons/bi';
import { BsArrowLeft } from 'react-icons/bs';
import { HiTemplate, HiSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../Api'; // Import the Api module
import CampaignEditor from '../Components/CampaignEditor';

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Use api module instead of fetch
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
                            <h1>Welcome aboard! 👋</h1>
                            <p>We're thrilled to have you join our community of tech enthusiasts and pasta lovers!</p>
                            <p>Here's what you can expect from us:</p>
                            <ul>
                                <li>Weekly insights on web development</li>
                                <li>Tips and tricks for better coding</li>
                                <li>Exclusive content just for subscribers</li>
                            </ul>
                            <p>Stay tuned for our next newsletter!</p>
                        `
                    }
                },
                {
                    id: 2,
                    name: 'Weekly Digest',
                    description: 'Share your latest articles',
                    thumbnail: '📰',
                    content: {
                        subject: 'This Week at Spaghetti Bytes 🍝',
                        preheader: 'Your weekly dose of tech insights',
                        body: `
                            <h1>Weekly Digest 📰</h1>
                            <p>Here's what we've been cooking up this week:</p>
                            <h2>Featured Articles</h2>
                            <p>[Article summaries will go here]</p>
                            <h2>Community Highlights</h2>
                            <p>[Community updates]</p>
                        `
                    }
                },
                {
                    id: 3,
                    name: 'Special Announcement',
                    description: 'For important updates',
                    thumbnail: '🎉',
                    content: {
                        subject: 'Exciting News from Spaghetti Bytes! 🎉',
                        preheader: 'We have something special to share',
                        body: `
                            <h1>Special Announcement 🎉</h1>
                            <p>[Your announcement here]</p>
                        `
                    }
                }
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Set default values on error
            setCampaigns([]);
            setStats({
                active: 0,
                total: 0,
                pending: 0,
                unsubscribed: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendCampaign = async (campaignId) => {
        try {
            await api.post(`/newsletter/campaigns/${campaignId}/send`);
            // Refresh campaigns
            fetchData();
        } catch (error) {
            console.error('Error sending campaign:', error);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;

        try {
            await api.delete(`/newsletter/campaigns/${campaignId}`);
            setCampaigns(campaigns.filter(c => c._id !== campaignId));
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    const handleSaveCampaign = async (campaignData) => {
        try {
            if (selectedCampaign) {
                // Update existing
                await api.put(`/newsletter/campaigns/${selectedCampaign._id}`, campaignData);
            } else {
                // Create new
                await api.post('/newsletter/campaigns', campaignData);
            }
            fetchData();
            setShowCreateModal(false);
            setSelectedCampaign(null);
        } catch (error) {
            console.error('Error saving campaign:', error);
        }
    };

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            draft: { color: 'badge-warning', icon: BiEdit, text: 'Draft' },
            scheduled: { color: 'badge-info', icon: BiTime, text: 'Scheduled' },
            sending: { color: 'badge-primary', icon: BiSend, text: 'Sending' },
            sent: { color: 'badge-success', icon: BiCheck, text: 'Sent' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <span className={`badge ${config.color} gap-1`}>
                <Icon size={14} />
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <BiEnvelope className="text-cartoon-pink" />
                                Newsletter Manager
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage campaigns, templates, and subscribers
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedTemplateData(null);
                                setShowCreateModal(true);
                            }}
                            className="btn bg-cartoon-pink text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover"
                        >
                            <HiSparkles />
                            Create Campaign
                        </motion.button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cartoon-pink">{stats.active}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cartoon-blue">{stats.total}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cartoon-yellow">{campaigns.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Campaigns</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cartoon-purple">{templates.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Templates</p>
                        </div>
                    </div>
                </motion.div>

                {/* Templates Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <HiTemplate className="text-cartoon-purple" />
                        Quick Start Templates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedTemplateData(template.content);
                                    setShowCreateModal(true);
                                }}
                                className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6 cursor-pointer hover:shadow-cartoon-hover transition-all"
                            >
                                <div className="text-4xl mb-3">{template.thumbnail}</div>
                                <h3 className="text-lg text-white font-bold mb-1">{template.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Campaigns List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Recent Campaigns</h2>
                    {campaigns.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-12 text-center">
                            <BiEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No campaigns yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.map((campaign) => (
                                <motion.div
                                    key={campaign._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{campaign.subject}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                {campaign.preheader || 'No preheader text'}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <BiTime />
                                                    {new Date(campaign.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BiUser />
                                                    {campaign.recipients?.sent || 0} recipients
                                                </span>
                                                <StatusBadge status={campaign.status} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {campaign.status === 'draft' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCampaign(campaign);
                                                            setShowCreateModal(true);
                                                        }}
                                                        className="btn btn-ghost btn-sm rounded-cartoon"
                                                    >
                                                        <BiEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendCampaign(campaign._id)}
                                                        className="btn btn-primary btn-sm rounded-cartoon"
                                                    >
                                                        <BiSend /> Send
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteCampaign(campaign._id)}
                                                className="btn btn-ghost btn-sm text-error rounded-cartoon"
                                            >
                                                <BiTrash />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Back Button */}
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/manager')}
                        className="btn btn-ghost rounded-cartoon"
                    >
                        <BsArrowLeft /> Back to Manager
                    </button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CampaignEditor
                        campaign={selectedCampaign}
                        templateData={selectedTemplateData}
                        onSave={handleSaveCampaign}
                        onClose={() => {
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