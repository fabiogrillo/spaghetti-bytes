import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCoffee, BiHeart } from 'react-icons/bi';

const DonationButton = ({ variant = 'floating' }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(5);
    const [customAmount, setCustomAmount] = useState('');

    const donationAmounts = [
        { value: 3, emoji: '☕', label: 'Coffee' },
        { value: 5, emoji: '🍝', label: 'Spaghetti' },
        { value: 10, emoji: '🍕', label: 'Pizza' },
        { value: 25, emoji: '🍱', label: 'Full Meal' }
    ];

    const handleDonation = () => {
        const amount = customAmount || selectedAmount;
        // Integrate with payment provider (Stripe, PayPal, etc.)
        window.open(`https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID&amount=${amount}`, '_blank');
    };

    if (variant === 'floating') {
        return (
            <>
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(true)}
                    className="fixed bottom-24 left-4 z-40 btn btn-circle btn-lg bg-gradient-to-br from-cartoon-orange to-cartoon-pink text-white shadow-cartoon hover:shadow-cartoon-hover"
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <BiCoffee size={28} />
                    </motion.div>
                </motion.button>

                <AnimatePresence>
                    {showModal && <DonationModal />}
                </AnimatePresence>
            </>
        );
    }

    if (variant === 'inline') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cartoon-orange to-cartoon-pink p-6 rounded-cartoon shadow-cartoon border-2 border-black my-8"
            >
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <BiHeart className="animate-pulse" />
                    Enjoying the content?
                </h3>
                <p className="text-white/90 mb-4">
                    Support Spaghetti Bytes with a virtual coffee! ☕
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(true)}
                    className="btn bg-white text-cartoon-pink rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
                >
                    <BiCoffee size={20} />
                    Buy me a coffee
                </motion.button>

                <AnimatePresence>
                    {showModal && <DonationModal />}
                </AnimatePresence>
            </motion.div>
        );
    }

    // Donation Modal Component
    function DonationModal() {
        return (
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
                    className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-2 text-center">
                        Support Spaghetti Bytes! 🍝
                    </h2>
                    <p className="text-gray-600 mb-6 text-center">
                        Your support helps keep the blog running and motivates me to create more content!
                    </p>

                    {/* Preset Amounts */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {donationAmounts.map((amount) => (
                            <motion.button
                                key={amount.value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedAmount(amount.value);
                                    setCustomAmount('');
                                }}
                                className={`p-4 rounded-cartoon border-2 border-black ${selectedAmount === amount.value && !customAmount
                                        ? 'bg-cartoon-yellow shadow-cartoon'
                                        : 'bg-white shadow-cartoon-sm hover:shadow-cartoon'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{amount.emoji}</div>
                                <div className="font-bold">${amount.value}</div>
                                <div className="text-xs text-gray-600">{amount.label}</div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="mb-6">
                        <label className="label">
                            <span className="label-text">Or enter custom amount:</span>
                        </label>
                        <div className="input-group">
                            <span className="bg-cartoon-pink text-white">$</span>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="0.00"
                                className="input input-bordered w-full rounded-r-cartoon"
                                min="1"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="btn btn-ghost rounded-cartoon flex-1"
                        >
                            Maybe later
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDonation}
                            className="btn bg-gradient-to-r from-cartoon-orange to-cartoon-pink text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover flex-1"
                        >
                            <BiHeart />
                            Donate ${customAmount || selectedAmount}
                        </motion.button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        Secure payment via PayPal
                    </p>
                </motion.div>
            </motion.div>
        );
    }
};

export default DonationButton;