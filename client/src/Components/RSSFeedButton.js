import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BiRss } from 'react-icons/bi';
import { HiOutlineClipboardCopy, HiCheck } from 'react-icons/hi';

const RSSFeedButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const feedUrl = `${window.location.origin}/feed.xml`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(feedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const feedReaders = [
        { name: 'Feedly', url: `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`, color: 'bg-green-500' },
        { name: 'Inoreader', url: `https://www.inoreader.com/feed/${encodeURIComponent(feedUrl)}`, color: 'bg-blue-500' },
        { name: 'The Old Reader', url: `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(feedUrl)}`, color: 'bg-orange-500' }
    ];

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
                title="Subscribe via RSS"
            >
                <BiRss size={24} />
                <span>RSS Feed</span>
            </motion.button>

            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <BiRss className="text-orange-500" />
                            Subscribe to RSS Feed
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Stay updated with our latest posts! Choose your preferred RSS reader or copy the feed URL.
                        </p>

                        {/* Feed URL */}
                        <div className="mb-6">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Feed URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={feedUrl}
                                    readOnly
                                    className="input input-bordered flex-1 rounded-cartoon text-sm"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="btn btn-square rounded-cartoon"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <HiCheck className="text-green-500" /> : <HiOutlineClipboardCopy />}
                                </button>
                            </div>
                        </div>

                        {/* Popular RSS Readers */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Subscribe with:
                            </p>
                            {feedReaders.map((reader) => (
                                <a
                                    key={reader.name}
                                    href={reader.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full p-3 rounded-cartoon text-white font-bold text-center ${reader.color} hover:opacity-90 transition-opacity`}
                                >
                                    Subscribe with {reader.name}
                                </a>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-ghost rounded-cartoon"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default RSSFeedButton;