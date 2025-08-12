// client/src/Components/PerformanceMonitor.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiTachometer, BiMemoryCard, BiServer, BiNetworkChart } from 'react-icons/bi';
import { BsSpeedometer2 } from 'react-icons/bs';

/**
 * Performance Monitor Component
 * Shows real-time performance metrics
 */
const PerformanceMonitor = ({ show = false, position = 'bottom-right' }) => {
    const [metrics, setMetrics] = useState({
        fps: 0,
        memory: null,
        bundleSize: null,
        cacheHitRate: 0,
        loadTime: 0,
        networkRequests: []
    });

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!show) return;

        // FPS Monitor
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                setMetrics(prev => ({ ...prev, fps }));
                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        // Memory Monitor (if available)
        const measureMemory = () => {
            if (performance.memory) {
                const memory = {
                    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
                    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
                    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
                };
                setMetrics(prev => ({ ...prev, memory }));
            }
        };

        // Network Monitor
        const observeNetwork = () => {
            if (window.PerformanceObserver) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const requests = entries
                        .filter(entry => entry.entryType === 'resource')
                        .map(entry => ({
                            name: entry.name.split('/').pop(),
                            duration: entry.duration.toFixed(0),
                            size: entry.transferSize,
                            type: entry.initiatorType
                        }));

                    setMetrics(prev => ({
                        ...prev,
                        networkRequests: [...prev.networkRequests, ...requests].slice(-10)
                    }));
                });

                observer.observe({ entryTypes: ['resource'] });
                return observer;
            }
        };

        // Page Load Time
        const measureLoadTime = () => {
            if (window.performance && performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                setMetrics(prev => ({ ...prev, loadTime }));
            }
        };

        // Bundle Size (fetch from API)
        const fetchBundleSize = async () => {
            try {
                const response = await fetch('/api/bundle-stats');
                const data = await response.json();
                setMetrics(prev => ({ ...prev, bundleSize: data }));
            } catch (error) {
                console.error('Failed to fetch bundle stats');
            }
        };

        // Cache Hit Rate (fetch from API)
        const fetchCacheStats = async () => {
            try {
                const response = await fetch('/api/admin/cache/stats');
                const data = await response.json();
                const hitRate = (data.memory.hitRate * 100).toFixed(1);
                setMetrics(prev => ({ ...prev, cacheHitRate: hitRate }));
            } catch (error) {
                console.error('Failed to fetch cache stats');
            }
        };

        // Start monitoring
        measureFPS();
        measureMemory();
        measureLoadTime();
        fetchBundleSize();
        fetchCacheStats();

        const networkObserver = observeNetwork();
        const memoryInterval = setInterval(measureMemory, 2000);
        const cacheInterval = setInterval(fetchCacheStats, 10000);

        return () => {
            clearInterval(memoryInterval);
            clearInterval(cacheInterval);
            if (networkObserver) networkObserver.disconnect();
        };
    }, [show]);

    if (!show) return null;

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
    };

    const getFPSColor = (fps) => {
        if (fps >= 55) return 'text-green-500';
        if (fps >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getMemoryColor = (used, total) => {
        const percentage = (used / total) * 100;
        if (percentage < 50) return 'text-green-500';
        if (percentage < 80) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`fixed ${positionClasses[position]} z-50`}
        >
            {/* Collapsed View */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-3 cursor-pointer"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="flex items-center space-x-3">
                            <BiTachometer className="text-2xl text-cartoon-purple" />
                            <div className="flex items-center space-x-2">
                                <span className={`font-mono text-sm ${getFPSColor(metrics.fps)}`}>
                                    {metrics.fps} FPS
                                </span>
                                {metrics.memory && (
                                    <>
                                        <span className="text-gray-400">|</span>
                                        <span className={`font-mono text-sm ${getMemoryColor(metrics.memory.used, metrics.memory.total)}`}>
                                            {metrics.memory.used}MB
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-400">|</span>
                                <span className="font-mono text-sm text-blue-500">
                                    {metrics.cacheHitRate}% Cache
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-4 w-96"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center">
                                <BiTachometer className="mr-2 text-cartoon-purple" />
                                Performance Monitor
                            </h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* FPS */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">FPS</span>
                                    <BsSpeedometer2 className="text-gray-400" />
                                </div>
                                <div className={`text-2xl font-bold ${getFPSColor(metrics.fps)}`}>
                                    {metrics.fps}
                                </div>
                                <div className="text-xs text-gray-500">Target: 60</div>
                            </div>

                            {/* Memory */}
                            {metrics.memory && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Memory</span>
                                        <BiMemoryCard className="text-gray-400" />
                                    </div>
                                    <div className={`text-2xl font-bold ${getMemoryColor(metrics.memory.used, metrics.memory.total)}`}>
                                        {metrics.memory.used}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        / {metrics.memory.total} MB
                                    </div>
                                </div>
                            )}

                            {/* Cache Hit Rate */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Cache Hit</span>
                                    <BiServer className="text-gray-400" />
                                </div>
                                <div className="text-2xl font-bold text-blue-500">
                                    {metrics.cacheHitRate}%
                                </div>
                                <div className="text-xs text-gray-500">Hit Rate</div>
                            </div>

                            {/* Load Time */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Load</span>
                                    <BiNetworkChart className="text-gray-400" />
                                </div>
                                <div className="text-2xl font-bold text-purple-500">
                                    {(metrics.loadTime / 1000).toFixed(2)}s
                                </div>
                                <div className="text-xs text-gray-500">Page Load</div>
                            </div>
                        </div>

                        {/* Network Requests */}
                        {metrics.networkRequests.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Recent Network Activity</h4>
                                <div className="max-h-32 overflow-y-auto">
                                    {metrics.networkRequests.slice(-5).map((req, idx) => (
                                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-200 dark:border-gray-600">
                                            <span className="truncate flex-1">{req.name}</span>
                                            <span className="text-gray-500 ml-2">{req.duration}ms</span>
                                            {req.size && (
                                                <span className="text-gray-400 ml-2">
                                                    {(req.size / 1024).toFixed(1)}KB
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bundle Size */}
                        {metrics.bundleSize && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                <div className="text-sm font-semibold mb-1">Bundle Sizes</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Main:</span>
                                        <span className="ml-1 font-mono">{metrics.bundleSize.main}KB</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Vendor:</span>
                                        <span className="ml-1 font-mono">{metrics.bundleSize.vendor}KB</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Total:</span>
                                        <span className="ml-1 font-mono font-bold">{metrics.bundleSize.total}KB</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PerformanceMonitor;