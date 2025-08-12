// client/src/Components/OptimizedImage.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP with fallback
 * - Responsive srcset
 * - Blurhash placeholder
 * - Progressive enhancement
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    sizes = '100vw',
    loading = 'lazy',
    priority = false,
    onLoad,
    onError,
    imageData = null, // Processed image data from server
    aspectRatio = null,
    objectFit = 'cover'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);
    const containerRef = useRef(null);

    // Setup Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px'
            }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [priority]);

    // Handle image load
    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    // Handle image error
    const handleError = () => {
        setError(true);
        onError?.();
    };

    // Generate picture element with multiple sources
    const renderPicture = () => {
        if (error) {
            return (
                <div className="flex items-center justify-center bg-gray-200 rounded-cartoon">
                    <span className="text-gray-500">Failed to load image</span>
                </div>
            );
        }

        // If we have processed image data from server
        if (imageData?.variants) {
            const webpSrcset = imageData.srcset?.webp;
            const jpegSrcset = imageData.srcset?.jpeg;
            const defaultSrc = imageData.variants[0]?.url || src;

            return (
                <picture>
                    {webpSrcset && (
                        <source
                            type="image/webp"
                            srcSet={isInView ? webpSrcset : undefined}
                            sizes={sizes}
                        />
                    )}
                    {jpegSrcset && (
                        <source
                            type="image/jpeg"
                            srcSet={isInView ? jpegSrcset : undefined}
                            sizes={sizes}
                        />
                    )}
                    <img
                        ref={imgRef}
                        src={isInView ? defaultSrc : undefined}
                        alt={alt}
                        loading={priority ? 'eager' : loading}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={`
                            transition-opacity duration-300
                            ${isLoaded ? 'opacity-100' : 'opacity-0'}
                            ${className}
                        `}
                        style={{ objectFit }}
                    />
                </picture>
            );
        }

        // Fallback to simple img tag
        return (
            <img
                ref={imgRef}
                src={isInView ? src : undefined}
                alt={alt}
                loading={priority ? 'eager' : loading}
                onLoad={handleLoad}
                onError={handleError}
                className={`
                    transition-opacity duration-300
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    ${className}
                `}
                style={{ objectFit }}
            />
        );
    };

    // Render blurhash placeholder if available
    const renderPlaceholder = () => {
        if (imageData?.blurhash) {
            return (
                <BlurhashCanvas
                    hash={imageData.blurhash}
                    width={32}
                    height={32}
                    className="absolute inset-0 w-full h-full"
                />
            );
        }

        return (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        );
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${aspectRatio ? '' : 'inline-block'}`}
            style={aspectRatio ? { aspectRatio } : {}}
        >
            {!isLoaded && renderPlaceholder()}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
            >
                {renderPicture()}
            </motion.div>
        </div>
    );
};

// Blurhash canvas component
const BlurhashCanvas = ({ hash, width, height, className }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!hash || !canvasRef.current) return;

        import('blurhash').then(({ decode }) => {
            const pixels = decode(hash, width, height);
            const ctx = canvasRef.current.getContext('2d');
            const imageData = ctx.createImageData(width, height);
            imageData.data.set(pixels);
            ctx.putImageData(imageData, 0, 0);
        });
    }, [hash, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
    );
};

export default OptimizedImage;
