const axios = require('axios');
const sharp = require('sharp');

// Generate image using Hugging Face API with updated model
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

        // Updated Hugging Face API configuration with working models
        // Try multiple models in case one is unavailable
        const models = [
            "stabilityai/stable-diffusion-xl-base-1.0",
            "runwayml/stable-diffusion-v1-5",
            "CompVis/stable-diffusion-v1-4",
            "prompthero/openjourney",
            "stabilityai/stable-diffusion-2-1" // Keep as fallback
        ];

        const headers = {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
        };

        console.log('Generating image with prompt:', prompt);

        // Enhanced prompt for better results
        const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k`;

        let response = null;
        let lastError = null;

        // Try each model until one works
        for (const model of models) {
            const API_URL = `https://api-inference.huggingface.co/models/${model}`;
            console.log('Trying model:', model);

            try {
                response = await axios.post(
                    API_URL,
                    {
                        inputs: enhancedPrompt,
                        options: {
                            wait_for_model: true  // Wait for model to load if needed
                        },
                        parameters: {
                            negative_prompt: "low quality, blurry, distorted, disfigured, bad anatomy",
                            num_inference_steps: 25,
                            guidance_scale: 7.5
                        }
                    },
                    {
                        headers,
                        responseType: 'arraybuffer',
                        timeout: 120000, // 2 minutes timeout
                        maxContentLength: 50 * 1024 * 1024, // 50MB max
                        maxBodyLength: 50 * 1024 * 1024
                    }
                );

                console.log('Successfully generated image with model:', model);
                break; // Success, exit loop
            } catch (error) {
                lastError = error;
                console.log(`Model ${model} failed:`, error.response?.status || error.message);

                // If it's a 503 (model loading), retry after a delay
                if (error.response?.status === 503) {
                    console.log('Model is loading, waiting 10 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    // Retry the same model once
                    try {
                        response = await axios.post(API_URL, {
                            inputs: enhancedPrompt,
                            options: { wait_for_model: true }
                        }, {
                            headers,
                            responseType: 'arraybuffer',
                            timeout: 120000
                        });
                        console.log('Successfully generated image after retry with model:', model);
                        break;
                    } catch (retryError) {
                        console.log('Retry failed, trying next model');
                    }
                }
            }
        }

        // Check if any model succeeded
        if (!response || !response.data) {
            console.error('All models failed. Last error:', lastError?.message);
            throw lastError || new Error('All AI models are currently unavailable');
        }

        // Convert the response to buffer
        const buffer = Buffer.from(response.data, 'binary');

        // Validate image buffer
        if (buffer.length < 1000) { // Less than 1KB probably means error
            console.error('Received buffer too small, likely an error response');

            // Try to parse error message
            try {
                const errorText = buffer.toString('utf8');
                console.error('Error response:', errorText);
            } catch (e) {
                // Ignore parsing error
            }

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
                    Buffer.isBuffer(error.response.data) ?
                        error.response.data.toString('utf8').substring(0, 200) :
                        JSON.stringify(error.response.data).substring(0, 200)
                ) : undefined
        });

        // Send appropriate error response
        if (error.response?.status === 503) {
            return res.status(503).json({
                error: 'AI models are loading. Please try again in 20-30 seconds.',
                retryAfter: 30
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                error: 'Invalid API key. Please check your Hugging Face API key.',
                help: 'Get your API key from https://huggingface.co/settings/tokens'
            });
        }

        if (error.response?.status === 404) {
            return res.status(503).json({
                error: 'AI model not available. Please try again later.',
                details: 'The image generation service is temporarily unavailable.'
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
                error: 'Request timeout. The image generation took too long. Please try with a simpler prompt.'
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

        // Check the first available model
        const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

        const response = await axios.get(API_URL, {
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
            },
            timeout: 5000
        });

        res.json({
            status: 'healthy',
            message: 'AI service is operational',
            model: 'stable-diffusion-xl-base-1.0'
        });
    } catch (error) {
        // Even if health check fails, the service might still work
        res.json({
            status: 'unknown',
            message: 'AI service status unknown, but may still be operational',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    generateImage,
    checkAIService
};