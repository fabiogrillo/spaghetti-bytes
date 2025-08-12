// client/src/utils/OptimizedAnimations.js

// Import only what we need from framer-motion
import {
    motion,
    AnimatePresence,
    useAnimation,
    useInView,
    useScroll,
    useTransform
} from 'framer-motion/dist/framer-motion';

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

// Optimized motion components with reduced bundle size
export const OptimizedMotion = {
    div: motion.div,
    span: motion.span,
    button: motion.button,
    article: motion.article,
    section: motion.section
};

// Custom hook for intersection observer (lighter than framer-motion's)
export const useOptimizedInView = (options = {}) => {
    const [ref, setRef] = React.useState(null);
    const [inView, setInView] = React.useState(false);

    React.useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '0px'
            }
        );

        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref, options.threshold, options.rootMargin]);

    return [setRef, inView];
};

// Lightweight alternative to complex animations
export class SimpleAnimator {
    static fadeIn(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    static slideUp(element, duration = 300) {
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';

        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });
    }

    static stagger(elements, callback, delay = 100) {
        elements.forEach((el, index) => {
            setTimeout(() => callback(el), index * delay);
        });
    }
}

// Export only what's needed
export { motion, AnimatePresence, useAnimation, useInView, useScroll, useTransform };