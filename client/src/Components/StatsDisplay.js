// client/src/Components/StatsDisplay.js
// Reusable statistics display component

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper, FaComments, FaBullseye, FaUsers } from 'react-icons/fa';
import api from '../Api';

const StatsDisplay = ({ variant = 'grid', showAnimation = true, className = '' }) => {
    const [stats, setStats] = useState({
        stories: 0,
        comments: 0,
        goals: 0,
        visitors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/analytics/quick-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback to default values if API fails
            setStats({
                stories: 0,
                comments: 0,
                goals: 0,
                visitors: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const statItems = [
        {
            label: "Total Stories",
            value: stats.stories,
            icon: <FaNewspaper />,
            color: "text-cartoon-orange",
            bgGradient: "from-cartoon-orange to-orange-600",
            emoji: "📚"
        },
        {
            label: "Comments",
            value: stats.comments,
            icon: <FaComments />,
            color: "text-cartoon-blue",
            bgGradient: "from-cartoon-blue to-blue-600",
            emoji: "💬"
        },
        {
            label: "Goals",
            value: stats.goals,
            icon: <FaBullseye />,
            color: "text-cartoon-yellow",
            bgGradient: "from-cartoon-yellow to-yellow-600",
            emoji: "🎯"
        },
        {
            label: "Visitors",
            value: stats.visitors,
            icon: <FaUsers />,
            color: "text-cartoon-purple",
            bgGradient: "from-cartoon-purple to-purple-600",
            emoji: "👥"
        }
    ];

    const formatNumber = (num) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    if (loading) {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-cartoon h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    // Grid variant (for Manager and Home pages)
    if (variant === 'grid') {
        return (
            <motion.div
                variants={containerVariants}
                initial={showAnimation ? "hidden" : "visible"}
                animate="visible"
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
            >
                {statItems.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-4 text-center 
                                 border-2 border-black/10 hover:shadow-cartoon-hover transition-all duration-300"
                    >
                        <div className={`text-3xl ${stat.color} mb-2`}>{stat.icon}</div>
                        <div className="text-2xl font-bold text-white">{formatNumber(stat.value)}</div>
                        <div className="text-sm dark:text-white">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    // Horizontal variant (for landing page hero section)
    if (variant === 'horizontal') {
        return (
            <motion.div
                variants={containerVariants}
                initial={showAnimation ? "hidden" : "visible"}
                animate="visible"
                className={`flex flex-wrap justify-center gap-6 ${className}`}
            >
                {statItems.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            className={`bg-gradient-to-br ${stat.bgGradient} p-4 rounded-full shadow-lg mb-2`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-white text-2xl">{stat.icon}</span>
                        </motion.div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-500">
                                {formatNumber(stat.value)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    // Compact variant (for navbar or small spaces)
    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                {statItems.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className={`${stat.color} text-xl`}>{stat.emoji}</span>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">{stat.label}</span>
                            <span className="font-bold">{formatNumber(stat.value)}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default StatsDisplay;