import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCamera, FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../Api';

const ImageUploadModal = ({ isOpen, onClose, onImageSelect }) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [previewUrl, setPreviewUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState('');

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Image compression utility
    const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    // Convert blob to base64
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setIsLoading(true);
        try {
            const compressedBlob = await compressImage(file);
            const base64 = await blobToBase64(compressedBlob);
            setPreviewUrl(base64);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize camera with better error handling
    const startCamera = async () => {
        try {
            setCameraError('');

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            // Request camera permission with fallback constraints
            const constraints = {
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user'
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);

                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(err => {
                        console.error('Error playing video:', err);
                    });
                };
            }
        } catch (error) {
            console.error('Error accessing camera:', error);

            // Provide specific error messages
            let errorMessage = 'Failed to access camera. ';

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Please allow camera permissions in your browser settings.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += 'Camera is already in use by another application.';
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                errorMessage += 'Camera does not support the required resolution.';
            } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                errorMessage += 'Camera access requires HTTPS connection.';
            } else {
                errorMessage += error.message || 'Please check your camera settings.';
            }

            setCameraError(errorMessage);
            toast.error(errorMessage);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
            setIsCameraActive(false);
        }
    };

    // Take photo from camera
    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0);

        // Convert to blob and then to base64
        canvas.toBlob(async (blob) => {
            try {
                const base64 = await blobToBase64(blob);
                setPreviewUrl(base64);
                toast.success('Photo captured!');

                // Stop camera after capture
                stopCamera();
            } catch (error) {
                console.error('Error processing photo:', error);
                toast.error('Failed to process photo');
            }
        }, 'image/jpeg', 0.8);
    };

    // Cleanup camera on unmount or modal close
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Stop camera when changing tabs or closing modal
    useEffect(() => {
        if (activeTab !== 'camera' || !isOpen) {
            stopCamera();
        }
    }, [activeTab, isOpen]);

    // Handle AI generation with proper error handling
    const handleAIGeneration = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please enter a description for the image');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/stories/generate-image', {
                prompt: aiPrompt.trim()
            });

            if (response.data && response.data.imageUrl) {
                setPreviewUrl(response.data.imageUrl);
                toast.success('Image generated successfully!');
            } else {
                throw new Error('No image URL in response');
            }
        } catch (error) {
            console.error('Error generating image:', error);

            // Detailed error messages
            if (error.response?.status === 503) {
                toast.error('AI model is loading. Please wait a moment and try again.');
            } else if (error.response?.status === 401) {
                toast.error('API key error. Please check server configuration.');
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.error || 'Invalid request');
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else if (error.message === 'Network Error') {
                toast.error('Cannot connect to server. Please check if the server is running.');
            } else {
                toast.error('Failed to generate image. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle image selection
    const handleImageSelect = () => {
        if (!previewUrl) {
            toast.error('Please select or generate an image first');
            return;
        }

        onImageSelect(previewUrl);
        resetModal();
        onClose();
    };

    // Reset modal state
    const resetModal = () => {
        setActiveTab('upload');
        setPreviewUrl('');
        setAiPrompt('');
        setIsLoading(false);
        setIsCameraActive(false);
        setCameraError('');
        stopCamera();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Add Image
                        </h2>
                        <button
                            onClick={() => {
                                resetModal();
                                onClose();
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'upload'
                                ? 'bg-cartoon-pink text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FaUpload className="inline mr-2" />
                            Upload
                        </button>
                        <button
                            onClick={() => setActiveTab('camera')}
                            className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'camera'
                                ? 'bg-cartoon-purple text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FaCamera className="inline mr-2" />
                            Camera
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'ai'
                                ? 'bg-cartoon-orange text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FaMagic className="inline mr-2" />
                            AI Generate
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaSpinner className="animate-spin text-4xl text-cartoon-pink mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">Processing...</p>
                            </div>
                        ) : (
                            <>
                                {/* Upload Tab */}
                                {activeTab === 'upload' && (
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                                     rounded-cartoon p-8 text-center cursor-pointer
                                                     hover:border-cartoon-pink transition-colors"
                                        >
                                            <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Click to upload an image
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                JPG, PNG, GIF up to 10MB
                                            </p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}

                                {/* Camera Tab */}
                                {activeTab === 'camera' && (
                                    <div className="space-y-4">
                                        {cameraError ? (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-cartoon">
                                                {cameraError}
                                            </div>
                                        ) : !isCameraActive ? (
                                            <button
                                                onClick={startCamera}
                                                className="w-full btn btn-primary bg-cartoon-purple hover:bg-cartoon-purple/80 
                                                         rounded-cartoon shadow-cartoon"
                                            >
                                                <FaCamera className="mr-2" />
                                                Start Camera
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="relative rounded-cartoon overflow-hidden bg-black">
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                        className="w-full h-auto"
                                                    />
                                                    <canvas
                                                        ref={canvasRef}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={takePhoto}
                                                        className="flex-1 btn btn-primary bg-cartoon-purple hover:bg-cartoon-purple/80 
                                                                 rounded-cartoon shadow-cartoon"
                                                    >
                                                        Take Photo
                                                    </button>
                                                    <button
                                                        onClick={stopCamera}
                                                        className="btn btn-ghost rounded-cartoon"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* AI Tab */}
                                {activeTab === 'ai' && (
                                    <div className="space-y-4">
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Describe the image you want to generate... (e.g., 'A cartoon robot coding on a laptop with spaghetti in the background')"
                                            className="w-full h-32 p-4 border-2 border-gray-300 dark:border-gray-600 
                                                     rounded-cartoon focus:border-cartoon-orange transition-colors
                                                     dark:bg-gray-700 dark:text-gray-200"
                                        />
                                        <button
                                            onClick={handleAIGeneration}
                                            disabled={!aiPrompt.trim()}
                                            className="w-full btn btn-primary bg-cartoon-orange hover:bg-cartoon-orange/80 
                                                     rounded-cartoon shadow-cartoon disabled:opacity-50"
                                        >
                                            <FaMagic className="mr-2" />
                                            Generate Image
                                        </button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            AI generation may take 10-30 seconds
                                        </p>
                                    </div>
                                )}

                                {/* Preview */}
                                {previewUrl && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                            Preview
                                        </h3>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full rounded-cartoon shadow-cartoon border-2 border-black"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!isLoading && (
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    resetModal();
                                    onClose();
                                }}
                                className="btn btn-ghost rounded-cartoon"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImageSelect}
                                disabled={!previewUrl}
                                className="btn btn-primary bg-cartoon-green hover:bg-cartoon-green/80 
                                         rounded-cartoon shadow-cartoon disabled:opacity-50"
                            >
                                Use This Image
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageUploadModal;