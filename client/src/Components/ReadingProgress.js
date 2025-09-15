import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiBook, BiTime, BiTrendingUp } from 'react-icons/bi';

const ReadingProgress = ({ contentRef, onProgressChange }) => {
    const [progress, setProgress] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [wordsRead, setWordsRead] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!contentRef?.current) return;

        // Calculate total words and estimated reading time
        const text = contentRef.current.textContent || '';
        const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;
        const estimatedTime = Math.ceil(totalWords / 200); // 200 words per minute
        setReadingTime(estimatedTime);

        const handleScroll = () => {
            const element = contentRef.current;
            if (!element) return;

            const { top, height } = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate progress
            const scrolled = Math.max(0, -top);
            const totalScrollable = height - windowHeight;
            const progressPercent = totalScrollable > 0 ? Math.min(100, (scrolled / totalScrollable) * 100) : 0;
            
            setProgress(progressPercent);
            setWordsRead(Math.floor((progressPercent / 100) * totalWords));
            
            // Notify parent component of progress change
            if (onProgressChange) {
                onProgressChange(progressPercent);
            }
            
            // Show progress bar when user starts scrolling
            setIsVisible(scrolled > 100);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [contentRef, onProgressChange]);

    if (!isVisible) return null;

    return (
        <>
            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
            >
                <div className="relative">
                    <motion.div
                        className="h-1 bg-gradient-to-r from-cartoon-pink to-cartoon-purple"
                        style={{ width: `${progress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
                
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                                <BiBook size={16} />
                                {Math.round(progress)}% read
                            </span>
                            <span className="flex items-center gap-1">
                                <BiTime size={16} />
                                {Math.max(1, readingTime - Math.floor((progress / 100) * readingTime))} min left
                            </span>
                            <span className="hidden sm:flex items-center gap-1">
                                <BiTrendingUp size={16} />
                                {wordsRead} words
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Progress Circle (Mobile) */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-20 right-4 z-40 sm:hidden"
            >
                <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
                            transition={{ duration: 0.1 }}
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF6B9D" />
                                <stop offset="100%" stopColor="#9B59B6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ReadingProgress;