const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload image endpoint
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For now, we'll serve from local storage
        const imageUrl = `/uploads/images/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// AI Image Generation with Hugging Face
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check if Hugging Face API key is configured
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.warn('HUGGINGFACE_API_KEY not configured, using placeholder');
            // Fallback to placeholder
            const placeholderUrl = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(prompt)}`;
            return res.json({
                success: true,
                url: placeholderUrl,
                prompt: prompt,
                message: 'Using placeholder. Add HUGGINGFACE_API_KEY to .env for AI generation'
            });
        }

        console.log('Generating image with prompt:', prompt);

        // Call Hugging Face API - Using Stable Diffusion 2.1
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        negative_prompt: "blurry, bad quality, distorted, ugly, bad anatomy",
                        width: 768,
                        height: 512,
                        num_inference_steps: 50,
                        guidance_scale: 7.5,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);

            // If model is loading, inform the user
            if (response.status === 503) {
                return res.json({
                    success: false,
                    error: 'Model is loading, please try again in a few seconds',
                    url: `https://via.placeholder.com/800x600.png?text=Model+Loading...+Try+Again`,
                });
            }

            throw new Error(`API Error: ${errorText}`);
        }

        // Get the image blob
        const imageBuffer = await response.buffer();

        // Save the generated image
        const filename = `ai-${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, imageBuffer);

        const imageUrl = `/uploads/images/${filename}`;

        res.json({
            success: true,
            url: imageUrl,
            prompt: prompt,
            model: 'stable-diffusion-2-1'
        });
    } catch (error) {
        console.error('Generation error:', error);

        // Fallback to placeholder on error
        const placeholderUrl = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(req.body.prompt || 'Error')}`;
        res.json({
            success: false,
            url: placeholderUrl,
            error: error.message
        });
    }
});

// Alternative free AI models you can use
router.get('/ai-models', (req, res) => {
    res.json({
        models: [
            {
                name: 'Stable Diffusion 2.1',
                id: 'stabilityai/stable-diffusion-2-1',
                description: 'High quality image generation'
            },
            {
                name: 'Stable Diffusion XL',
                id: 'stabilityai/stable-diffusion-xl-base-1.0',
                description: 'Latest and highest quality (requires more credits)'
            },
            {
                name: 'OpenJourney',
                id: 'prompthero/openjourney',
                description: 'Midjourney style images'
            },
            {
                name: 'Dreamlike Diffusion',
                id: 'dreamlike-art/dreamlike-diffusion-1.0',
                description: 'Artistic style generation'
            }
        ]
    });
});

module.exports = router;