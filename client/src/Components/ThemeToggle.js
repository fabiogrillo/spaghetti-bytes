import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSun, BiMoon } from 'react-icons/bi';

const ThemeToggle = ({ className = '' }) => {
    // Simple light/dark toggle
    const themes = [
        { name: 'modern', icon: <BiSun size={20} />, label: 'Light' },
        { name: 'midnight', icon: <BiMoon size={20} />, label: 'Dark' },
    ];

    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        // Migrate old themes
        if (savedTheme === 'cartoon' || savedTheme === 'festive') return 'modern';
        if (savedTheme === 'night') return 'midnight';
        if (savedTheme === 'modern' || savedTheme === 'midnight') return savedTheme;
        return 'modern';
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'modern' ? 'midnight' : 'modern');
    };

    const currentIcon = theme === 'modern' ? <BiSun size={20} /> : <BiMoon size={20} />;
    const nextLabel = theme === 'modern' ? 'Dark' : 'Light';

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`btn btn-ghost btn-circle ${className}`}
            title={`Switch to ${nextLabel} Theme`}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {currentIcon}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
