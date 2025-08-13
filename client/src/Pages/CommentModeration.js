// client/src/Pages/CommentModeration.js
// Admin panel for comment moderation

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCheck, FiX, FiAlertCircle, FiMessageCircle,
    FiClock, FiTrash2, FiEye
} from 'react-icons/fi';
import { AuthContext } from '../AuthContext';
import api from '../Api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CommentModeration = () => {
    const navigate = useNavigate();
    const { username, isAuthenticated } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        spam: 0
    });
    const [filter, setFilter] = useState('all');
    const [selectedComment, setSelectedComment] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (!isAuthenticated || username !== 'admin') {
            navigate('/login');
        }
    }, [isAuthenticated, username, navigate]);

    useEffect(() => {
        fetchComments();
        fetchStats();
    }, []);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/comments/moderate');
            setComments(response.data.comments || []);
        } catch (error) {
            toast.error('Failed to load comments');
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/comments/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleApprove = async (commentId) => {
        try {
            await api.post(`/comments/${commentId}/approve`);
            setComments(comments.filter(c => c._id !== commentId));
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                approved: prev.approved + 1
            }));
            toast.success('Comment approved!');
        } catch (error) {
            toast.error('Failed to approve comment');
        }
    };

    const handleReject = async (commentId, reason) => {
        try {
            await api.post(`/comments/${commentId}/reject`, { reason });
            setComments(comments.filter(c => c._id !== commentId));
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                rejected: prev.rejected + 1
            }));
            toast.success('Comment rejected');
        } catch (error) {
            toast.error('Failed to reject comment');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to permanently delete this comment?')) {
            return;
        }

        try {
            await api.delete(`/comments/${commentId}/admin`);
            setComments(comments.filter(c => c._id !== commentId));
            setStats(prev => ({
                ...prev,
                total: prev.total - 1,
                pending: prev.pending - 1
            }));
            toast.success('Comment deleted permanently');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'spam': return 'bg-red-100 text-red-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredComments = filter === 'all'
        ? comments
        : comments.filter(c => c.status === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Comment Moderation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and manage user comments
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                >
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-gray-500', icon: <FiMessageCircle /> },
                        { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', icon: <FiClock /> },
                        { label: 'Approved', value: stats.approved, color: 'bg-green-500', icon: <FiCheck /> },
                        { label: 'Rejected', value: stats.rejected, color: 'bg-red-500', icon: <FiX /> },
                        { label: 'Spam', value: stats.spam, color: 'bg-orange-500', icon: <FiAlertCircle /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`${stat.color} text-white p-2 rounded-full`}>
                                    {stat.icon}
                                </span>
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['all', 'pending', 'spam'].map(filterType => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`
                                px-4 py-2 rounded-cartoon font-medium capitalize
                                ${filter === filterType
                                    ? 'bg-cartoon-purple text-white shadow-cartoon'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-cartoon-sm'}
                            `}
                        >
                            {filterType}
                        </button>
                    ))}
                </div>

                {/* Comments List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading loading-spinner loading-lg text-cartoon-purple"></div>
                    </div>
                ) : filteredComments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon"
                    >
                        <FiMessageCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No comments to moderate
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-4">
                            {filteredComments.map((comment, index) => (
                                <motion.div
                                    key={comment._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6"
                                >
                                    {/* Comment Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-lg">
                                                    {comment.author.name}
                                                </span>
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium
                                                    ${getStatusColor(comment.status)}
                                                `}>
                                                    {comment.status}
                                                </span>
                                                {comment.flagReason && (
                                                    <span className="text-xs text-red-600 dark:text-red-400">
                                                        Flagged: {comment.flagReason}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {comment.author.email && (
                                                    <span className="mr-3">{comment.author.email}</span>
                                                )}
                                                <span>
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Story Reference */}
                                    {comment.story && (
                                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                On article:
                                            </span>
                                            <button
                                                onClick={() => navigate(`/story/${comment.story.slug}`)}
                                                className="text-sm font-medium text-cartoon-blue hover:underline ml-1"
                                            >
                                                {comment.story.title}
                                            </button>
                                        </div>
                                    )}

                                    {/* Comment Content */}
                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {comment.content}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleApprove(comment._id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-cartoon hover:shadow-cartoon flex items-center gap-2"
                                        >
                                            <FiCheck />
                                            Approve
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                const reason = prompt('Rejection reason (optional):');
                                                handleReject(comment._id, reason);
                                            }}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-cartoon hover:shadow-cartoon flex items-center gap-2"
                                        >
                                            <FiX />
                                            Reject
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(comment._id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-cartoon hover:shadow-cartoon flex items-center gap-2"
                                        >
                                            <FiTrash2 />
                                            Delete
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/story/${comment.story.slug}`)}
                                            className="px-4 py-2 bg-cartoon-blue text-white rounded-cartoon hover:shadow-cartoon flex items-center gap-2"
                                        >
                                            <FiEye />
                                            View Article
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default CommentModeration;