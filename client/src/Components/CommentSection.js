// client/src/Components/CommentSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageCircle,
    FiSend,
    FiHeart,
    FiThumbsUp,
    FiThumbsDown,
    FiSmile,
    FiAward,
    FiFlag,
    FiEdit2,
    FiTrash2,
    FiCornerDownRight
} from 'react-icons/fi';
import TimeAgo from 'react-timeago';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';

// Comment Form Component
const CommentForm = ({ onSubmit, parentId = null, onCancel = null, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || localStorage.getItem('commentAuthorName') || '',
        email: initialData?.email || localStorage.getItem('commentAuthorEmail') || '',
        website: initialData?.website || localStorage.getItem('commentAuthorWebsite') || '',
        content: initialData?.content || ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim() || formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
            newErrors.website = 'Please enter a valid URL (including http:// or https://)';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Comment cannot be empty';
        } else if (formData.content.length > 5000) {
            newErrors.content = 'Comment must be less than 5000 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Save user info to localStorage for next time
            localStorage.setItem('commentAuthorName', formData.name);
            localStorage.setItem('commentAuthorEmail', formData.email);
            localStorage.setItem('commentAuthorWebsite', formData.website);

            await onSubmit({
                author: {
                    name: formData.name,
                    email: formData.email,
                    website: formData.website
                },
                content: formData.content,
                parentId
            });

            // Clear content after successful submission
            setFormData(prev => ({ ...prev, content: '' }));

            if (onCancel) {
                onCancel();
            }
        } catch (error) {
            setErrors({ submit: 'Failed to post comment. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-4 bg-white rounded-cartoon border-2 border-black shadow-cartoon"
            onSubmit={handleSubmit}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name *"
                        value={formData.name}
                        onChange={handleChange}
                        className={clsx(
                            "w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-cartoon-blue",
                            errors.name ? "border-red-500" : "border-gray-300"
                        )}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email (optional)"
                        value={formData.email}
                        onChange={handleChange}
                        className={clsx(
                            "w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-cartoon-blue",
                            errors.email ? "border-red-500" : "border-gray-300"
                        )}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <input
                        type="url"
                        name="website"
                        placeholder="Website (optional)"
                        value={formData.website}
                        onChange={handleChange}
                        className={clsx(
                            "w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-cartoon-blue",
                            errors.website ? "border-red-500" : "border-gray-300"
                        )}
                    />
                    {errors.website && (
                        <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                    )}
                </div>
            </div>

            <div>
                <textarea
                    name="content"
                    placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
                    value={formData.content}
                    onChange={handleChange}
                    rows={4}
                    className={clsx(
                        "w-full px-3 py-2 border-2 rounded-lg resize-none focus:outline-none focus:border-cartoon-blue",
                        errors.content ? "border-red-500" : "border-gray-300"
                    )}
                />
                {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                    {formData.content.length}/5000 characters
                </p>
            </div>

            {errors.submit && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 rounded-lg">
                    {errors.submit}
                </div>
            )}

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx(
                        "px-6 py-2 bg-cartoon-blue text-white rounded-full font-bold",
                        "hover:bg-blue-600 transition-colors flex items-center gap-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <FiSend />
                    {isSubmitting ? 'Posting...' : (parentId ? 'Reply' : 'Post Comment')}
                </button>
            </div>
        </motion.form>
    );
};

// Single Comment Component
const Comment = ({ comment, onReply, onReaction, onEdit, onDelete, onFlag, sessionId, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const maxDepth = 1; // Only allow 1 level of nesting

    const canReply = depth < maxDepth;
    const isOwn = comment.metadata?.sessionId === sessionId;
    const canEdit = isOwn && comment.canEdit;

    const getAvatarUrl = () => {
        if (comment.author.avatarUrl) return comment.author.avatarUrl;
        if (comment.author.gravatarUrl) return comment.author.gravatarUrl;

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`;
    };

    const handleReaction = (reaction) => {
        onReaction(comment._id, reaction);
    };

    const reactions = [
        { key: 'love', icon: FiHeart, color: 'text-red-500' },
        { key: 'thumbsUp', icon: FiThumbsUp, color: 'text-blue-500' },
        { key: 'thumbsDown', icon: FiThumbsDown, color: 'text-gray-500' },
        { key: 'laugh', icon: FiSmile, color: 'text-yellow-500' },
        { key: 'wow', icon: FiAward, color: 'text-purple-500' }
    ];

    if (comment.status === 'deleted') {
        return (
            <div className="opacity-50 italic p-4 bg-gray-100 rounded-lg">
                This comment has been deleted
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                "flex gap-3",
                depth > 0 && "ml-12 mt-4"
            )}
        >
            {/* Avatar */}
            <img
                src={getAvatarUrl()}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full border-2 border-black flex-shrink-0"
            />

            {/* Comment Content */}
            <div className="flex-1">
                <div className="bg-white rounded-2xl px-4 py-3 border-2 border-black shadow-sm">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">
                            {comment.author.website ? (
                                <a
                                    href={comment.author.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-cartoon-blue transition-colors"
                                >
                                    {comment.author.name}
                                </a>
                            ) : (
                                comment.author.name
                            )}
                        </span>
                        <span className="text-gray-500 text-sm">
                            <TimeAgo date={comment.createdAt} />
                        </span>
                        {comment.metadata?.editHistory?.length > 0 && (
                            <span className="text-gray-400 text-sm">(edited)</span>
                        )}
                    </div>

                    {/* Comment Text */}
                    {isEditing ? (
                        <CommentForm
                            onSubmit={async (data) => {
                                await onEdit(comment._id, data.content);
                                setIsEditing(false);
                            }}
                            onCancel={() => setIsEditing(false)}
                            initialData={{
                                name: comment.author.name,
                                email: comment.author.email,
                                website: comment.author.website,
                                content: comment.content
                            }}
                        />
                    ) : (
                        <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {/* Reactions */}
                    {reactions.map(({ key, icon: Icon, color }) => (
                        <button
                            key={key}
                            onClick={() => handleReaction(key)}
                            className={clsx(
                                "flex items-center gap-1 px-2 py-1 rounded-full text-sm",
                                "hover:bg-gray-100 transition-colors",
                                comment.hasVoted && comment.reactions[key] > 0 && color
                            )}
                        >
                            <Icon size={16} />
                            {comment.reactions[key] > 0 && (
                                <span>{comment.reactions[key]}</span>
                            )}
                        </button>
                    ))}

                    <div className="flex-1" />

                    {/* Action Buttons */}
                    {canReply && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-cartoon-blue transition-colors"
                        >
                            <FiCornerDownRight size={16} />
                            Reply
                        </button>
                    )}

                    {canEdit && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-cartoon-blue transition-colors"
                        >
                            <FiEdit2 size={16} />
                            Edit
                        </button>
                    )}

                    {isOwn && (
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <FiTrash2 size={16} />
                            Delete
                        </button>
                    )}

                    {!isOwn && (
                        <button
                            onClick={() => onFlag(comment._id)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-orange-500 transition-colors"
                        >
                            <FiFlag size={16} />
                            Report
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {showReplyForm && (
                    <div className="mt-4">
                        <CommentForm
                            onSubmit={async (data) => {
                                await onReply(data);
                                setShowReplyForm(false);
                            }}
                            parentId={comment._id}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {comment.replies.map(reply => (
                            <Comment
                                key={reply._id}
                                comment={reply}
                                onReply={onReply}
                                onReaction={onReaction}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onFlag={onFlag}
                                sessionId={sessionId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Main Comment Section Component
const CommentSection = ({ storyId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [sortBy, setSortBy] = useState('newest');
    const [sessionId, setSessionId] = useState(null);
    const [stats, setStats] = useState(null);

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false
    });

    // Fetch comments
    const fetchComments = useCallback(async (page = 1) => {
        try {
            const response = await fetch(
                `/api/comments/story/${storyId}?page=${page}&limit=20&sort=${sortBy}`
            );
            const data = await response.json();

            if (page === 1) {
                setComments(data.comments);
            } else {
                setComments(prev => [...prev, ...data.comments]);
            }

            setPagination(data.pagination);

            // Get session ID from response headers or generate one
            const newSessionId = response.headers.get('X-Session-Id') ||
                localStorage.getItem('commentSessionId') ||
                Math.random().toString(36).substring(7);
            setSessionId(newSessionId);
            localStorage.setItem('commentSessionId', newSessionId);

        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    }, [storyId, sortBy]);

    // Fetch comment stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`/api/comments/story/${storyId}/stats`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [storyId]);

    useEffect(() => {
        fetchComments(1);
        fetchStats();
    }, [fetchComments, fetchStats]);

    // Load more when scrolling
    useEffect(() => {
        if (inView && pagination.page < pagination.pages) {
            fetchComments(pagination.page + 1);
        }
    }, [inView, pagination, fetchComments]);

    // Handle new comment
    const handleSubmitComment = async (commentData) => {
        const response = await fetch(`/api/comments/story/${storyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to post comment');
        }

        const { comment } = await response.json();

        if (commentData.parentId) {
            // Add reply to parent comment
            setComments(prev => prev.map(c => {
                if (c._id === commentData.parentId) {
                    return {
                        ...c,
                        replies: [...(c.replies || []), comment]
                    };
                }
                return c;
            }));
        } else {
            // Add new top-level comment
            setComments(prev => [comment, ...prev]);
        }

        // Update stats
        fetchStats();
    };

    // Handle reactions
    const handleReaction = async (commentId, reaction) => {
        try {
            await fetch(`/api/comments/${commentId}/reaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reaction })
            });

            // Update local state
            const updateReactions = (comments) => {
                return comments.map(c => {
                    if (c._id === commentId) {
                        return {
                            ...c,
                            reactions: {
                                ...c.reactions,
                                [reaction]: c.reactions[reaction] + 1
                            },
                            hasVoted: true
                        };
                    }
                    if (c.replies) {
                        c.replies = updateReactions(c.replies);
                    }
                    return c;
                });
            };

            setComments(prev => updateReactions(prev));
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    // Handle edit
    const handleEdit = async (commentId, content) => {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error('Failed to edit comment');
        }

        // Refresh comments
        fetchComments(1);
    };

    // Handle delete
    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE'
            });

            // Refresh comments
            fetchComments(1);
            fetchStats();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Handle flag
    const handleFlag = async (commentId) => {
        const reason = window.prompt('Please provide a reason for reporting this comment (optional):');

        try {
            await fetch(`/api/comments/${commentId}/flag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason })
            });

            alert('Thank you for your report. We will review this comment.');
        } catch (error) {
            console.error('Error flagging comment:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FiMessageCircle className="text-cartoon-blue" />
                    Comments {stats && `(${stats.totalComments})`}
                </h2>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border-2 border-black rounded-lg focus:outline-none focus:border-cartoon-blue"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                </select>
            </div>

            {/* Comment Form */}
            <div className="mb-8">
                <CommentForm onSubmit={handleSubmitComment} />
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="loading loading-spinner loading-lg text-cartoon-blue"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <FiMessageCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-6">
                        {comments.map(comment => (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                onReply={handleSubmitComment}
                                onReaction={handleReaction}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onFlag={handleFlag}
                                sessionId={sessionId}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Load More Indicator */}
            {pagination.page < pagination.pages && (
                <div ref={ref} className="flex justify-center py-8">
                    <div className="loading loading-spinner loading-md text-cartoon-blue"></div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;