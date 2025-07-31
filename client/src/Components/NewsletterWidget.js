import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiEnvelope, BiCheck } from 'react-icons/bi';
import { HiSparkles } from "react-icons/hi2";

const NewsletterWidget = ({ source = 'homepage', variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Please enter a valid email');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    source,
                    referrer: document.referrer
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Successfully subscribed! Check your email to confirm.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again later.');
        }
    };

    // Different variants for different placements
    if (variant === 'inline') {
        return (
            <div className="bg-gradient-to-r from-cartoon-pink to-cartoon-purple p-6 rounded-cartoon shadow-cartoon border-2 border-black">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <HiSparkles className="animate-pulse" />
                    Never Miss a Byte!
                </h3>
                <p className="text-white/90 mb-4">
                    Get weekly updates on new articles, tips, and resources.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input input-bordered flex-1 rounded-cartoon w-full"
                        disabled={status === 'loading' || status === 'success'}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="btn bg-white text-cartoon-purple rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon w-full sm:w-auto px-6"
                    >
                        {status === 'loading' ? (
                            <span className="loading loading-spinner"></span>
                        ) : status === 'success' ? (
                            <BiCheck size={20} />
                        ) : (
                            'Subscribe'
                        )}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-sm mt-2 ${status === 'error' ? 'text-red-200' : 'text-white'
                                }`}
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Default widget (sidebar/modal)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-cartoon shadow-cartoon border-2 border-black"
        >
            <div className="text-center mb-6">
                <motion.div
                    animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mx-auto mb-4"
                >
                    📬
                </motion.div>

                <h2 className="text-3xl font-bold mb-2">
                    Join the <span className="gradient-text">Spaghetti Club</span>!
                </h2>

                <p className="text-gray-600 dark:text-gray-300">
                    🍝 Weekly digest of coding recipes<br />
                    🚀 Early access to new content<br />
                    💡 Exclusive tips & resources
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text flex items-center gap-2">
                            <BiEnvelope className="text-cartoon-pink" />
                            Your email address
                        </span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="chef@example.com"
                        className="input input-bordered w-full rounded-cartoon shadow-cartoon-sm"
                        disabled={status === 'loading' || status === 'success'}
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`btn w-full rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover ${status === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-cartoon-pink text-white'
                        }`}
                >
                    {status === 'loading' ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            Subscribing...
                        </>
                    ) : status === 'success' ? (
                        <>
                            <BiCheck size={24} />
                            Subscribed!
                        </>
                    ) : (
                        <>
                            <BiEnvelope size={20} />
                            Subscribe to Newsletter
                        </>
                    )}
                </motion.button>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`alert ${status === 'error' ? 'alert-error' : 'alert-success'
                                } rounded-cartoon`}
                        >
                            <span>{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
                No spam, unsubscribe anytime.
                <br />We respect your inbox! 💌
            </p>
        </motion.div>
    );
};

export default NewsletterWidget;