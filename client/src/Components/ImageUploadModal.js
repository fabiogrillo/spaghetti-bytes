import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCamera, FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../Api'; // Use the api module

const ImageUploadModal = ({ isOpen, onClose, onImageSelect }) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [previewUrl, setPreviewUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

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

    // Initialize camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error('Failed to access camera. Please check permissions.');
        }
    };

    // Take photo from camera
    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            try {
                const base64 = await blobToBase64(blob);
                setPreviewUrl(base64);
                toast.success('Photo captured!');

                // Stop camera after capture
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    setIsCameraActive(false);
                }
            } catch (error) {
                console.error('Error processing photo:', error);
                toast.error('Failed to process photo');
            }
        }, 'image/jpeg', 0.8);
    };

    // Cleanup camera on unmount or tab change
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Stop camera when changing tabs
    useEffect(() => {
        if (activeTab !== 'camera' && streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
        }
    }, [activeTab]);

    // Handle AI generation - Fixed to use api module
    const handleAIGeneration = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please enter a description for the image');
            return;
        }

        setIsLoading(true);
        try {
            // Use the api module which handles the proxy correctly
            const response = await api.post('/stories/generate-image', {
                prompt: aiPrompt
            });

            if (response.data && response.data.imageUrl) {
                setPreviewUrl(response.data.imageUrl);
                toast.success('Image generated successfully!');
            } else {
                throw new Error('No image URL in response');
            }
        } catch (error) {
            console.error('Error generating image:', error);

            // More specific error messages
            if (error.response?.status === 503) {
                toast.error('AI model is loading. Please try again in a moment.');
            } else if (error.response?.status === 401) {
                toast.error('API key error. Please contact support.');
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
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

        // Stop camera if active
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
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
                            onClick={onClose}
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
                                        {!isCameraActive ? (
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
                                                        className="w-full h-auto"
                                                    />
                                                </div>
                                                <button
                                                    onClick={takePhoto}
                                                    className="w-full btn btn-primary bg-cartoon-purple hover:bg-cartoon-purple/80 
                                                             rounded-cartoon shadow-cartoon"
                                                >
                                                    <FaCamera className="mr-2" />
                                                    Take Photo
                                                </button>
                                            </div>
                                        )}

                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                )}

                                {/* AI Tab */}
                                {activeTab === 'ai' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Describe the image you want to generate
                                            </label>
                                            <textarea
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="A beautiful sunset over mountains with vibrant colors..."
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                                                         rounded-cartoon focus:ring-2 focus:ring-cartoon-orange 
                                                         dark:bg-gray-700 dark:text-gray-200"
                                                rows={4}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAIGeneration}
                                            className="w-full btn btn-primary bg-cartoon-orange hover:bg-cartoon-orange/80 
                                                     rounded-cartoon shadow-cartoon"
                                        >
                                            <FaMagic className="mr-2" />
                                            Generate Image
                                        </button>
                                    </div>
                                )}

                                {/* Preview */}
                                {previewUrl && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                                onClick={onClose}
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