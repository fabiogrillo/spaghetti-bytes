import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaMedium, FaRss } from "react-icons/fa";
import { BiHeart } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showRSSModal, setShowRSSModal] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(null);

  const socialLinks = [
    {
      icon: FaGithub,
      url: "https://github.com/fabiogrillo",
      label: "GitHub",
      color: "hover:text-gray-900 dark:hover:text-white"
    },
    {
      icon: FaLinkedin,
      url: "https://www.linkedin.com/in/fabgrillo",
      label: "LinkedIn",
      color: "hover:text-cartoon-blue"
    },
    {
      icon: FaMedium,
      url: "https://medium.com/@fgrillo123",
      label: "Medium",
      color: "hover:text-black dark:hover:text-white"
    }
  ];

  const rssFeeds = [
    {
      type: "RSS 2.0",
      url: `${window.location.origin}/rss.xml`,
      description: "Standard RSS feed for most readers"
    },
    {
      type: "Atom",
      url: `${window.location.origin}/atom.xml`,
      description: "Alternative feed format"
    },
    {
      type: "JSON Feed",
      url: `${window.location.origin}/feed.json`,
      description: "Modern JSON-based feed"
    }
  ];

  const copyToClipboard = async (url, feedType) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFeed(feedType);
      setTimeout(() => setCopiedFeed(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <footer className="bg-base-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                <span className="gradient-text">Spaghetti Bytes</span> 🍝
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Untangling code, one byte at a time
              </p>
            </motion.div>

            {/* Social Links + RSS with Divider */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              {/* Social Links */}
              <div className="flex gap-4 sm:gap-6">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        text-2xl sm:text-3xl text-gray-600 dark:text-gray-400 
                        transition-colors duration-300
                        ${social.color}
                      `}
                    >
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

              {/* RSS Feed Button */}
              <motion.button
                onClick={() => setShowRSSModal(true)}
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-400 
                         transition-colors duration-300 hover:text-orange-500"
                aria-label="RSS Feed"
              >
                <FaRss />
              </motion.button>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-sm sm:max-w-md"
            >
              <div className="bg-gradient-to-r from-cartoon-pink/10 to-cartoon-purple/10 
                            rounded-2xl p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-center text-gray-700 dark:text-gray-300 mb-3">
                  📬 Get notified about new posts
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input input-bordered input-sm sm:input-md flex-1"
                  />
                  <button className="btn btn-primary btn-sm sm:btn-md">
                    Subscribe
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-full max-w-xs">
              <div className="divider my-0"></div>
            </div>

            {/* Copyright & Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-3"
            >
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                Made with <BiHeart className="text-cartoon-pink animate-pulse" /> and lots of 🍝
              </p>

              {/* Policy Links */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs">
                <Link to="/privacy" className="hover:text-cartoon-pink transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => {
                    document.querySelector('[aria-label="Cookie settings"]')?.click();
                  }}
                  className="hover:text-cartoon-pink transition-colors cursor-pointer"
                >
                  Cookie Settings
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => setShowRSSModal(true)}
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  RSS Feed
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {currentYear} Spaghetti Bytes. All rights reserved.
              </p>
            </motion.div>

            {/* Fun Easter Egg */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="text-xs text-gray-400 dark:text-gray-600 italic text-center px-4"
            >
              {"// TODO: Fix all the spaghetti code... eventually 😅"}
            </motion.div>
          </div>
        </div>
      </footer>

      {/* RSS Modal */}
      <AnimatePresence>
        {showRSSModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRSSModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                         border-2 border-black w-full max-w-lg max-h-[85vh] 
                         overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaRss className="text-xl sm:text-2xl text-orange-500" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        Subscribe via RSS
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowRSSModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 
                               text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {/* Feed Options */}
                  <div className="space-y-3">
                    {rssFeeds.map((feed) => (
                      <div
                        key={feed.type}
                        className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl 
                                 border-2 border-gray-200 dark:border-gray-600
                                 hover:border-orange-400 transition-colors"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                              {feed.type}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {feed.description}
                            </p>
                          </div>

                          {/* URL and Actions */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={feed.url}
                              readOnly
                              className="input input-sm input-bordered w-full 
                                       text-xs font-mono bg-white dark:bg-gray-800"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(feed.url, feed.type)}
                                className="btn btn-sm btn-outline flex-1"
                              >
                                {copiedFeed === feed.type ? (
                                  <span className="flex items-center gap-1">
                                    <BsCheckCircle className="text-green-500" />
                                    Copied!
                                  </span>
                                ) : (
                                  'Copy'
                                )}
                              </button>
                              <a
                                href={feed.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary flex-1"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">
                      How to use RSS feeds:
                    </h4>
                    <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>1. Copy the feed URL above</li>
                      <li>2. Open your RSS reader (Feedly, Inoreader, etc.)</li>
                      <li>3. Add a new subscription and paste the URL</li>
                      <li>4. Enjoy automatic updates when new posts are published!</li>
                    </ol>
                  </div>

                  {/* Popular RSS Readers */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Popular RSS readers:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-cartoon-yellow">
                      <a
                        href="https://feedly.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:text-cartoon-pink transition-colors px-2"
                      >
                        Feedly
                      </a>
                      <span className="text-gray-400">•</span>
                      <a
                        href="https://www.inoreader.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:text-cartoon-pink transition-colors px-2"
                      >
                        Inoreader
                      </a>
                      <span className="text-gray-400">•</span>
                      <a
                        href="https://newsblur.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:text-cartoon-pink transition-colors px-2"
                      >
                        NewsBlur
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;