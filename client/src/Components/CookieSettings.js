import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiCookie, BiCheck, BiX } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const CookieSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false
    });
    const [currentTheme, setCurrentTheme] = useState('modern');

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            const data = JSON.parse(consent);
            setPreferences({
                necessary: true, // Always true
                analytics: data.analytics || false,
                marketing: data.marketing || false
            });
        }
    }, []);

    useEffect(() => {
        const detectTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setCurrentTheme(theme || 'modern');
        };

        detectTheme();

        // Observer per rilevare cambio tema
        const observer = new MutationObserver(detectTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, []);

    const isFestive = currentTheme === 'festive';

    const savePreferences = () => {
        const consentData = {
            ...preferences,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cookieConsent', JSON.stringify(consentData));

        // Update Google Analytics consent
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': preferences.analytics ? 'granted' : 'denied',
                'ad_storage': preferences.marketing ? 'granted' : 'denied'
            });
        }

        setIsOpen(false);

        // Show success notification
        alert('Cookie preferences updated!');
    };

    return (
        <>
            {/* Floating Cookie Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 btn btn-circle btn-sm bg-gradient-to-br from-accent to-warning text-white shadow-soft-lg hover:shadow-soft-hover transition-all duration-300"
                aria-label="Cookie settings"
            >
                <BiCookie size={20} />
            </motion.button>

            {/* Settings Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-base-100/95 backdrop-blur-md rounded-soft shadow-soft-lg border border-base-200 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <BiCookie className="text-warning" />
                                    {isFestive ? '🎄 Cookie Preferences 🎅' : 'Cookie Preferences'}
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-ghost btn-circle btn-sm"
                                >
                                    <BiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Necessary Cookies */}
                                <div className="p-4 rounded-soft border-l-4 border-l-primary bg-primary/10 hover:bg-primary/20 transition-colors duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">Essential Cookies</h3>
                                            <p className="text-sm opacity-80">
                                                Required for the website to function properly
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.necessary}
                                            disabled
                                            className="checkbox checkbox-primary"
                                        />
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="p-4 rounded-soft border-l-4 border-l-accent bg-accent/10 hover:bg-accent/20 transition-colors duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">Analytics Cookies</h3>
                                            <p className="text-sm opacity-80">
                                                Help me understand how you use the website
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.analytics}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                analytics: e.target.checked
                                            })}
                                            className="checkbox checkbox-primary"
                                        />
                                    </div>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="p-4 rounded-soft border-l-4 border-l-warning bg-warning/10 hover:bg-warning/20 transition-colors duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">Marketing Cookies</h3>
                                            <p className="text-sm opacity-80">
                                                Used for targeted advertising (currently not used)
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.marketing}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                marketing: e.target.checked
                                            })}
                                            className="checkbox checkbox-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={savePreferences}
                                    className="btn bg-gradient-to-br from-primary to-accent text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover transition-all duration-300 flex-1"
                                >
                                    <BiCheck size={20} />
                                    Save Preferences
                                </motion.button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-ghost rounded-soft"
                                >
                                    Cancel
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 text-center">
                                Read my <Link to="/privacy" className="underline">Privacy Policy</Link> for more information
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default CookieSettings;