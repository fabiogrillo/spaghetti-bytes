// client/src/Components/LazyNewsletterAnalytics.js
import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazy load the heavy chart component
const NewsletterAnalytics = lazy(() =>
    import(
        /* webpackChunkName: "analytics-charts" */
        /* webpackPrefetch: true */
        './NewsletterAnalytics'
    )
);

// Skeleton loader that matches the analytics layout
const AnalyticsSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-cartoon shadow-cartoon p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-cartoon shadow-cartoon p-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="h-64 bg-gray-100 rounded animate-pulse" />
                </div>
            ))}
        </div>
    </div>
);

// Wrapper component with error boundary
class AnalyticsErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Analytics loading error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container mx-auto px-4 py-8 text-center">
                    <div className="bg-red-50 border-2 border-red-200 rounded-cartoon p-8">
                        <h3 className="text-xl font-bold text-red-600 mb-2">
                            Failed to load analytics
                        </h3>
                        <p className="text-gray-600">
                            Please refresh the page or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 btn btn-sm bg-cartoon-pink text-white"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Main lazy wrapper component
const LazyNewsletterAnalytics = () => {
    return (
        <AnalyticsErrorBoundary>
            <Suspense fallback={<AnalyticsSkeleton />}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <NewsletterAnalytics />
                </motion.div>
            </Suspense>
        </AnalyticsErrorBoundary>
    );
};

export default LazyNewsletterAnalytics;