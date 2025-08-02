const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// AI Image Generation endpoint
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check if we have node-fetch installed
        let fetch;
        try {
            fetch = require('node-fetch');
        } catch (e) {
            console.log('node-fetch not installed, using placeholder');
            const placeholderUrl = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(prompt)}`;
            return res.json({
                success: true,
                url: placeholderUrl,
                prompt: prompt,
                message: 'Install node-fetch for Hugging Face integration'
            });
        }

        // Check if Hugging Face API key is configured
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.warn('HUGGINGFACE_API_KEY not configured, using placeholder');
            const placeholderUrl = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(prompt)}`;
            return res.json({
                success: true,
                url: placeholderUrl,
                prompt: prompt,
                message: 'Add HUGGINGFACE_API_KEY to .env for AI generation'
            });
        }

        console.log('Generating image with prompt:', prompt);

        // Call Hugging Face API
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', errorText);

            if (response.status === 503) {
                return res.json({
                    success: false,
                    error: 'Model is loading, please try again in 20 seconds',
                    url: `https://via.placeholder.com/800x600.png?text=Model+Loading...+Try+Again`,
                });
            }

            throw new Error(`API Error: ${errorText}`);
        }

        // Get the image buffer
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

module.exports = router;