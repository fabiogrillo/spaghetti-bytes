import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiBookmark, BiBookmarkHeart } from 'react-icons/bi';
import toast from 'react-hot-toast';

const BookmarkButton = ({ storyId, variant = 'default' }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(storyId));
    }, [storyId]);

    const toggleBookmark = async () => {
        setIsLoading(true);
        
        try {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            
            if (isBookmarked) {
                // Remove bookmark
                const updatedBookmarks = bookmarks.filter(id => id !== storyId);
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                setIsBookmarked(false);
                toast.success('Removed from bookmarks');
            } else {
                // Add bookmark
                const updatedBookmarks = [...bookmarks, storyId];
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                setIsBookmarked(true);
                toast.success('Added to bookmarks!');
            }
        } catch (error) {
            toast.error('Failed to update bookmark');
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'compact') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleBookmark}
                disabled={isLoading}
                className={`btn btn-circle btn-sm ${
                    isBookmarked 
                        ? 'bg-error text-white shadow-soft' 
                        : 'btn-ghost hover:bg-error hover:text-white'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                {isLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : isBookmarked ? (
                    <BiBookmarkHeart size={16} />
                ) : (
                    <BiBookmark size={16} />
                )}
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleBookmark}
            disabled={isLoading}
            className={`btn rounded-soft shadow-soft ${
                isBookmarked 
                    ? 'bg-error text-white hover:bg-secondary' 
                    : 'btn-outline border-error text-error hover:bg-error hover:text-white'
            }`}
        >
            {isLoading ? (
                <span className="loading loading-spinner"></span>
            ) : isBookmarked ? (
                <BiBookmarkHeart size={20} />
            ) : (
                <BiBookmark size={20} />
            )}
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </motion.button>
    );
};

export default BookmarkButton;