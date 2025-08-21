// client/src/Components/CommentSection.js
// Modified version that checks auth internally

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageCircle, FiSend, FiHeart, FiThumbsUp,
    FiX, FiTrash2, FiChevronDown, FiChevronUp,
    FiUser, FiMail
} from 'react-icons/fi';
import { BiReply } from 'react-icons/bi';
import api from '../Api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Single Comment Component with Delete Button
const Comment = ({
    comment,
    onReply,
    onDelete,
    onReaction,
    depth = 0,
    isAdmin = false
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleReaction = async (type) => {
        try {
            const sessionId = localStorage.getItem('sessionId') || Date.now().toString();
            localStorage.setItem('sessionId', sessionId);

            await api.post(`/comments/${comment._id}/reaction`, {
                type,
                sessionId
            });

            onReaction(comment._id, type);
            toast.success('Reaction added!');
        } catch (error) {
            toast.error('Failed to add reaction');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            // Admin can force delete any comment
            const endpoint = `/comments/${comment._id}/admin`;

            await api.delete(endpoint);
            onDelete(comment._id);
            toast.success('Comment deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete comment');
        } finally {
            setIsDeleting(false);
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
                ${comment.status === 'rejected' ? 'opacity-50' : ''}
            `}>
                {/* Comment Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cartoon-purple rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                {comment.author?.name?.[0]?.toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">
                                {comment.author?.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {getStatusBadge()}

                        {/* Delete Button - Only visible to admin (authenticated user) */}
                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`
                                    p-2 rounded-full transition-colors
                                    ${isDeleting
                                        ? 'bg-gray-200 cursor-not-allowed'
                                        : 'hover:bg-red-100 text-red-600'
                                    }
                                `}
                                title="Delete comment"
                            >
                                {isDeleting ? (
                                    <div className="animate-spin">
                                        <FiX className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <FiTrash2 className="w-4 h-4" />
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                    {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                    {/* Reactions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleReaction('like')}
                            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FiThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{comment.reactions?.likes?.length || 0}</span>
                        </button>
                        <button
                            onClick={() => handleReaction('heart')}
                            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FiHeart className="w-4 h-4" />
                            <span className="text-sm">{comment.reactions?.hearts?.length || 0}</span>
                        </button>
                    </div>

                    {/* Reply Button */}
                    {depth < 2 && comment.status === 'approved' && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 text-sm text-cartoon-blue hover:underline"
                        >
                            <BiReply />
                            Reply
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                <AnimatePresence>
                    {showReplyForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleReply}
                            className="mt-3 pl-4 border-l-2 border-cartoon-blue"
                        >
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full p-2 border-2 border-gray-200 rounded-cartoon resize-none focus:outline-none focus:border-cartoon-blue"
                                rows="3"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary rounded-cartoon"
                                >
                                    Send Reply
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReplyForm(false)}
                                    className="btn btn-sm btn-ghost rounded-cartoon"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4">
                        {comment.replies.map((reply) => (
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
            </div>
        </motion.div>
    );
};

// Main Comment Section Component - Self-contained auth check
const CommentSection = ({ storyId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [showCommentForm, setShowCommentForm] = useState(false);

    // Auth state - check internally
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');

    const isAdmin = isAuthenticated; // Since only admin can login
    const hasComments = comments.length > 0;

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/check');
                if (response.data.authenticated) {
                    setIsAuthenticated(true);
                    setUsername(response.data.user?.username || '');
                    console.log('CommentSection auth check:', {
                        authenticated: true,
                        username: response.data.user?.username
                    });
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                setUsername('');
            }
        };

        checkAuth();
    }, []);

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
            console.log('Comments loaded:', response.data.comments.length, 'isAdmin:', isAdmin);
        } catch (error) {
            console.error('Failed to load comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [storyId, sortBy, isAdmin]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            toast.error('Please write a comment');
            return;
        }

        try {
            setSubmitting(true);
            const sessionId = localStorage.getItem('sessionId') || Date.now().toString();
            localStorage.setItem('sessionId', sessionId);

            await api.post(`/comments/story/${storyId}`, {
                content: formData.content,
                author: {
                    name: formData.name || 'Anonymous',
                    email: formData.email || '',
                    sessionId
                }
            });

            toast.success(isAdmin
                ? 'Comment posted successfully!'
                : 'Comment submitted! It will appear after moderation.');

            setFormData({ name: '', email: '', content: '' });
            setShowCommentForm(false);

            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error('Submit error:', error);
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

            toast.success(isAdmin
                ? 'Reply posted successfully!'
                : 'Reply submitted for moderation');

            fetchComments();
        } catch (error) {
            toast.error('Failed to submit reply');
        }
    };

    const handleDelete = (commentId) => {
        // Remove comment from state immediately for better UX
        const removeComment = (comments) => {
            return comments.filter(comment => {
                if (comment._id === commentId) {
                    return false;
                }
                if (comment.replies) {
                    comment.replies = removeComment(comment.replies);
                }
                return true;
            });
        };

        setComments(prevComments => removeComment(prevComments));
    };

    const handleReaction = () => {
        // Refresh comments to show updated reactions
        fetchComments();
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                    Debug: Auth: {String(isAuthenticated)} | Username: {username} | Admin: {String(isAdmin)}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FiMessageCircle className="text-cartoon-blue" />
                    Comments {hasComments && `(${comments.length})`}
                </h2>

                {hasComments && (
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 border-2 border-black rounded-cartoon focus:outline-none focus:border-cartoon-blue text-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="popular">Most Popular</option>
                    </select>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            )}

            {/* Comments List - Show first if comments exist */}
            {!loading && hasComments && (
                <div className="space-y-4 mb-8">
                    <AnimatePresence>
                        {comments.map((comment) => (
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

            {/* No Comments Message */}
            {!loading && !hasComments && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-cartoon mb-6"
                >
                    <FiMessageCircle className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                </motion.div>
            )}

            {/* Add Comment Section - Collapsible and compact */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-4"
            >
                {/* Toggle Button for Comment Form */}
                <button
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-cartoon transition-colors"
                >
                    <span className="font-semibold flex items-center gap-2">
                        <FiMessageCircle />
                        {hasComments ? 'Add a Comment' : 'Write the First Comment'}
                    </span>
                    {showCommentForm ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {/* Collapsible Comment Form */}
                <AnimatePresence>
                    {showCommentForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleSubmit}
                            className="mt-4 space-y-4"
                        >
                            {/* Name and Email in one row - Hide if authenticated */}
                            {!isAuthenticated && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Your Name (optional)"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-cartoon focus:outline-none focus:border-cartoon-blue"
                                        />
                                    </div>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Your Email (optional)"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-cartoon focus:outline-none focus:border-cartoon-blue"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Show who's commenting if authenticated */}
                            {isAuthenticated && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Commenting as: <span className="font-semibold">{username}</span>
                                </div>
                            )}

                            {/* Comment textarea */}
                            <textarea
                                placeholder="Share your thoughts..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-3 border-2 border-gray-200 rounded-cartoon resize-none focus:outline-none focus:border-cartoon-blue"
                                rows="4"
                                required
                            />

                            {/* Submit button */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCommentForm(false)}
                                    className="btn btn-ghost rounded-cartoon"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.content.trim()}
                                    className="btn btn-primary rounded-cartoon shadow-cartoon flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend />
                                            Post Comment
                                        </>
                                    )}
                                </button>
                            </div>

                            {!isAdmin && (
                                <p className="text-xs text-gray-500 text-center">
                                    Comments are moderated and will appear after approval.
                                </p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CommentSection;