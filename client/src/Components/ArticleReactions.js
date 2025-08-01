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
    const [animatingEmojis, setAnimatingEmojis] = useState([]);

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
                const response = await api.get(`/api/stories/${articleId}/reactions`);
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

    const handleReaction = async (reactionKey, emoji) => {
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

        // Show animation - emoji flying to counter
        const animationId = Date.now();
        setAnimatingEmojis(prev => [...prev, { id: animationId, emoji, key: reactionKey }]);
        setTimeout(() => {
            setAnimatingEmojis(prev => prev.filter(e => e.id !== animationId));
        }, 1500);

        // Send to server
        try {
            await api.post(`/api/stories/${articleId}/reactions`, {
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

    // Calculate total reactions
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    return (
        <div className="relative">
            {/* Reaction Counter - positioned at top right */}
            {totalReactions > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-16 right-0 bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon-sm border-2 border-black p-3"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Reactions:</span>
                        <div className="flex gap-1">
                            {reactionEmojis.map(({ key, emoji }) => {
                                const count = reactions[key];
                                if (count === 0) return null;
                                return (
                                    <div key={key} className="flex items-center">
                                        <span className="text-lg">{emoji}</span>
                                        <span className="text-xs font-bold ml-0.5">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Reaction Buttons - positioned at bottom right */}
            <div className={`flex items-center gap-3 justify-end ${compact ? 'mt-4' : 'mt-6'}`}>
                {reactionEmojis.map(({ key, emoji, label }, index) => {
                    const hasReacted = userReactions.includes(key);
                    const count = reactions[key] || 0;

                    return (
                        <motion.button
                            key={key}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }
                            }}
                            whileHover={!hasReacted ? {
                                scale: 1.3,
                                rotate: [0, -10, 10, -10, 0],
                                transition: { duration: 0.3 }
                            } : {}}
                            whileTap={!hasReacted ? { scale: 0.8 } : {}}
                            onClick={() => handleReaction(key, emoji)}
                            className={`relative group ${hasReacted ? 'cursor-default' : 'cursor-pointer'}`}
                            disabled={hasReacted}
                        >
                            <div className={`
                                flex flex-col items-center p-2 rounded-cartoon
                                ${hasReacted
                                    ? 'bg-cartoon-pink/20 opacity-100'
                                    : 'bg-gray-100 dark:bg-gray-700 opacity-80 hover:opacity-100 hover:bg-cartoon-yellow/20'
                                }
                                transition-all duration-200
                            `}>
                                <span className="text-2xl md:text-3xl">{emoji}</span>
                                {count > 0 && (
                                    <span className={`text-xs font-bold mt-1 ${hasReacted ? 'text-cartoon-pink' : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </div>

                            {/* Tooltip */}
                            {!hasReacted && (
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="bg-black text-white text-xs px-3 py-1 rounded-cartoon whitespace-nowrap">
                                        {label}
                                    </div>
                                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-black absolute left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            )}
                        </motion.button>
                    );
                })}

                {userReactions.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-gray-500 dark:text-gray-400 ml-4 hidden md:block"
                    >
                        Thanks! 🎉
                    </motion.p>
                )}
            </div>

            {/* Flying emoji animations */}
            <AnimatePresence>
                {animatingEmojis.map(({ id, emoji, key }) => (
                    <motion.div
                        key={id}
                        initial={{
                            scale: 2,
                            opacity: 1,
                            x: 0,
                            y: 0
                        }}
                        animate={{
                            scale: 0.8,
                            opacity: 0,
                            x: 100,
                            y: -80
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute bottom-4 right-4 pointer-events-none z-20"
                        style={{ fontSize: '3rem' }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ArticleReactions;