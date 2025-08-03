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
    const [hoveredReaction, setHoveredReaction] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    const reactionEmojis = [
        { key: 'love', emoji: '❤️', label: 'Love it!', color: 'bg-red-500' },
        { key: 'spaghetti', emoji: '🍝', label: 'Delicious!', color: 'bg-yellow-500' },
        { key: 'fire', emoji: '🔥', label: 'Fire!', color: 'bg-orange-500' },
        { key: 'mind_blown', emoji: '🤯', label: 'Mind blown!', color: 'bg-purple-500' },
        { key: 'clap', emoji: '👏', label: 'Well done!', color: 'bg-blue-500' }
    ];

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchReactions = async () => {
            if (!articleId) return;

            try {
                const response = await api.get(`/stories/${articleId}/reactions`);
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

        const isRemoving = userReactions.includes(reactionKey);

        // Optimistic update
        setReactions(prev => ({
            ...prev,
            [reactionKey]: isRemoving
                ? Math.max(0, prev[reactionKey] - 1)
                : prev[reactionKey] + 1
        }));

        // Update user reactions
        let newUserReactions;
        if (isRemoving) {
            // Remove reaction
            newUserReactions = userReactions.filter(r => r !== reactionKey);
        } else {
            // Add reaction
            newUserReactions = [...userReactions, reactionKey];

            // Show animation for adding reaction (not on mobile for performance)
            if (!isMobile) {
                const animationId = Date.now();
                setAnimatingEmojis(prev => [...prev, { id: animationId, emoji, key: reactionKey }]);
                setTimeout(() => {
                    setAnimatingEmojis(prev => prev.filter(e => e.id !== animationId));
                }, 1500);
            }
        }

        setUserReactions(newUserReactions);
        localStorage.setItem(`reactions_${articleId}`, JSON.stringify(newUserReactions));

        // Send to server
        try {
            if (isRemoving) {
                await api.delete(`/stories/${articleId}/reactions`, {
                    data: { reaction: reactionKey }
                });
            } else {
                await api.post(`/stories/${articleId}/reactions`, {
                    reaction: reactionKey
                });
            }
        } catch (error) {
            console.error('Error updating reaction:', error);
            // Rollback on error
            setReactions(prev => ({
                ...prev,
                [reactionKey]: isRemoving
                    ? prev[reactionKey] + 1
                    : Math.max(0, prev[reactionKey] - 1)
            }));
            setUserReactions(userReactions);
            localStorage.setItem(`reactions_${articleId}`, JSON.stringify(userReactions));
        }
    };

    // Calculate total reactions
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="mt-6 space-y-4">
                {/* Reaction Selector - Full width on mobile */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                        React to this story:
                    </span>
                    <div className="flex justify-around items-center">
                        {reactionEmojis.map(({ key, emoji, label }) => {
                            const hasReacted = userReactions.includes(key);
                            const count = reactions[key];

                            return (
                                <motion.button
                                    key={key}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleReaction(key, emoji)}
                                    className={`flex flex-col items-center p-2 rounded-lg transition-all
                                        ${hasReacted
                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title={hasReacted ? `Remove ${label}` : label}
                                >
                                    <span className="text-xl mb-1">{emoji}</span>
                                    {count > 0 && (
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                            {count}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Total Counter - Full width on mobile */}
                {totalReactions > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 
                                 rounded-xl p-3 text-center"
                    >
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Total Reactions:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-2">
                            {totalReactions}
                        </span>
                    </motion.div>
                )}
            </div>
        );
    }

    // Desktop/Tablet Layout
    return (
        <div className="relative mt-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                {/* Reaction Selector - Left on desktop, full width on tablet */}
                <div className={`flex items-center gap-2 ${compact ? 'scale-90' : ''}`}>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 hidden sm:inline">
                        React:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {reactionEmojis.map(({ key, emoji, label, color }) => {
                            const hasReacted = userReactions.includes(key);

                            return (
                                <motion.div
                                    key={key}
                                    className="relative"
                                    onHoverStart={() => setHoveredReaction(key)}
                                    onHoverEnd={() => setHoveredReaction(null)}
                                >
                                    {/* Hover background circle */}
                                    <AnimatePresence>
                                        {hoveredReaction === key && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`absolute inset-0 -m-2 ${color} rounded-full opacity-20`}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        whileHover={{ scale: 1.3, rotate: [0, -10, 10, -10, 0] }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => handleReaction(key, emoji)}
                                        className={`relative text-2xl p-2 rounded-full transition-all cursor-pointer
                                            ${hasReacted
                                                ? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-blue-500'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        title={hasReacted ? `Remove ${label}` : label}
                                    >
                                        <motion.span
                                            animate={hasReacted ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {emoji}
                                        </motion.span>

                                        {/* Reaction count badge */}
                                        {reactions[key] > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 text-xs font-bold 
                                                         text-gray-800 dark:text-gray-200 rounded-full min-w-[20px] h-5 
                                                         flex items-center justify-center border-2 border-gray-300 dark:border-gray-600"
                                            >
                                                {reactions[key]}
                                            </motion.div>
                                        )}
                                    </motion.button>

                                    {/* Tooltip - Desktop only */}
                                    <AnimatePresence>
                                        {hoveredReaction === key && !isMobile && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                                         px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs 
                                                         rounded-md whitespace-nowrap z-10"
                                            >
                                                {hasReacted ? `Remove ${label}` : label}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                                              w-0 h-0 border-l-4 border-r-4 border-t-4 
                                                              border-transparent border-t-gray-800 dark:border-t-gray-700" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Reaction Counter - Right on desktop, below on tablet */}
                {totalReactions > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 
                                 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-600 p-3
                                 lg:ml-auto"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:inline">
                                Total Reactions:
                            </span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 sm:hidden">
                                Total:
                            </span>
                            <div className="flex gap-1 flex-wrap">
                                {reactionEmojis.map(({ key, emoji }) => {
                                    const count = reactions[key];
                                    if (count === 0) return null;
                                    return (
                                        <motion.div
                                            key={key}
                                            className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-2 py-1"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <span className="text-lg">{emoji}</span>
                                            <span className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">
                                                {count}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 
                                          text-white rounded-lg">
                                <span className="text-sm font-bold">{totalReactions}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Flying emoji animations - Desktop only */}
            {!isMobile && (
                <AnimatePresence>
                    {animatingEmojis.map(({ id, emoji, key }) => (
                        <motion.div
                            key={id}
                            initial={{
                                position: 'absolute',
                                left: reactionEmojis.findIndex(r => r.key === key) * 60 + 100,
                                top: 0,
                                opacity: 1,
                                scale: 1
                            }}
                            animate={{
                                y: -80,
                                x: 300,
                                opacity: 0,
                                scale: 2,
                                rotate: 360
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute text-3xl pointer-events-none z-50"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' }}
                        >
                            {emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
    );
};

export default ArticleReactions;