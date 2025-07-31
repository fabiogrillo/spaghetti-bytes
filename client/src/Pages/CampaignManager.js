import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../Api';
import {
    BiEnvelope, BiUser, BiSend, BiEdit,
    BiCalendar, BiBarChart, BiCheckCircle
} from 'react-icons/bi';
import { HiOutlineTemplate, HiSparkles } from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';

const CampaignManager = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [subscribers, setSubscribers] = useState({ active: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('campaigns');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [setFormData] = useState({
        subject: '',
        preheader: '',
        content: {
            html: '',
            text: ''
        }
    });


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [campaignsRes, subscribersRes] = await Promise.all([
                api.get('/api/newsletter/campaigns'),
                api.get('/api/newsletter/subscribers/stats')
            ]);

            setCampaigns(campaignsRes.data.campaigns || []);
            setSubscribers(subscribersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'campaigns', label: 'Campaigns', icon: BiEnvelope },
        { id: 'templates', label: 'Templates', icon: HiOutlineTemplate },
        { id: 'subscribers', label: 'Subscribers', icon: BiUser },
        { id: 'analytics', label: 'Analytics', icon: BiBarChart }
    ];

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
                    className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BiEnvelope className="text-cartoon-pink" />
                                Newsletter Manager
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage campaigns, templates, and subscribers
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="btn bg-cartoon-pink text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover"
                        >
                            <HiSparkles />
                            Create Campaign
                        </motion.button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="stat bg-cartoon-yellow/20 rounded-cartoon border-2 border-black">
                            <div className="stat-figure text-cartoon-yellow">
                                <BiUser size={32} />
                            </div>
                            <div className="stat-title">Active Subscribers</div>
                            <div className="stat-value">{subscribers.active}</div>
                            <div className="stat-desc">
                                {subscribers.total} total subscribers
                            </div>
                        </div>

                        <div className="stat bg-cartoon-blue/20 rounded-cartoon border-2 border-black">
                            <div className="stat-figure text-cartoon-blue">
                                <BiEnvelope size={32} />
                            </div>
                            <div className="stat-title">Campaigns Sent</div>
                            <div className="stat-value">
                                {campaigns.filter(c => c.status === 'sent').length}
                            </div>
                            <div className="stat-desc">
                                {campaigns.filter(c => c.status === 'draft').length} drafts
                            </div>
                        </div>

                        <div className="stat bg-cartoon-purple/20 rounded-cartoon border-2 border-black">
                            <div className="stat-figure text-cartoon-purple">
                                <BiCheckCircle size={32} />
                            </div>
                            <div className="stat-title">Avg. Open Rate</div>
                            <div className="stat-value">24.5%</div>
                            <div className="stat-desc">↗︎ 2.1% from last month</div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="tabs tabs-boxed bg-white rounded-cartoon shadow-cartoon border-2 border-black p-2 mb-6">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`tab tab-lg gap-2 ${selectedTab === tab.id
                                ? 'tab-active bg-cartoon-pink text-white'
                                : ''
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {selectedTab === 'campaigns' && (
                        <CampaignsList
                            campaigns={campaigns}
                            onRefresh={fetchData}
                        />
                    )}
                    {selectedTab === 'templates' && (
                        <TemplatesList
                            onSelectTemplate={(templateData) => {
                                setFormData(templateData);
                                setShowCreateModal(true);
                            }}
                        />
                    )}
                    {selectedTab === 'subscribers' && (
                        <SubscribersList />
                    )}
                    {selectedTab === 'analytics' && (
                        <AnalyticsDashboard campaigns={campaigns} />
                    )}
                </AnimatePresence>

                {/* Create Campaign Modal */}
                {showCreateModal && (
                    <CreateCampaignModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchData();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// Campaigns List Component
const CampaignsList = ({ campaigns, onRefresh }) => {
    const navigate = useNavigate();

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Draft' },
            scheduled: { bg: 'bg-cartoon-yellow', text: 'text-black', label: 'Scheduled' },
            sending: { bg: 'bg-cartoon-blue', text: 'text-white', label: 'Sending' },
            sent: { bg: 'bg-cartoon-green', text: 'text-white', label: 'Sent' }
        };
        return badges[status] || badges.draft;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
        >
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-12 text-center">
                    <BiEnvelope size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No campaigns yet</h3>
                    <p className="text-gray-600">Create your first newsletter campaign!</p>
                </div>
            ) : (
                campaigns.map((campaign) => {
                    const status = getStatusBadge(campaign.status);
                    return (
                        <motion.div
                            key={campaign._id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{campaign.subject}</h3>
                                        <span className={`badge ${status.bg} ${status.text}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {campaign.preheader && (
                                        <p className="text-gray-600 mb-2">{campaign.preheader}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <BiCalendar />
                                            {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                                        </span>

                                        {campaign.status === 'sent' && campaign.sentAt && (
                                            <span className="flex items-center gap-1">
                                                <BiSend />
                                                Sent {formatDistanceToNow(new Date(campaign.sentAt), { addSuffix: true })}
                                            </span>
                                        )}

                                        {campaign.recipients && campaign.recipients.total > 0 && (
                                            <span className="flex items-center gap-1">
                                                <BiUser />
                                                {campaign.recipients.total} recipients
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate(`/newsletter/campaign/${campaign._id}/edit`)}
                                        className="btn btn-circle btn-ghost"
                                    >
                                        <BiEdit size={20} />
                                    </motion.button>

                                    {campaign.status === 'draft' && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/newsletter/campaign/${campaign._id}/send`)}
                                            className="btn btn-circle bg-cartoon-pink text-white"
                                        >
                                            <BiSend size={20} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </motion.div>
    );
};

// Templates List Component
const TemplatesList = ({ setFormData, setShowCreateModal }) => {
    const templates = [
        {
            id: 1,
            name: 'Weekly Newsletter',
            description: 'Standard weekly update template with featured articles',
            lastUsed: new Date('2024-01-15')
        },
        {
            id: 2,
            name: 'Product Launch',
            description: 'Template for announcing new features or products',
            lastUsed: new Date('2024-01-10')
        },
        {
            id: 3,
            name: 'Monthly Roundup',
            description: 'Monthly summary with top articles and stats',
            lastUsed: new Date('2023-12-30')
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
            {templates.map((template) => (
                <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6"
                >
                    <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Last used: {format(template.lastUsed, 'MMM d, yyyy')}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm bg-cartoon-blue text-white rounded-cartoon w-full"
                        onClick={() => {
                            // Populate create modal with template
                            setFormData({
                                subject: template.name === 'Weekly Newsletter'
                                    ? '🍝 This Week in Spaghetti Bytes'
                                    : template.name === 'Product Launch'
                                        ? '🚀 Exciting News from Spaghetti Bytes!'
                                        : '📅 Monthly Digest - Spaghetti Bytes',
                                preheader: template.description,
                                content: {
                                    html: getTemplateHTML(template.name),
                                    text: ''
                                }
                            });
                            setShowCreateModal(true);
                        }}
                    >
                        Use Template
                    </motion.button>
                </motion.div>
            ))}
        </motion.div>
    );
};

// Subscribers List Component
const SubscribersList = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const response = await api.get(`/api/newsletter/subscribers?page=${page}&limit=10`);
                setSubscribers(response.data.subscribers);
                setTotalPages(response.data.pagination.pages);
            } catch (error) {
                console.error('Error fetching subscribers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, [page]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-cartoon shadow-cartoon border-2 border-black overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Source</th>
                            <th>Subscribed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((subscriber) => (
                            <tr key={subscriber._id}>
                                <td className="font-medium">{subscriber.email}</td>
                                <td>
                                    <span className={`badge ${subscriber.status === 'active'
                                        ? 'badge-success'
                                        : subscriber.status === 'pending'
                                            ? 'badge-warning'
                                            : 'badge-error'
                                        }`}>
                                        {subscriber.status}
                                    </span>
                                </td>
                                <td>{subscriber.metadata?.source || 'Unknown'}</td>
                                <td>{format(new Date(subscriber.dates.subscribedAt), 'MMM d, yyyy')}</td>
                                <td>
                                    <button className="btn btn-ghost btn-xs">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center p-4">
                <div className="join">
                    <button
                        className="join-item btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        «
                    </button>
                    <button className="join-item btn">Page {page}</button>
                    <button
                        className="join-item btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        »
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ campaigns }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Charts would go here - for now, placeholder */}
            <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4">Email Performance Over Time</h3>
                <div className="h-64 bg-gray-100 rounded-cartoon flex items-center justify-center">
                    <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6">
                    <h3 className="text-lg font-bold mb-4">Top Performing Campaigns</h3>
                    <div className="space-y-2">
                        {campaigns
                            .filter(c => c.status === 'sent')
                            .slice(0, 5)
                            .map((campaign) => (
                                <div key={campaign._id} className="flex justify-between items-center">
                                    <span className="truncate flex-1">{campaign.subject}</span>
                                    <span className="text-sm text-gray-500">
                                        {campaign.recipients?.opened || 0} opens
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6">
                    <h3 className="text-lg font-bold mb-4">Subscriber Growth</h3>
                    <div className="h-40 bg-gray-100 rounded-cartoon flex items-center justify-center">
                        <p className="text-gray-500">Growth chart coming soon</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        subject: '',
        preheader: '',
        content: {
            html: '',
            text: ''
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/newsletter/campaigns', formData);
            onSuccess();
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Create New Campaign</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Subject Line</span>
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="input input-bordered rounded-cartoon"
                            placeholder="🍝 This Week in Spaghetti Bytes"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Preheader Text</span>
                        </label>
                        <input
                            type="text"
                            value={formData.preheader}
                            onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                            className="input input-bordered rounded-cartoon"
                            placeholder="A quick preview of what's inside..."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Content (HTML)</span>
                        </label>
                        <textarea
                            value={formData.content.html}
                            onChange={(e) => setFormData({
                                ...formData,
                                content: { ...formData.content, html: e.target.value }
                            })}
                            className="textarea textarea-bordered rounded-cartoon h-32"
                            placeholder="Email content HTML..."
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost rounded-cartoon"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-cartoon-pink text-white rounded-cartoon"
                        >
                            Create Campaign
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const getTemplateHTML = (templateName) => {
    switch (templateName) {
        case 'Weekly Newsletter':
            return '<h1>Weekly Update</h1><p>Here is what’s new this week...</p>';
        case 'Product Launch':
            return '<h1>🚀 New Product Alert!</h1><p>We’ve just launched something amazing...</p>';
        case 'Monthly Roundup':
            return '<h1>📅 This Month in Review</h1><p>A quick look back at our highlights...</p>';
        default:
            return '<p>Start writing your content here...</p>';
    }
};


export default CampaignManager;