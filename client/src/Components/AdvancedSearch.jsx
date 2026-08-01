import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSearch, BiFilter, BiX } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

const AdvancedSearch = ({ onResults, onClose, allStories = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        tags: [],
        dateRange: 'all',
        readingTime: 'all'
    });
    const [availableTags, setAvailableTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Extract unique tags from all stories
        if (allStories.length > 0) {
            const allTags = allStories.flatMap(story => story.tags || []);
            const uniqueTags = [...new Set(allTags)].sort();
            setAvailableTags(uniqueTags);
        }
    }, [allStories]);

    const handleSearch = () => {
        setIsLoading(true);
        
        try {
            let filteredStories = [...allStories];

            // Text search
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filteredStories = filteredStories.filter(story => 
                    story.title.toLowerCase().includes(query) ||
                    story.summary.toLowerCase().includes(query) ||
                    (story.content && story.content.toLowerCase().includes(query))
                );
            }

            // Tag filter
            if (filters.tags.length > 0) {
                filteredStories = filteredStories.filter(story =>
                    filters.tags.some(tag => story.tags?.includes(tag))
                );
            }

            // Date filter
            if (filters.dateRange !== 'all') {
                const now = new Date();
                const filterDate = new Date();
                
                switch (filters.dateRange) {
                    case 'week':
                        filterDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        filterDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'year':
                        filterDate.setFullYear(now.getFullYear() - 1);
                        break;
                    default:
                        break;
                }
                
                if (filters.dateRange !== 'all') {
                    filteredStories = filteredStories.filter(story =>
                        new Date(story.createdAt) >= filterDate
                    );
                }
            }

            // Reading time filter
            if (filters.readingTime !== 'all') {
                filteredStories = filteredStories.filter(story => {
                    const readingTime = story.readingTime || Math.ceil((story.content || '').split(' ').length / 200);
                    
                    switch (filters.readingTime) {
                        case 'quick':
                            return readingTime <= 5;
                        case 'medium':
                            return readingTime > 5 && readingTime <= 15;
                        case 'long':
                            return readingTime > 15;
                        default:
                            return true;
                    }
                });
            }

            onResults(filteredStories);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTag = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag) 
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <div className="bg-white dark:bg-gray-800 rounded-soft shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BsStars className="text-error" />
                        Advanced Search
                    </h2>
                    <button 
                        onClick={onClose}
                        className="btn btn-ghost btn-circle"
                    >
                        <BiX size={24} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6 space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Search Term</span>
                        </label>
                        <div className="input-group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles, tutorials, tips..."
                                className="input input-bordered flex-1 rounded-soft"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button 
                                className="btn bg-error text-white rounded-soft"
                                onClick={handleSearch}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <BiSearch size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Tags</span>
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`badge badge-lg cursor-pointer transition-all ${
                                        filters.tags.includes(tag)
                                            ? 'bg-error text-white shadow-soft'
                                            : 'badge-outline hover:bg-error hover:text-white'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Range */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Date Range</span>
                            </label>
                            <select 
                                className="select select-bordered rounded-soft"
                                value={filters.dateRange}
                                onChange={(e) => setFilters(prev => ({...prev, dateRange: e.target.value}))}
                            >
                                <option value="all">All Time</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="year">Last Year</option>
                            </select>
                        </div>

                        {/* Reading Time */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Reading Time</span>
                            </label>
                            <select 
                                className="select select-bordered rounded-soft"
                                value={filters.readingTime}
                                onChange={(e) => setFilters(prev => ({...prev, readingTime: e.target.value}))}
                            >
                                <option value="all">Any Length</option>
                                <option value="quick">Quick Read (≤ 5 min)</option>
                                <option value="medium">Medium Read (5-15 min)</option>
                                <option value="long">Long Read (≥ 15 min)</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || (!searchQuery.trim() && filters.tags.length === 0)}
                            className="btn bg-secondary text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover px-8"
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <BiFilter size={20} />
                                    Search with Filters
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdvancedSearch;