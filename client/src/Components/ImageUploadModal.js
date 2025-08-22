// Simplified ImageUploadModal.js - Only filesystem upload with base64 encoding
import React, { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ImageUploadModal = ({ isOpen, onClose, onImageSelect }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Compress image to reduce size
    const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
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

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Canvas to Blob conversion failed'));
                            }
                        },
                        file.type,
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

    // Handle file upload with validation and compression
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        setIsLoading(true);

        try {
            // Compress the image
            const compressedBlob = await compressImage(file);

            // Convert to base64
            const base64Image = await blobToBase64(compressedBlob);

            // Set the preview URL directly with base64 data
            setPreviewUrl(base64Image);
            toast.success('Image processed successfully!');

        } catch (error) {
            console.error('Image processing error:', error);
            toast.error('Failed to process image. Please try again.');

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle image confirmation
    const handleConfirm = () => {
        if (previewUrl) {
            onImageSelect(previewUrl);
            handleClose();
        }
    };

    // Handle modal close
    const handleClose = () => {
        setPreviewUrl(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-cartoon 
                          border-2 border-black shadow-cartoon-xl 
                          w-full max-w-lg">

                {/* Header */}
                <div className="flex items-center justify-between p-4 
                              border-b-2 border-black bg-cartoon-yellow 
                              rounded-t-cartoon">
                    <h3 className="text-xl font-bold text-black">
                        Upload Image
                    </h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-sm bg-white 
                                 hover:bg-cartoon-pink hover:text-white 
                                 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        // Loading state
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="loading loading-spinner loading-lg text-cartoon-pink"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                Processing image...
                            </p>
                        </div>
                    ) : previewUrl ? (
                        // Preview state
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-cartoon 
                                             border-2 border-black shadow-cartoon"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="btn btn-outline flex-1 
                                             border-2 border-black shadow-cartoon-sm 
                                             hover:shadow-cartoon"
                                >
                                    Choose Different
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="btn bg-cartoon-pink text-white flex-1 
                                             border-2 border-black shadow-cartoon-sm 
                                             hover:shadow-cartoon"
                                >
                                    <FaCheck className="mr-2" />
                                    Use This Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Upload state
                        <div className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-3 border-dashed border-gray-400 
                                         dark:border-gray-600 rounded-cartoon p-12 
                                         text-center cursor-pointer transition-all
                                         hover:border-cartoon-pink hover:bg-gray-50 
                                         dark:hover:bg-gray-700"
                            >
                                <FaUpload className="text-5xl text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    Click to upload an image
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    or drag and drop
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                                    JPG, PNG, GIF, WebP up to 10MB
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {/* Tip */}
                            <div className="bg-cartoon-yellow bg-opacity-20 rounded-cartoon p-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    💡 <span className="font-medium">Tip:</span> For best results,
                                    use images with 16:9 or 4:3 aspect ratio
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;