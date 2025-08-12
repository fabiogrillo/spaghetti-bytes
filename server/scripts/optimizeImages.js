// scripts/optimizeImages.js
/**
 * Batch image optimization script
 * Processes all images in uploads folder
 */

const fs = require('fs').promises;
const path = require('path');
const ImageProcessor = require('../server/utils/imageProcessor');

async function optimizeAllImages() {
    console.log('🖼️  Starting batch image optimization...\n');

    const processor = new ImageProcessor({
        uploadDir: 'uploads/original',
        processedDir: 'uploads/processed',
        formats: ['webp', 'jpeg'],
        quality: {
            webp: 85,
            jpeg: 80
        }
    });

    try {
        // Get all images from upload directory
        const uploadDir = path.join(__dirname, '../uploads/original');
        const files = await fs.readdir(uploadDir);

        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        console.log(`Found ${imageFiles.length} images to process\n`);

        let totalSaved = 0;
        let processedCount = 0;

        for (const file of imageFiles) {
            const filePath = path.join(uploadDir, file);
            console.log(`Processing: ${file}`);

            try {
                const result = await processor.processImage(filePath);

                // Calculate space saved
                const originalSize = result.original.size;
                const optimizedSize = Math.min(...result.variants.map(v => v.size));
                const saved = originalSize - optimizedSize;
                const savedPercent = ((saved / originalSize) * 100).toFixed(1);

                totalSaved += saved;
                processedCount++;

                console.log(`  ✅ Optimized: ${savedPercent}% size reduction`);
                console.log(`  📊 Variants created: ${result.variants.length}`);
                console.log(`  🎨 Blurhash: ${result.blurhash}\n`);

            } catch (error) {
                console.error(`  ❌ Error processing ${file}: ${error.message}\n`);
            }
        }

        // Summary
        console.log('════════════════════════════════════════');
        console.log('📊 Optimization Summary:');
        console.log(`  • Images processed: ${processedCount}/${imageFiles.length}`);
        console.log(`  • Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
        console.log('════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Batch optimization failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    optimizeAllImages();
}

module.exports = optimizeAllImages;