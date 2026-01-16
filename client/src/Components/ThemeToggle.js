import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSun, BiMoon } from 'react-icons/bi';

const ThemeToggle = ({ className = '' }) => {
    const getInitialTheme = () => {
        const saved = localStorage.getItem('theme');
        // Migrate any old theme names to light/dark
        if (saved === 'dark' || saved === 'midnight' || saved === 'night') return 'dark';
        return 'light';
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const isDark = theme === 'dark';

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`btn btn-ghost btn-circle ${className}`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? <BiMoon size={20} /> : <BiSun size={20} />}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
