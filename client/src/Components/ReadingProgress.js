import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReadingProgress = ({ contentRef, onProgressChange }) => {
    const [progress, setProgress] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        if (!contentRef?.current) return;

        const handleScroll = () => {
            const element = contentRef.current;
            if (!element) return;

            const { top, height } = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const currentScrollY = window.scrollY;

            // Calculate progress
            const scrolled = Math.max(0, -top);
            const totalScrollable = height - windowHeight;
            const progressPercent = totalScrollable > 0 ? Math.min(100, (scrolled / totalScrollable) * 100) : 0;

            setProgress(progressPercent);
            setScrollY(currentScrollY);

            // Notify parent component of progress change
            if (onProgressChange) {
                onProgressChange(progressPercent);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [contentRef, onProgressChange]);

    return (
        <>
            {/* Minimal Progress Bar - Desktop */}
            <motion.div
                className="fixed top-0 left-0 h-[3px] bg-error/60 z-40"
                style={{ width: `${progress}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollY > 200 ? 0.6 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Minimal Progress Circle - Mobile */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: scrollY > 300 ? 0.7 : 0,
                    scale: scrollY > 300 ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-28 right-4 z-30 sm:hidden"
            >
                <div className="relative w-10 h-10 bg-base-100/80 dark:bg-base-200/80 backdrop-blur-sm rounded-full shadow-lg">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-300 dark:text-gray-600"
                        />
                        <motion.circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-error"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - progress / 100) }}
                            transition={{ duration: 0.1 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-base-content">
                            {Math.round(progress)}
                        </span>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ReadingProgress;
