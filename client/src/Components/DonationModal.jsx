import React from 'react';
import { motion } from 'framer-motion';
import { BiHeart } from 'react-icons/bi';

const DonationModal = ({
    show,
    onClose,
    donationAmounts,
    selectedAmount,
    customAmount,
    setSelectedAmount,
    setCustomAmount,
    handleDonation
}) => {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-base-100 dark:bg-base-200 rounded-soft shadow-soft-lg border border-base-300 p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 text-center">
                    Support Spaghetti Bytes! 🍝
                </h2>
                <p className="opacity-80 mb-6 text-center">
                    Your support helps keep the blog running and motivates me to create more content!
                </p>

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
                            className={`p-4 rounded-soft border border-base-300 transition-all duration-300 ${selectedAmount === amount.value && !customAmount
                                    ? 'bg-warning text-black shadow-soft-lg'
                                    : 'bg-base-200 hover:bg-base-300 shadow-soft hover:shadow-soft-lg'
                                }`}
                        >
                            <div className="text-3xl mb-1">{amount.emoji}</div>
                            <div className="font-bold">€{amount.value}</div>
                            <div className="text-xs opacity-70">{amount.label}</div>
                        </motion.button>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="label">
                        <span className="label-text font-semibold">Or enter custom amount:</span>
                    </label>
                    <div className="input-group">
                        <span className="text-accent font-bold">€</span>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder="0.00"
                            className="input input-bordered w-full rounded-r-soft bg-base-200"
                            min="1"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost rounded-soft flex-1"
                    >
                        Maybe later
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDonation}
                        className="btn bg-gradient-to-r from-accent to-error text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover flex-1"
                    >
                        <BiHeart />
                        Donate €{customAmount || selectedAmount}
                    </motion.button>
                </div>

                <p className="text-xs opacity-60 text-center mt-4">
                    Secure payment via PayPal
                </p>
            </motion.div>
        </motion.div>
    );
};

export default DonationModal;
