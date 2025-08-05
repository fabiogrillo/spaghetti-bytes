import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCoffee, BiHeart } from 'react-icons/bi';
import DonationModal from './DonationModal';

const PAYPAL_USERNAME = process.env.REACT_APP_PAYPAL_USERNAME;

const DonationButton = ({ variant = 'floating', compact = false }) => {
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
        window.open(`https://www.paypal.com/paypalme/${PAYPAL_USERNAME}/${amount}EUR`, '_blank');
    };

    return (
        <>
            {variant === 'floating' && (
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
            )}

            {variant === 'inline' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-r from-cartoon-orange to-cartoon-pink ${compact ? 'p-4' : 'p-6'} rounded-cartoon shadow-cartoon border-2 border-black`}
                >
                    {!compact && (
                        <>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <BiHeart className="animate-pulse" />
                                Enjoying the content?
                            </h3>
                            <p className="dark:text-grey mb-4">
                                Support Spaghetti Bytes with a virtual coffee! ☕
                            </p>
                        </>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className={`btn bg-white text-cartoon-pink rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon ${compact ? 'btn-sm w-full' : ''}`}
                    >
                        <BiCoffee size={compact ? 16 : 20} />
                        {compact ? 'Donate' : 'Buy me a coffee'}
                    </motion.button>
                </motion.div>
            )}

            <AnimatePresence>
                {showModal && (
                    <DonationModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        donationAmounts={donationAmounts}
                        selectedAmount={selectedAmount}
                        setSelectedAmount={setSelectedAmount}
                        customAmount={customAmount}
                        setCustomAmount={setCustomAmount}
                        handleDonation={handleDonation}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default DonationButton;
