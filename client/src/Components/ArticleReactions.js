import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Api';

const ArticleReactions = ({ articleId }) => {
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
        // fetchReactions();
        loadUserReactions();
    }, [articleId]);

    const fetchReactions = async () => {
        try {
            const response = await api.get(`/api/articles/${articleId}/reactions`);
            setReactions(response.data.reactions);
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    const loadUserReactions = () => {
        const stored = localStorage.getItem(`reactions_${articleId}`);
        if (stored) {
            setUserReactions(JSON.parse(stored));
        }
    };

    const handleReaction = async (reactionKey) => {
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
        <div className="my-8">
            <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4 text-center">
                    How did you like this article? 🤔
                </h3>

                <div className="flex flex-wrap justify-center gap-4">
                    {reactionEmojis.map(({ key, emoji, label }) => {
                        const hasReacted = userReactions.includes(key);
                        const count = reactions[key] || 0;

                        return (
                            <motion.button
                                key={key}
                                whileHover={{ scale: hasReacted ? 1 : 1.1 }}
                                whileTap={{ scale: hasReacted ? 1 : 0.9 }}
                                onClick={() => handleReaction(key)}
                                className={`relative group ${hasReacted ? 'cursor-default' : 'cursor-pointer'}`}
                                disabled={hasReacted}
                            >
                                <div className={`
                                    flex flex-col items-center p-3 rounded-cartoon border-2 border-black
                                    ${hasReacted
                                        ? 'bg-cartoon-yellow shadow-cartoon'
                                        : 'bg-white hover:shadow-cartoon shadow-cartoon-sm'
                                    }
                                    transition-all duration-200
                                `}>
                                    <span className="text-4xl mb-1">{emoji}</span>
                                    {count > 0 && (
                                        <span className="text-sm font-bold">{count}</span>
                                    )}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black text-white text-xs px-2 py-1 rounded">
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
                </div>

                {userReactions.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Thanks for your feedback! 🎉
                    </p>
                )}
            </div>
        </div>
    );
};

export default ArticleReactions;