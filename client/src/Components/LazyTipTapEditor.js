// client/src/Components/LazyTipTapEditor.js
import React, { lazy, Suspense, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Lazy load the heavy TipTap editor only when needed
const TipTapEditor = lazy(() =>
    import(
        /* webpackChunkName: "tiptap-editor" */
        /* webpackPreload: true */
        './TipTapEditor'
    )
);

// Minimal loading skeleton that matches editor dimensions
const EditorSkeleton = () => (
    <div className="shadow-cartoon rounded-cartoon">
        <div className="border-2 border-black rounded-t-cartoon bg-cartoon-yellow p-4">
            <div className="flex flex-wrap gap-2">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="w-8 h-8 bg-gray-200 rounded animate-pulse"
                    />
                ))}
            </div>
        </div>
        <div className="min-h-[400px] p-6 bg-white rounded-b-cartoon border-2 border-t-0 border-black">
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// Optimized wrapper component
const LazyTipTapEditor = ({ value, onChange, readOnly = false }) => {
    const [hasInteracted, setHasInteracted] = useState(readOnly);
    const [isLoading, setIsLoading] = useState(false);

    // Preload editor on hover/focus for better UX
    const handleInteraction = useCallback(() => {
        if (!hasInteracted && !readOnly) {
            setHasInteracted(true);
            setIsLoading(true);
        }
    }, [hasInteracted, readOnly]);

    // For read-only mode, load immediately but still lazy
    React.useEffect(() => {
        if (readOnly) {
            setHasInteracted(true);
        }
    }, [readOnly]);

    // If not interacted and not readonly, show placeholder
    if (!hasInteracted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onMouseEnter={handleInteraction}
                onFocus={handleInteraction}
                onClick={handleInteraction}
                className="cursor-text"
            >
                <div className="shadow-cartoon rounded-cartoon border-2 border-black bg-white p-6 min-h-[400px]">
                    <p className="text-gray-400">Click to start editing...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <Suspense fallback={<EditorSkeleton />}>
            <TipTapEditor
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                onLoad={() => setIsLoading(false)}
            />
        </Suspense>
    );
};

export default LazyTipTapEditor;