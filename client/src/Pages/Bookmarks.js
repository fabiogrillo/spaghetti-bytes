import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiBookmarkHeart, BiTrash, BiSearch } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../Api';
import toast from 'react-hot-toast';
import BookmarkButton from '../Components/BookmarkButton';

const Bookmarks = () => {
    const [bookmarkedStories, setBookmarkedStories] = useState([]);
    const [filteredStories, setFilteredStories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('dateAdded');

    useEffect(() => {
        loadBookmarkedStories();
    }, []);

    useEffect(() => {
        filterStories();
    }, [searchQuery, sortBy, bookmarkedStories]);

    const loadBookmarkedStories = async () => {
        setIsLoading(true);
        try {
            const bookmarkIds = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            
            if (bookmarkIds.length === 0) {
                setBookmarkedStories([]);
                setIsLoading(false);
                return;
            }

            // Fetch story details for each bookmark
            const storyPromises = bookmarkIds.map(async (id) => {
                try {
                    const response = await api.get(`/stories/${id}`);
                    return { ...response.data, bookmarkedAt: Date.now() };
                } catch (error) {
                    console.error(`Error loading story ${id}:`, error);
                    return null;
                }
            });

            const stories = (await Promise.all(storyPromises)).filter(Boolean);
            setBookmarkedStories(stories);
        } catch (error) {
            toast.error('Failed to load bookmarked stories');
        } finally {
            setIsLoading(false);
        }
    };

    const filterStories = () => {
        let filtered = [...bookmarkedStories];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(story => 
                story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'dateAdded':
                    return (b.bookmarkedAt || 0) - (a.bookmarkedAt || 0);
                case 'datePublished':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'readingTime':
                    return (a.readingTime || 0) - (b.readingTime || 0);
                default:
                    return 0;
            }
        });

        setFilteredStories(filtered);
    };

    const clearAllBookmarks = () => {
        if (window.confirm('Are you sure you want to remove all bookmarks? This action cannot be undone.')) {
            localStorage.setItem('bookmarks', '[]');
            setBookmarkedStories([]);
            setFilteredStories([]);
            toast.success('All bookmarks cleared');
        }
    };

    const onBookmarkRemoved = () => {
        loadBookmarkedStories();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <span className="loading loading-ring loading-lg text-cartoon-pink"></span>
                    <p className="text-gray-600 dark:text-gray-400">Loading your bookmarks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                        <BiBookmarkHeart className="text-cartoon-pink" />
                        <span className="gradient-text">My Bookmarks</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Your saved articles for later reading
                    </p>
                </motion.div>

                {bookmarkedStories.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="text-6xl mb-6">📚</div>
                        <h2 className="text-2xl font-bold mb-4">No bookmarks yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Start bookmarking articles you want to read later!
                        </p>
                        <Link
                            to="/blog"
                            className="btn bg-cartoon-pink text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover"
                        >
                            <BsStars size={20} />
                            Explore Articles
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon"
                        >
                            {/* Search */}
                            <div className="flex-1">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search bookmarks..."
                                        className="input input-bordered flex-1 rounded-cartoon"
                                    />
                                    <span className="btn btn-square bg-cartoon-blue text-white rounded-cartoon">
                                        <BiSearch size={20} />
                                    </span>
                                </div>
                            </div>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="select select-bordered rounded-cartoon"
                            >
                                <option value="dateAdded">Date Added</option>
                                <option value="datePublished">Date Published</option>
                                <option value="title">Title A-Z</option>
                                <option value="readingTime">Reading Time</option>
                            </select>

                            {/* Clear All */}
                            <button
                                onClick={clearAllBookmarks}
                                className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-cartoon"
                            >
                                <BiTrash size={16} />
                                Clear All
                            </button>
                        </motion.div>

                        {/* Results Count */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6"
                        >
                            <p className="text-gray-600 dark:text-gray-400">
                                {filteredStories.length} of {bookmarkedStories.length} bookmarks
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                        </motion.div>

                        {/* Bookmarks Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredStories.map((story, index) => (
                                <motion.div
                                    key={story._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover transition-all duration-300 overflow-hidden"
                                >
                                    {story.coverImage && (
                                        <img
                                            src={story.coverImage}
                                            alt={story.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg line-clamp-2 flex-1">
                                                <Link
                                                    to={`/visualizer/${story._id}`}
                                                    className="hover:text-cartoon-pink transition-colors"
                                                >
                                                    {story.title}
                                                </Link>
                                            </h3>
                                            <div onClick={onBookmarkRemoved}>
                                                <BookmarkButton storyId={story._id} variant="compact" />
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                            {story.summary}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {story.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="badge badge-sm bg-cartoon-yellow text-black"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Meta */}
                                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                            <span>
                                                {story.readingTime ? `${story.readingTime} min read` : 'Quick read'}
                                            </span>
                                            <span>
                                                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {filteredStories.length === 0 && searchQuery && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold mb-2">No results found</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try adjusting your search terms
                                </p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;