import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCheck, BiX, BiInfoCircle, BiError } from 'react-icons/bi';

// Create Toast Context
const ToastContext = createContext({});

// Custom hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Toast Component
const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: <BiCheck size={24} />,
        error: <BiX size={24} />,
        info: <BiInfoCircle size={24} />,
        warning: <BiError size={24} />
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`${colors[type]} text-white rounded-soft shadow-soft-lg p-4 mb-3 
                  max-w-sm flex items-center gap-3 cursor-pointer`}
            onClick={() => onClose(id)}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose(id);
                }}
                className="text-white/80 hover:text-white transition-colors"
            >
                <BiX size={20} />
            </button>
        </motion.div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const toast = {
        success: (message, duration) => showToast(message, 'success', duration),
        error: (message, duration) => showToast(message, 'error', duration),
        info: (message, duration) => showToast(message, 'info', duration),
        warning: (message, duration) => showToast(message, 'warning', duration),
        remove: removeToast
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;