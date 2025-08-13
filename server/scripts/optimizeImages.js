// scripts/optimizeImages.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...\n');

    const inputDir = path.join(__dirname, '../uploads/original');
    const outputDir = path.join(__dirname, '../uploads/optimized');

    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });
        await fs.mkdir(path.join(outputDir, 'webp'), { recursive: true });
        await fs.mkdir(path.join(outputDir, 'jpeg'), { recursive: true });

        // Get all images from input directory
        const files = await fs.readdir(inputDir).catch(() => []);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (imageFiles.length === 0) {
            console.log('No images found to optimize');
            return;
        }

        console.log(`Found ${imageFiles.length} images to process\n`);

        let totalSaved = 0;
        let processedCount = 0;

        for (const file of imageFiles) {
            const inputPath = path.join(inputDir, file);
            const baseName = path.parse(file).name;

            console.log(`Processing: ${file}`);

            try {
                const stats = await fs.stat(inputPath);
                const originalSize = stats.size;

                // Create WebP version
                const webpPath = path.join(outputDir, 'webp', `${baseName}.webp`);
                await sharp(inputPath)
                    .webp({ quality: 85 })
                    .toFile(webpPath);

                // Create optimized JPEG version
                const jpegPath = path.join(outputDir, 'jpeg', `${baseName}.jpg`);
                await sharp(inputPath)
                    .jpeg({ quality: 80, progressive: true })
                    .toFile(jpegPath);

                // Calculate space saved
                const webpStats = await fs.stat(webpPath);
                const jpegStats = await fs.stat(jpegPath);
                const optimizedSize = Math.min(webpStats.size, jpegStats.size);
                const saved = originalSize - optimizedSize;
                const savedPercent = ((saved / originalSize) * 100).toFixed(1);

                totalSaved += saved;
                processedCount++;

                console.log(`  ✅ Optimized: ${savedPercent}% size reduction`);

            } catch (error) {
                console.error(`  ❌ Error processing ${file}: ${error.message}`);
            }
        }

        console.log('\n════════════════════════════════════════');
        console.log('📊 Optimization Summary:');
        console.log(`  • Images processed: ${processedCount}/${imageFiles.length}`);
        console.log(`  • Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
        console.log('════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Optimization failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    optimizeImages();
}

module.exports = optimizeImages;