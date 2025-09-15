import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSun, BiMoon } from 'react-icons/bi';

const ThemeToggle = ({ className = '' }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'cartoon');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'cartoon' ? 'night' : 'cartoon';
        setTheme(newTheme);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`btn btn-ghost btn-circle ${className}`}
            title={theme === 'cartoon' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'cartoon' ? <BiMoon size={20} /> : <BiSun size={20} />}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;