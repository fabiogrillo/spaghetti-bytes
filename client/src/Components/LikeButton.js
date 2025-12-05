import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BiLike } from 'react-icons/bi';

const LikeButton = ({ storyId }) => {
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchLikes = useCallback(async () => {
        try {
            const response = await fetch(`/api/stories/${storyId}`);
            const data = await response.json();
            setLikes(data.story?.likes || 0);
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    }, [storyId]);

    useEffect(() => {
        // Load like state from localStorage
        const likedStories = JSON.parse(localStorage.getItem('likedStories') || '{}');
        setHasLiked(!!likedStories[storyId]);

        // Fetch current likes count
        fetchLikes();
    }, [storyId, fetchLikes]);

    const handleLike = async () => {
        if (loading) return;

        setLoading(true);
        const action = hasLiked ? 'remove' : 'add';

        try {
            const response = await fetch(`/api/stories/${storyId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                const data = await response.json();
                setLikes(data.likes);

                // Update localStorage
                const likedStories = JSON.parse(localStorage.getItem('likedStories') || '{}');
                if (action === 'add') {
                    likedStories[storyId] = true;
                } else {
                    delete likedStories[storyId];
                }
                localStorage.setItem('likedStories', JSON.stringify(likedStories));
                setHasLiked(!hasLiked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-soft transition-all ${
                hasLiked
                    ? 'bg-error text-white shadow-lg'
                    : 'bg-base-200 dark:bg-base-300 text-base-content hover:bg-base-300 dark:hover:bg-base-200'
            }`}
        >
            <BiLike className={`text-xl ${hasLiked ? 'animate-pulse' : ''}`} />
            <span className="font-semibold">{likes}</span>
        </motion.button>
    );
};

export default LikeButton;
