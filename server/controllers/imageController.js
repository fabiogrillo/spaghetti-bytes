const axios = require('axios');
const sharp = require('sharp');

// Generate image using Hugging Face API
const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check if API key exists
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.error('HUGGINGFACE_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API configuration error' });
        }

        // Hugging Face API configuration
        const API_URL = process.env.HUGGINGFACE_API_URL || "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";
        const headers = {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
        };

        console.log('Generating image with prompt:', prompt);
        console.log('Using API URL:', API_URL);

        // Call Hugging Face API
        const response = await axios.post(
            API_URL,
            { inputs: prompt },
            {
                headers,
                responseType: 'arraybuffer',
                timeout: 60000 // 60 seconds timeout
            }
        );

        // Convert the response to base64
        const buffer = Buffer.from(response.data, 'binary');

        // Compress the image using sharp
        const compressedBuffer = await sharp(buffer)
            .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Convert to base64
        const base64Image = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

        res.json({
            imageUrl: base64Image,
            message: 'Image generated successfully'
        });

    } catch (error) {
        console.error('Image generation error:', error.response?.data || error.message);

        if (error.response?.status === 503) {
            return res.status(503).json({
                error: 'AI model is loading. Please try again in a few moments.'
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                error: 'Invalid API key. Please check your Hugging Face configuration.'
            });
        }

        res.status(500).json({
            error: 'Failed to generate image. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    generateImage
};