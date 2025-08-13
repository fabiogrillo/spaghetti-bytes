// client/src/utils/OptimizedAnimations.js

// Import only what we need from framer-motion

import { motion, AnimatePresence } from 'framer-motion';

// Common animation variants to reuse
export const animations = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },

    slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 }
    },

    slideInLeft: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 20, opacity: 0 }
    },

    scale: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 }
    },

    stagger: {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }
};

// Export only what's needed
export { motion, AnimatePresence };