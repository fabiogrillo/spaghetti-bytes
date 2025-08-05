import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCamera, FaMagic, FaTimes, FaSpinner } from 'react-icons/fa';
import { useToast } from './ToastProvider';

const ImageUploadModal = ({ isOpen, onClose, onImageSelect }) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const toast = useToast();

    // Compress image using canvas
    const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // Convert blob to base64
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setIsLoading(true);
        try {
            // Compress image
            const compressedBlob = await compressImage(file);
            const base64 = await blobToBase64(compressedBlob);

            setPreviewUrl(base64);
            toast.success('Image loaded successfully!');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle camera capture
    const handleCameraCapture = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const compressedBlob = await compressImage(file);
            const base64 = await blobToBase64(compressedBlob);

            setPreviewUrl(base64);
            toast.success('Photo captured successfully!');
        } catch (error) {
            console.error('Error processing photo:', error);
            toast.error('Failed to process photo');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle AI generation
    const handleAIGeneration = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please enter a description for the image');
            return;
        }

        setIsLoading(true);
        try {
            // Call AI generation endpoint
            const response = await fetch('/api/stories/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();
            setPreviewUrl(data.imageUrl);
            toast.success('Image generated successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image. Please try again.');
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
                                        <div
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                                                     rounded-cartoon p-8 text-center cursor-pointer
                                                     hover:border-cartoon-purple transition-colors"
                                        >
                                            <FaCamera className="text-4xl text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Click to take a photo
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Use your device camera
                                            </p>
                                        </div>
                                        <input
                                            ref={cameraInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleCameraCapture}
                                            className="hidden"
                                        />
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
                                        <div className="relative rounded-cartoon overflow-hidden shadow-cartoon">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-auto max-h-64 object-contain bg-gray-100 dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
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
                            disabled={!previewUrl || isLoading}
                            className="btn btn-primary rounded-cartoon shadow-cartoon 
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Insert Image
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageUploadModal;