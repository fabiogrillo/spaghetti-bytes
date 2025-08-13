// scripts/generateFavicons.js
// Script to generate all favicon formats from a source image

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateFavicons() {
    const sourceImage = path.join(__dirname, '../client/public/logo.png');
    const publicDir = path.join(__dirname, '../client/public');

    // Check if source image exists
    try {
        await fs.access(sourceImage);
    } catch (error) {
        console.error('❌ Source image not found at:', sourceImage);
        console.log('Please ensure you have a logo.png file in client/public/');
        return;
    }

    console.log('🎨 Generating favicons...\n');

    const sizes = [
        { size: 16, name: 'favicon-16x16.png' },
        { size: 32, name: 'favicon-32x32.png' },
        { size: 180, name: 'apple-touch-icon.png' },
        { size: 192, name: 'android-chrome-192x192.png' },
        { size: 512, name: 'android-chrome-512x512.png' }
    ];

    try {
        // Generate PNG favicons
        for (const { size, name } of sizes) {
            await sharp(sourceImage)
                .resize(size, size)
                .toFile(path.join(publicDir, name));
            console.log(`✅ Generated ${name} (${size}x${size})`);
        }

        // Generate ICO file (multi-resolution)
        await sharp(sourceImage)
            .resize(32, 32)
            .toFile(path.join(publicDir, 'favicon.ico'));
        console.log('✅ Generated favicon.ico');

        // Create site.webmanifest
        const manifest = {
            name: 'Spaghetti Bytes',
            short_name: 'SpaghettiByte',
            icons: [
                {
                    src: '/android-chrome-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: '/android-chrome-512x512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ],
            theme_color: '#FF6B9D',
            background_color: '#FFF8DC',
            display: 'standalone'
        };

        await fs.writeFile(
            path.join(publicDir, 'site.webmanifest'),
            JSON.stringify(manifest, null, 2)
        );
        console.log('✅ Generated site.webmanifest');

        console.log('\n✨ All favicons generated successfully!');
        console.log('📝 Remember to commit these files to your repository');

    } catch (error) {
        console.error('❌ Error generating favicons:', error);
    }
}

// Instructions for manual favicon creation if sharp is not available
function printManualInstructions() {
    console.log(`
📌 MANUAL FAVICON SETUP INSTRUCTIONS:
=====================================

If you can't run this script, you can manually create favicons:

1. Use an online favicon generator like:
   - https://realfavicongenerator.net
   - https://favicon.io
   
2. Upload your logo/icon image

3. Download the generated package and place these files in client/public/:
   - favicon.ico
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png
   - android-chrome-192x192.png
   - android-chrome-512x512.png
   - site.webmanifest

4. Update the site.webmanifest with your site details

5. Commit and push to your repository

The favicons will be served by Vercel automatically.
`);
}

// Check if sharp is installed
try {
    require.resolve('sharp');
    generateFavicons();
} catch (error) {
    console.log('⚠️  Sharp is not installed. Install it with:');
    console.log('npm install sharp --save-dev\n');
    printManualInstructions();
}