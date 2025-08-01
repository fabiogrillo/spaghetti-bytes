import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Api';

const ArticleReactions = ({ articleId, compact = false }) => {
    const [reactions, setReactions] = useState({
        love: 0,
        spaghetti: 0,
        fire: 0,
        mind_blown: 0,
        clap: 0
    });
    const [userReactions, setUserReactions] = useState([]);
    const [showAnimation, setShowAnimation] = useState(null);

    const reactionEmojis = [
        { key: 'love', emoji: '❤️', label: 'Love it!' },
        { key: 'spaghetti', emoji: '🍝', label: 'Delicious!' },
        { key: 'fire', emoji: '🔥', label: 'Fire!' },
        { key: 'mind_blown', emoji: '🤯', label: 'Mind blown!' },
        { key: 'clap', emoji: '👏', label: 'Well done!' }
    ];

    useEffect(() => {
        const fetchReactions = async () => {
            if (!articleId) return;

            try {
                const response = await api.get(`/api/articles/${articleId}/reactions`);
                setReactions(response.data.reactions);
            } catch (error) {
                console.error('Error fetching reactions:', error);
            }
        };

        const loadUserReactions = () => {
            if (!articleId) return;

            const stored = localStorage.getItem(`reactions_${articleId}`);
            if (stored) {
                setUserReactions(JSON.parse(stored));
            }
        };

        fetchReactions();
        loadUserReactions();
    }, [articleId]);

    const handleReaction = async (reactionKey) => {
        if (!articleId) return;

        // Check if user already reacted with this emoji
        if (userReactions.includes(reactionKey)) {
            return;
        }

        // Optimistic update
        setReactions(prev => ({
            ...prev,
            [reactionKey]: prev[reactionKey] + 1
        }));

        // Add to user reactions
        const newUserReactions = [...userReactions, reactionKey];
        setUserReactions(newUserReactions);
        localStorage.setItem(`reactions_${articleId}`, JSON.stringify(newUserReactions));

        // Show animation
        setShowAnimation(reactionKey);
        setTimeout(() => setShowAnimation(null), 1000);

        // Send to server
        try {
            await api.post(`/api/articles/${articleId}/reactions`, {
                reaction: reactionKey
            });
        } catch (error) {
            // Rollback on error
            setReactions(prev => ({
                ...prev,
                [reactionKey]: prev[reactionKey] - 1
            }));
            setUserReactions(userReactions);
            localStorage.setItem(`reactions_${articleId}`, JSON.stringify(userReactions));
        }
    };

    return (
        <div className={`flex items-center gap-3 ${compact ? 'justify-start' : 'justify-center'} my-6`}>
            {reactionEmojis.map(({ key, emoji, label }) => {
                const hasReacted = userReactions.includes(key);
                const count = reactions[key] || 0;

                return (
                    <motion.button
                        key={key}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: [0, -5, 0]
                        }}
                        transition={{
                            duration: 0.5,
                            delay: reactionEmojis.findIndex(r => r.key === key) * 0.1,
                            y: {
                                repeat: Infinity,
                                repeatDelay: 5,
                                duration: 1
                            }
                        }}
                        whileHover={{
                            scale: 1.2,
                            rotate: [0, -10, 10, -10, 0],
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(key)}
                        className={`relative group ${hasReacted ? 'cursor-default' : 'cursor-pointer'}`}
                        disabled={hasReacted}
                    >
                        <div className={`
                            flex flex-col items-center
                            ${hasReacted ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                            transition-opacity duration-200
                        `}>
                            <span className="text-3xl">{emoji}</span>
                            {count > 0 && (
                                <span className={`text-xs font-bold mt-1 ${hasReacted ? 'text-cartoon-pink' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {label}
                            </div>
                        </div>

                        {/* Animation on click */}
                        <AnimatePresence>
                            {showAnimation === key && (
                                <motion.div
                                    initial={{ scale: 0, y: 0 }}
                                    animate={{ scale: 2, y: -50, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <span className="text-6xl">{emoji}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                );
            })}

            {userReactions.length > 0 && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-gray-500 dark:text-gray-400 ml-4"
                >
                    Thanks! 🎉
                </motion.p>
            )}
        </div>
    );
};

export default ArticleReactions;