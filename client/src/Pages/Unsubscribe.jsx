import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiEnvelope, BiCheck, BiError } from 'react-icons/bi';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Token flow state
    const [tokenStatus, setTokenStatus] = useState('idle'); // idle, loading, success, error
    const [tokenMessage, setTokenMessage] = useState('');

    // Email form flow state
    const [email, setEmail] = useState('');
    const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error
    const [formMessage, setFormMessage] = useState('');

    // If a token is present in the URL, process it automatically on mount
    useEffect(() => {
        if (!token) return;

        const processToken = async () => {
            setTokenStatus('loading');
            try {
                const response = await fetch(`/api/newsletter/unsubscribe/${token}`);
                if (response.ok) {
                    setTokenStatus('success');
                    setTokenMessage("You've been successfully unsubscribed. We're sorry to see you go!");
                } else {
                    setTokenStatus('error');
                    setTokenMessage("This link is invalid or has already been used.");
                }
            } catch {
                setTokenStatus('error');
                setTokenMessage("Network error. Please try again later.");
            }
        };

        processToken();
    }, [token]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setFormStatus('loading');
        try {
            const response = await fetch('/api/newsletter/unsubscribe/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                setFormStatus('success');
                setFormMessage(data.message);
            } else {
                setFormStatus('error');
                setFormMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setFormStatus('error');
            setFormMessage('Network error. Please try again later.');
        }
    };

    // ── Token flow ──────────────────────────────────────────────
    if (token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-soft shadow-soft-lg border border-base-300 max-w-md w-full text-center"
                >
                    {tokenStatus === 'loading' && (
                        <>
                            <span className="loading loading-spinner loading-lg text-error mb-4"></span>
                            <p className="text-gray-600 dark:text-gray-300">Processing your request...</p>
                        </>
                    )}

                    {tokenStatus === 'success' && (
                        <>
                            <div className="text-5xl mb-4">👋</div>
                            <h1 className="text-2xl font-bold mb-2 dark:text-white">Unsubscribed</h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{tokenMessage}</p>
                            <Link to="/" className="btn bg-error text-white rounded-soft">
                                Back to Spaghetti Bytes
                            </Link>
                        </>
                    )}

                    {tokenStatus === 'error' && (
                        <>
                            <BiError className="text-5xl text-error mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2 dark:text-white">Invalid Link</h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{tokenMessage}</p>
                            <p className="text-sm text-gray-500 mb-6">
                                Need to unsubscribe? Enter your email below.
                            </p>
                            <Link to="/unsubscribe" className="btn bg-error text-white rounded-soft">
                                Try with email
                            </Link>
                        </>
                    )}
                </motion.div>
            </div>
        );
    }

    // ── Email form flow ──────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-soft shadow-soft-lg border border-base-300 max-w-md w-full"
            >
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">📭</div>
                    <h1 className="text-2xl font-bold dark:text-white">Unsubscribe</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Enter your email and we'll send you an unsubscribe link.
                    </p>
                </div>

                {formStatus === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <BiCheck className="text-5xl text-success mx-auto mb-4" />
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{formMessage}</p>
                        <Link to="/" className="btn bg-error text-white rounded-soft">
                            Back to Spaghetti Bytes
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <BiEnvelope className="text-error" />
                                    Your email address
                                </span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input input-bordered w-full rounded-soft"
                                disabled={formStatus === 'loading'}
                                required
                            />
                        </div>

                        {formStatus === 'error' && (
                            <p className="text-error text-sm">{formMessage}</p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={formStatus === 'loading'}
                            className="btn bg-error text-white w-full rounded-soft"
                        >
                            {formStatus === 'loading' ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                'Send unsubscribe link'
                            )}
                        </motion.button>

                        <div className="text-center">
                            <Link to="/" className="text-sm text-gray-500 hover:text-error">
                                ← Back to Spaghetti Bytes
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Unsubscribe;
