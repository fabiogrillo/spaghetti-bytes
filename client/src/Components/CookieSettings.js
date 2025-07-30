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
                className="fixed bottom-6 left-6 z-40 btn btn-circle btn-sm bg-cartoon-yellow text-black shadow-cartoon hover:shadow-cartoon-hover"
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
                        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <BiCookie className="text-cartoon-yellow" />
                                    Cookie Preferences
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
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Essential Cookies</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Analytics Cookies</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Help us understand how you use the website
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
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Marketing Cookies</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                <button
                                    onClick={savePreferences}
                                    className="btn btn-primary rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon flex-1"
                                >
                                    <BiCheck size={20} />
                                    Save Preferences
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-ghost rounded-cartoon"
                                >
                                    Cancel
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 text-center">
                                Read our <Link to="/privacy" className="underline">Privacy Policy</Link> for more information
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default CookieSettings;