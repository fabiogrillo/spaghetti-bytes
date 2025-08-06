const axios = require('axios');
const sharp = require('sharp');

// Generate image using Hugging Face API with better error handling
const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;

        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'A valid prompt is required'
            });
        }

        // Check if API key exists
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.error('HUGGINGFACE_API_KEY not found in environment variables');
            return res.status(500).json({
                error: 'AI image generation is not configured. Please add HUGGINGFACE_API_KEY to your .env file.'
            });
        }

        // Hugging Face API configuration
        const API_URL = process.env.HUGGINGFACE_API_URL || "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";

        const headers = {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
        };

        console.log('Generating image with prompt:', prompt);
        console.log('Using API URL:', API_URL);

        // Enhanced prompt for better results
        const enhancedPrompt = `${prompt}, high quality, detailed, professional`;

        // Call Hugging Face API with retry logic
        let response;
        let retries = 0;
        const maxRetries = 2;

        while (retries <= maxRetries) {
            try {
                response = await axios.post(
                    API_URL,
                    {
                        inputs: enhancedPrompt,
                        options: {
                            wait_for_model: true  // Wait for model to load if needed
                        }
                    },
                    {
                        headers,
                        responseType: 'arraybuffer',
                        timeout: 90000, // 90 seconds timeout
                        maxContentLength: 50 * 1024 * 1024, // 50MB max
                        maxBodyLength: 50 * 1024 * 1024
                    }
                );
                break; // Success, exit loop
            } catch (error) {
                if (error.response?.status === 503 && retries < maxRetries) {
                    // Model is loading, wait and retry
                    console.log(`Model loading, retry ${retries + 1}/${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                    retries++;
                } else {
                    throw error; // Re-throw for outer catch block
                }
            }
        }

        // Validate response
        if (!response || !response.data) {
            throw new Error('Invalid response from AI service');
        }

        // Convert the response to buffer
        const buffer = Buffer.from(response.data, 'binary');

        // Validate image buffer
        if (buffer.length < 1000) { // Less than 1KB probably means error
            console.error('Received buffer too small, likely an error response');
            throw new Error('Invalid image data received');
        }

        // Process and compress the image using sharp
        let processedBuffer;
        try {
            processedBuffer = await sharp(buffer)
                .resize(1024, 1024, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 85,
                    progressive: true
                })
                .toBuffer();
        } catch (sharpError) {
            console.error('Sharp processing error:', sharpError);
            // If sharp fails, use original buffer
            processedBuffer = buffer;
        }

        // Convert to base64
        const base64Image = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

        // Send successful response
        res.json({
            imageUrl: base64Image,
            message: 'Image generated successfully',
            prompt: prompt
        });

    } catch (error) {
        // Detailed error logging
        console.error('Image generation error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data ?
                (typeof error.response.data === 'string' ?
                    error.response.data.substring(0, 200) :
                    JSON.stringify(error.response.data).substring(0, 200)
                ) : undefined
        });

        // Send appropriate error response
        if (error.response?.status === 503) {
            return res.status(503).json({
                error: 'AI model is loading. Please try again in 10-20 seconds.',
                retryAfter: 20
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                error: 'Invalid API key. Please check your Hugging Face API key configuration.',
                help: 'Get your API key from https://huggingface.co/settings/tokens'
            });
        }

        if (error.response?.status === 400) {
            return res.status(400).json({
                error: 'Invalid request. Please check your prompt and try again.',
                details: error.response?.data?.error || undefined
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please wait a moment before trying again.',
                retryAfter: 60
            });
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'Request timeout. The image generation took too long. Please try again with a simpler prompt.'
            });
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(502).json({
                error: 'Cannot connect to AI service. Please check your internet connection.'
            });
        }

        // Generic error response
        res.status(500).json({
            error: 'Failed to generate image. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Health check endpoint for AI service
const checkAIService = async (req, res) => {
    try {
        if (!process.env.HUGGINGFACE_API_KEY) {
            return res.status(503).json({
                status: 'not_configured',
                message: 'HUGGINGFACE_API_KEY not found in environment variables'
            });
        }

        // Try to check model status
        const API_URL = process.env.HUGGINGFACE_API_URL || "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";

        const response = await axios.get(API_URL, {
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
            },
            timeout: 5000
        });

        res.json({
            status: 'healthy',
            message: 'AI service is operational'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'AI service is not available',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    generateImage,
    checkAIService
};