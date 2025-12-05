import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiCookie, BiX } from 'react-icons/bi';

const CookieBanner = () => {
    const [show, setShow] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Aspetta un secondo prima di mostrare il banner
            setTimeout(() => setShow(true), 1000);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookieConsent', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
        }));
        setShow(false);
        // Inizializza analytics
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
    };

    const acceptNecessary = () => {
        localStorage.setItem('cookieConsent', JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
        }));
        setShow(false);
        // Blocca analytics
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
            });
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4"
            >
                <div className="container mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-soft shadow-soft-lg border border-base-300 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <BiCookie className="text-4xl text-warning animate-bounce" />
                                <h3 className="text-xl font-bold">Cookie Time! 🍪</h3>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <BiX size={20} />
                            </button>
                        </div>

                        <p className="text-sm mb-4">
                            Hey! I use cookies to make your experience sweeter.
                            Some are essential (like sugar in cookies),
                            others help me understand what you like to read.
                        </p>

                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="mb-4 space-y-2"
                            >
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <strong>🔒 Essentials:</strong> Login, theme preference
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <strong>📊 Analytics:</strong> Understanding which articles you like
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <strong>🎯 Marketing:</strong> No one for now!
                                </div>
                            </motion.div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={acceptAll}
                                className="btn btn-primary rounded-soft shadow-soft hover:shadow-soft-lg"
                            >
                                Accept all cookies
                            </button>
                            <button
                                onClick={acceptNecessary}
                                className="btn btn-outline rounded-soft"
                            >
                                Only essentials
                            </button>
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="btn btn-ghost rounded-soft"
                            >
                                {showDetails ? 'Nascondi' : 'Mostra'} details
                            </button>
                        </div>

                        <p className="text-xs mt-4 text-gray-600 dark:text-gray-400">
                            You can change your mind whenever you want. Read the{' '}
                            <Link to="/privacy" className="underline hover:text-error">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CookieBanner;