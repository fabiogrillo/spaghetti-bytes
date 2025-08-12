// client/src/Components/LoadingSpinner.js
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'lg', message = 'Loading...' }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8"
        >
            <span className={`loading loading-infinity loading-${size} text-cartoon-pink`}></span>
            {message && (
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{message}</p>
            )}
        </motion.div>
    );
};

export default LoadingSpinner;