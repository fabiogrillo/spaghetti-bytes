import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaTwitter,
    FaLinkedin,
    FaFacebook,
    FaWhatsapp,
    FaReddit,
    FaTelegram,
    FaEnvelope,
    FaLink,
    FaShare
} from 'react-icons/fa';

const ShareButtons = ({ url, title, summary }) => {
    const [showAll, setShowAll] = useState(false);
    const [copied, setCopied] = useState(false);

    // URL encoding per condivisione
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedSummary = encodeURIComponent(summary);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%20${encodedUrl}`
    };

    const primaryShares = [
        { name: 'Twitter', icon: FaTwitter, link: shareLinks.twitter, color: 'hover:bg-blue-400' },
        { name: 'LinkedIn', icon: FaLinkedin, link: shareLinks.linkedin, color: 'hover:bg-blue-600' },
        { name: 'WhatsApp', icon: FaWhatsapp, link: shareLinks.whatsapp, color: 'hover:bg-green-500' }
    ];

    const secondaryShares = [
        { name: 'Facebook', icon: FaFacebook, link: shareLinks.facebook, color: 'hover:bg-blue-700' },
        { name: 'Reddit', icon: FaReddit, link: shareLinks.reddit, color: 'hover:bg-orange-500' },
        { name: 'Telegram', icon: FaTelegram, link: shareLinks.telegram, color: 'hover:bg-blue-500' },
        { name: 'Email', icon: FaEnvelope, link: shareLinks.email, color: 'hover:bg-gray-600' }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = (link) => {
        window.open(link, '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold flex items-center gap-2">
                <FaShare className="text-cartoon-pink" />
                Share:
            </span>

            {/* Primary share buttons */}
            {primaryShares.map((share) => {
                const Icon = share.icon;
                return (
                    <motion.button
                        key={share.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShare(share.link)}
                        className={`btn btn-circle btn-sm bg-gray-200 dark:bg-gray-700 ${share.color} hover:text-white transition-colors`}
                        aria-label={`Share on ${share.name}`}
                    >
                        <Icon size={16} />
                    </motion.button>
                );
            })}

            {/* Show more button */}
            {!showAll && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAll(true)}
                    className="btn btn-sm btn-ghost rounded-cartoon"
                >
                    More...
                </motion.button>
            )}

            {/* Secondary share buttons */}
            {showAll && (
                <>
                    {secondaryShares.map((share) => {
                        const Icon = share.icon;
                        return (
                            <motion.button
                                key={share.name}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleShare(share.link)}
                                className={`btn btn-circle btn-sm bg-gray-200 dark:bg-gray-700 ${share.color} hover:text-white transition-colors`}
                                aria-label={`Share on ${share.name}`}
                            >
                                <Icon size={16} />
                            </motion.button>
                        );
                    })}
                </>
            )}

            {/* Copy link button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="btn btn-circle btn-sm bg-gray-200 dark:bg-gray-700 hover:bg-cartoon-purple hover:text-white transition-colors"
                aria-label="Copy link"
            >
                <FaLink size={16} />
            </motion.button>

            {/* Copied notification */}
            {copied && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-cartoon-green font-semibold"
                >
                    Copied!
                </motion.span>
            )}
        </div>
    );
};

export default ShareButtons;