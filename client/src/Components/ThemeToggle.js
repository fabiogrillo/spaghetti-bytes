import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BiSun, BiMoon } from 'react-icons/bi';
import { IoSnowOutline } from 'react-icons/io5';

const ThemeToggle = ({ className = '' }) => {
    // Check if we're in Christmas season (until January 15, 2026)
    const isChristmasSeason = useMemo(() => {
        const now = new Date();
        const endDate = new Date('2026-01-15');
        return now < endDate;
    }, []);

    // Define available themes
    const availableThemes = useMemo(() => {
        const themes = [
            { name: 'modern', icon: <BiSun size={20} />, label: 'Light' },
            { name: 'midnight', icon: <BiMoon size={20} />, label: 'Dark' },
        ];

        // Add festive theme only during Christmas season
        if (isChristmasSeason) {
            themes.push({
                name: 'festive',
                icon: <IoSnowOutline size={20} />,
                label: 'Christmas'
            });
        }

        return themes;
    }, [isChristmasSeason]);

    // Initialize theme (migrate from old themes if needed)
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        // Migrate old themes
        if (savedTheme === 'cartoon') return 'modern';
        if (savedTheme === 'night') return 'midnight';
        // Check if saved theme is still available
        if (savedTheme && availableThemes.find(t => t.name === savedTheme)) {
            return savedTheme;
        }
        return 'modern';
    };

    const [theme, setTheme] = useState(getInitialTheme);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    useEffect(() => {
        const index = availableThemes.findIndex(t => t.name === theme);
        setCurrentThemeIndex(index >= 0 ? index : 0);
    }, [theme, availableThemes]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const nextIndex = (currentThemeIndex + 1) % availableThemes.length;
        setTheme(availableThemes[nextIndex].name);
    };

    const currentTheme = availableThemes[currentThemeIndex];

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`btn btn-ghost btn-circle ${className}`}
            title={`Switch to ${availableThemes[(currentThemeIndex + 1) % availableThemes.length].label} Theme`}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {currentTheme?.icon}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;