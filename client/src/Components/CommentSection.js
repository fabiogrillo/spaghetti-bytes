// client/src/Components/CommentSection.js
// Fixed version without AuthContext dependency

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageCircle, FiSend, FiHeart, FiThumbsUp,
    FiX
} from 'react-icons/fi';
import { BiReply } from 'react-icons/bi';
import api from '../Api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Single Comment Component
const Comment = ({ comment, onReply, onDelete, onReaction, depth = 0, isAdmin = false }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReaction = async (type) => {
        try {
            const sessionId = localStorage.getItem('sessionId') || Date.now().toString();
            localStorage.setItem('sessionId', sessionId);

            await api.post(`/comments/${comment._id}/reaction`, {
                type,
                sessionId
            });

            onReaction(comment._id, type);
        } catch (error) {
            toast.error('Failed to add reaction');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                const endpoint = isAdmin
                    ? `/comments/${comment._id}/admin`
                    : `/comments/${comment._id}`;

                await api.delete(endpoint);
                onDelete(comment._id);
                toast.success('Comment deleted successfully');
            } catch (error) {
                toast.error('Failed to delete comment');
            }
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        await onReply(replyContent, comment._id);
        setReplyContent('');
        setShowReplyForm(false);
    };

    const getStatusBadge = () => {
        if (comment.status === 'pending') {
            return (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pending Approval
                </span>
            );
        }
        if (comment.status === 'rejected') {
            return (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Rejected
                </span>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
        >
            <div className={`
                bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon-sm 
                p-4 mb-4 transition-all hover:shadow-cartoon
                ${comment.status === 'pending' ? 'opacity-75' : ''}
            `}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cartoon-pink to-cartoon-purple rounded-full flex items-center justify-center text-white font-bold">
                            {comment.author.name[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {comment.author.name}
                                </span>
                                {isAdmin && getStatusBadge()}
                            </div>
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Admin Delete Button */}
                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                            title="Delete comment"
                        >
                            <FiX size={20} />
                        </motion.button>
                    )}
                </div>

                {/* Content */}
                <div className="text-gray-700 dark:text-gray-300 mb-4">
                    {comment.content}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Reactions */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction('like')}
                            className={`
                                flex items-center gap-1 px-3 py-1 rounded-full
                                ${comment.reactions.likes.length > 0
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}
                            `}
                        >
                            <FiThumbsUp size={16} />
                            {comment.reactions.likes.length > 0 && (
                                <span className="text-sm">{comment.reactions.likes.length}</span>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction('heart')}
                            className={`
                                flex items-center gap-1 px-3 py-1 rounded-full
                                ${comment.reactions.hearts.length > 0
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'}
                            `}
                        >
                            <FiHeart size={16} />
                            {comment.reactions.hearts.length > 0 && (
                                <span className="text-sm">{comment.reactions.hearts.length}</span>
                            )}
                        </motion.button>
                    </div>

                    {/* Reply Button */}
                    {depth < 2 && comment.status === 'approved' && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 text-gray-600 hover:text-cartoon-blue text-sm"
                        >
                            <BiReply />
                            Reply
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {showReplyForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onSubmit={handleReply}
                        className="mt-4"
                    >
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full p-3 border-2 border-gray-200 rounded-cartoon focus:border-cartoon-blue outline-none resize-none"
                            rows="3"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowReplyForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-cartoon-blue text-white rounded-cartoon hover:shadow-cartoon"
                            >
                                Reply
                            </button>
                        </div>
                    </motion.form>
                )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <Comment
                            key={reply._id}
                            comment={reply}
                            onReply={onReply}
                            onDelete={onDelete}
                            onReaction={onReaction}
                            depth={depth + 1}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// Main Comment Section Component
const CommentSection = ({ storyId, username = '', isAuthenticated = false }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const isAdmin = isAuthenticated && username === 'admin';

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/comments/story/${storyId}?sort=${sortBy}`);

            // Organize comments into tree structure
            const organizeComments = (comments) => {
                const commentMap = {};
                const rootComments = [];

                comments.forEach(comment => {
                    commentMap[comment._id] = { ...comment, replies: [] };
                });

                comments.forEach(comment => {
                    if (comment.parentComment) {
                        if (commentMap[comment.parentComment]) {
                            commentMap[comment.parentComment].replies.push(commentMap[comment._id]);
                        }
                    } else {
                        rootComments.push(commentMap[comment._id]);
                    }
                });

                return rootComments;
            };

            setComments(organizeComments(response.data.comments));
        } catch (error) {
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [storyId, sortBy]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) return;

        try {
            setSubmitting(true);
            const sessionId = localStorage.getItem('sessionId') || Date.now().toString();
            localStorage.setItem('sessionId', sessionId);

            await api.post(`/comments/story/${storyId}`, {
                content: formData.content,
                author: {
                    name: formData.name || 'Anonymous',
                    email: formData.email,
                    sessionId
                }
            });

            toast.success('Comment submitted for moderation');
            setFormData({ name: '', email: '', content: '' });

            // Refresh comments if admin
            if (isAdmin) {
                fetchComments();
            }
        } catch (error) {
            toast.error('Failed to submit comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (content, parentId) => {
        try {
            const sessionId = localStorage.getItem('sessionId') || Date.now().toString();

            await api.post(`/comments/story/${storyId}`, {
                content,
                author: {
                    name: isAuthenticated ? username : 'Anonymous',
                    sessionId
                },
                parentId
            });

            toast.success('Reply submitted for moderation');

            if (isAdmin) {
                fetchComments();
            }
        } catch (error) {
            toast.error('Failed to submit reply');
        }
    };

    const handleDelete = (commentId) => {
        setComments(prevComments =>
            prevComments.filter(comment => comment._id !== commentId)
        );
    };

    const handleReaction = () => {
        // Refresh comments to show updated reactions
        fetchComments();
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FiMessageCircle className="text-cartoon-blue" />
                    Comments
                </h2>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border-2 border-black rounded-cartoon focus:outline-none focus:border-cartoon-blue"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                </select>
            </div>

            {/* Comment Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6 mb-8"
            >
                <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>

                {!isAuthenticated && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Your Name (optional)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-cartoon focus:border-cartoon-blue outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Your Email (optional)"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="px-4 py-2 border-2 border-gray-200 rounded-cartoon focus:border-cartoon-blue outline-none"
                        />
                    </div>
                )}

                <textarea
                    placeholder="Share your thoughts..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-cartoon focus:border-cartoon-blue outline-none resize-none"
                    rows="4"
                    required
                />

                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                        Comments are moderated before appearing
                    </p>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-cartoon-blue text-white rounded-cartoon hover:shadow-cartoon disabled:opacity-50 flex items-center gap-2"
                    >
                        <FiSend />
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </motion.form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="loading loading-spinner loading-lg text-cartoon-blue"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-cartoon">
                    <FiMessageCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {comments.map(comment => (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                onReply={handleReply}
                                onDelete={handleDelete}
                                onReaction={handleReaction}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default CommentSection;