// server/utils/imageProcessor.js

// Install required packages:
// npm install sharp multer-sharp-resizer image-size blurhash

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sizeOf = require('image-size');
const { encode } = require('blurhash');

class ImageProcessor {
    constructor(config = {}) {
        this.config = {
            // Output formats
            formats: config.formats || ['webp', 'jpeg'],

            // Size variants
            sizes: config.sizes || [
                { width: 320, suffix: 'sm' },    // Mobile
                { width: 768, suffix: 'md' },    // Tablet
                { width: 1024, suffix: 'lg' },   // Desktop
                { width: 1920, suffix: 'xl' },   // Large screens
                { width: null, suffix: 'original' } // Original size
            ],

            // Quality settings
            quality: {
                webp: config.webpQuality || 85,
                jpeg: config.jpegQuality || 80,
                png: config.pngQuality || 90
            },

            // Paths
            uploadDir: config.uploadDir || 'uploads/original',
            processedDir: config.processedDir || 'uploads/processed',
            cacheDir: config.cacheDir || 'uploads/cache'
        };

        // Ensure directories exist
        this.ensureDirectories();
    }

    async ensureDirectories() {
        const dirs = [
            this.config.uploadDir,
            this.config.processedDir,
            this.config.cacheDir,
            path.join(this.config.processedDir, 'webp'),
            path.join(this.config.processedDir, 'jpeg'),
            path.join(this.config.processedDir, 'png')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Process uploaded image and generate optimized versions
     */
    async processImage(inputPath, options = {}) {
        try {
            const startTime = Date.now();

            // Get image metadata
            const metadata = await sharp(inputPath).metadata();
            const dimensions = sizeOf(inputPath);

            // Generate unique hash for caching
            const fileBuffer = await fs.readFile(inputPath);
            const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

            // Check cache
            const cacheKey = `${hash}_${JSON.stringify(options)}`;
            const cached = await this.checkCache(cacheKey);
            if (cached) {
                console.log(`Image served from cache: ${cacheKey}`);
                return cached;
            }

            // Generate blurhash for placeholder
            const blurhash = await this.generateBlurhash(inputPath);

            const results = {
                original: {
                    width: dimensions.width,
                    height: dimensions.height,
                    format: metadata.format,
                    size: (await fs.stat(inputPath)).size
                },
                blurhash,
                variants: [],
                processingTime: 0
            };

            // Process each size variant
            for (const size of this.config.sizes) {
                for (const format of this.config.formats) {
                    // Skip if original is smaller than target size
                    if (size.width && size.width > dimensions.width) {
                        continue;
                    }

                    const variant = await this.createVariant(
                        inputPath,
                        format,
                        size,
                        hash,
                        metadata
                    );

                    if (variant) {
                        results.variants.push(variant);
                    }
                }
            }

            // Generate responsive srcset
            results.srcset = this.generateSrcset(results.variants);

            // Save to cache
            await this.saveToCache(cacheKey, results);

            results.processingTime = Date.now() - startTime;
            console.log(`Image processed in ${results.processingTime}ms`);

            return results;

        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Failed to process image');
        }
    }

    /**
     * Create a single image variant
     */
    async createVariant(inputPath, format, size, hash, metadata) {
        try {
            const filename = `${hash}_${size.suffix}.${format}`;
            const outputPath = path.join(
                this.config.processedDir,
                format,
                filename
            );

            // Check if already exists
            try {
                await fs.access(outputPath);
                const stats = await fs.stat(outputPath);
                const dimensions = sizeOf(outputPath);

                return {
                    url: `/images/${format}/${filename}`,
                    format,
                    width: dimensions.width,
                    height: dimensions.height,
                    size: stats.size,
                    suffix: size.suffix
                };
            } catch (e) {
                // File doesn't exist, create it
            }

            // Create sharp instance
            let pipeline = sharp(inputPath);

            // Resize if width specified
            if (size.width) {
                pipeline = pipeline.resize(size.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }

            // Apply format-specific optimizations
            switch (format) {
                case 'webp':
                    pipeline = pipeline.webp({
                        quality: this.config.quality.webp,
                        effort: 6, // 0-6, higher = better compression
                        smartSubsample: true
                    });
                    break;

                case 'jpeg':
                    pipeline = pipeline.jpeg({
                        quality: this.config.quality.jpeg,
                        progressive: true,
                        mozjpeg: true // Better compression
                    });
                    break;

                case 'png':
                    pipeline = pipeline.png({
                        quality: this.config.quality.png,
                        compressionLevel: 9,
                        adaptiveFiltering: true
                    });
                    break;
            }

            // Save processed image
            await pipeline.toFile(outputPath);

            // Get final dimensions and size
            const stats = await fs.stat(outputPath);
            const dimensions = sizeOf(outputPath);

            return {
                url: `/images/${format}/${filename}`,
                format,
                width: dimensions.width,
                height: dimensions.height,
                size: stats.size,
                suffix: size.suffix
            };

        } catch (error) {
            console.error(`Error creating variant: ${error.message}`);
            return null;
        }
    }

    /**
     * Generate blurhash for progressive loading
     */
    async generateBlurhash(imagePath) {
        try {
            // Resize image to small size for blurhash
            const { data, info } = await sharp(imagePath)
                .raw()
                .ensureAlpha()
                .resize(32, 32, { fit: 'inside' })
                .toBuffer({ resolveWithObject: true });

            // Generate blurhash
            const hash = encode(
                new Uint8ClampedArray(data),
                info.width,
                info.height,
                4, // x components
                3  // y components
            );

            return hash;
        } catch (error) {
            console.error('Blurhash generation error:', error);
            return null;
        }
    }

    /**
     * Generate responsive srcset string
     */
    generateSrcset(variants) {
        const srcsets = {};

        // Group by format
        for (const variant of variants) {
            if (!srcsets[variant.format]) {
                srcsets[variant.format] = [];
            }

            srcsets[variant.format].push(
                `${variant.url} ${variant.width}w`
            );
        }

        // Generate srcset strings
        const result = {};
        for (const [format, sources] of Object.entries(srcsets)) {
            result[format] = sources.join(', ');
        }

        return result;
    }

    /**
     * Cache management
     */
    async checkCache(key) {
        try {
            const cachePath = path.join(this.config.cacheDir, `${key}.json`);
            const data = await fs.readFile(cachePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    async saveToCache(key, data) {
        try {
            const cachePath = path.join(this.config.cacheDir, `${key}.json`);
            await fs.writeFile(cachePath, JSON.stringify(data));
        } catch (error) {
            console.error('Cache save error:', error);
        }
    }

    /**
     * Clean up old cached images
     */
    async cleanupCache(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
        try {
            const now = Date.now();
            const files = await fs.readdir(this.config.cacheDir);

            for (const file of files) {
                const filePath = path.join(this.config.cacheDir, file);
                const stats = await fs.stat(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`Deleted old cache file: ${file}`);
                }
            }
        } catch (error) {
            console.error('Cache cleanup error:', error);
        }
    }

    /**
     * Middleware for Express
     */
    middleware() {
        return async (req, res, next) => {
            // Check if it's an image request
            if (!req.file) {
                return next();
            }

            try {
                // Process the uploaded image
                const processed = await this.processImage(req.file.path);

                // Attach processed data to request
                req.processedImage = processed;

                // Clean up original if configured
                if (this.config.deleteOriginal) {
                    await fs.unlink(req.file.path);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }
}

module.exports = ImageProcessor;