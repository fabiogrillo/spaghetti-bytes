import React, { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Api';
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaImage,
  FaLink,
  FaUndo,
  FaRedo,
  FaHeading
} from 'react-icons/fa';
import {
  BiCodeBlock, BiCamera, BiUpload,
  BiX, BiLoaderAlt, BiSolidMagicWand
} from 'react-icons/bi';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);

// Enhanced Image Modal Component
const ImageModal = ({ isOpen, onClose, editor }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      insertImage(response.data.url);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. For now, you can use a URL.');
      // Fallback to URL input
      setActiveTab('url');
    } finally {
      setUploading(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await handleFileUpload(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  // Generate AI image with Hugging Face
  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description for the image');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/generate/image', { prompt: aiPrompt });
      insertImage(response.data.url);
      onClose();
      setAiPrompt('');
    } catch (error) {
      console.error('Generation error:', error);
      alert('AI generation failed. Using placeholder service instead.');
      // Fallback to placeholder
      const placeholderUrl = `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(aiPrompt)}`;
      insertImage(placeholderUrl);
      onClose();
    } finally {
      setGenerating(false);
    }
  };

  // Insert image from URL
  const insertImageFromUrl = () => {
    if (imageUrl.trim()) {
      insertImage(imageUrl);
      onClose();
      setImageUrl('');
    }
  };

  // Insert image into editor
  const insertImage = (url) => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  // Cleanup
  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={() => {
          onClose();
          stopCamera();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black max-w-lg w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-black bg-cartoon-yellow">
            <h3 className="text-xl font-bold">Add Image</h3>
            <button
              onClick={() => {
                onClose();
                stopCamera();
              }}
              className="btn btn-ghost btn-sm rounded-cartoon"
            >
              <BiX size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'url'
                  ? 'bg-cartoon-blue text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <FaLink className="inline mr-2" />
              URL
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'upload'
                  ? 'bg-cartoon-yellow text-black'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <BiUpload className="inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'camera'
                  ? 'bg-cartoon-pink text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <BiCamera className="inline mr-2" />
              Camera
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'ai'
                  ? 'bg-cartoon-purple text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <BiSolidMagicWand className="inline mr-2" />
              AI
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-bold">Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="input input-bordered w-full rounded-cartoon"
                    onKeyPress={(e) => e.key === 'Enter' && insertImageFromUrl()}
                  />
                </div>
                <button
                  onClick={insertImageFromUrl}
                  className="btn btn-primary w-full rounded-cartoon shadow-cartoon"
                  disabled={!imageUrl.trim()}
                >
                  Insert Image
                </button>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-cartoon p-8 text-center cursor-pointer hover:border-cartoon-blue transition-colors"
                >
                  <BiUpload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF or WebP (max 5MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                {uploading && (
                  <div className="text-center">
                    <BiLoaderAlt className="animate-spin mx-auto text-cartoon-blue" size={32} />
                    <p className="mt-2">Uploading...</p>
                  </div>
                )}
              </div>
            )}

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-cartoon bg-black"
                  style={{ maxHeight: '300px' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={capturePhoto}
                  className="btn btn-primary w-full rounded-cartoon shadow-cartoon"
                  disabled={!cameraStream}
                >
                  <BiCamera className="mr-2" />
                  Capture Photo
                </button>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-bold">
                      Describe the image you want
                    </span>
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
                    className="textarea textarea-bordered w-full rounded-cartoon"
                    rows={4}
                  />
                </div>
                <button
                  onClick={generateAIImage}
                  className="btn btn-primary w-full rounded-cartoon shadow-cartoon"
                  disabled={generating || !aiPrompt.trim()}
                >
                  {generating ? (
                    <>
                      <BiLoaderAlt className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BiSolidMagicWand className="mr-2" />
                      Generate Image
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Powered by Stable Diffusion via Hugging Face
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Original MenuBar with enhanced image button
const MenuBar = ({ editor }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <>
      <div className="border-2 border-black rounded-t-cartoon bg-cartoon-yellow p-4 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('bold') ? 'bg-cartoon-pink text-white' : 'bg-white text-cartoon-pink'
            }`}
        >
          <FaBold />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('italic') ? 'bg-cartoon-pink text-white' : 'bg-white text-cartoon-yellow'
            }`}
        >
          <FaItalic />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('strike') ? 'bg-cartoon-pink text-white' : 'bg-white text-cartoon-purple'
            }`}
        >
          <FaStrikethrough />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('code') ? 'bg-cartoon-pink text-white' : 'bg-white text-cartoon-orange'
            }`}
        >
          <FaCode />
        </button>

        <div className="divider divider-horizontal mx-1"></div>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-cartoon-blue text-white' : 'bg-white text-cartoon-blue'
            }`}
        >
          <FaHeading />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('bulletList') ? 'bg-cartoon-blue text-white' : 'bg-white text-cartoon-pink'
            }`}
        >
          <FaListUl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('orderedList') ? 'bg-cartoon-blue text-white' : 'bg-white text-cartoon-yellow'
            }`}
        >
          <FaListOl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('codeBlock') ? 'bg-cartoon-blue text-white' : 'bg-white text-cartoon-blue'
            }`}
        >
          <BiCodeBlock />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('blockquote') ? 'bg-cartoon-blue text-white' : 'bg-white text-cartoon-purple'
            }`}
        >
          <FaQuoteLeft />
        </button>

        <div className="divider divider-horizontal mx-1"></div>

        <button
          onClick={setLink}
          className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${editor.isActive('link') ? 'bg-cartoon-purple text-white' : 'bg-white text-cartoon-orange'
            }`}
        >
          <FaLink />
        </button>

        <button
          onClick={() => setShowImageModal(true)}
          className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all text-cartoon-pink group"
        >
          <FaImage className="group-hover:hidden" />
          <BiSolidMagicWand className="hidden group-hover:block animate-pulse" />
        </button>

        <div className="divider divider-horizontal mx-1"></div>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all text-cartoon-purple"
        >
          <FaUndo />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all text-cartoon-orange"
        >
          <FaRedo />
        </button>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        editor={editor}
      />
    </>
  );
};

const TipTapEditor = ({ value, onChange, readOnly = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Highlight,
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-cartoon shadow-cartoon max-w-full h-auto',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
  });

  return (
    <div className={`${!readOnly ? 'shadow-cartoon rounded-cartoon' : ''}`}>
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className={`
          prose prose-lg max-w-none
          ${!readOnly ? 'min-h-[400px] p-6 bg-white dark:bg-gray-800 rounded-b-cartoon border-2 border-t-0 border-black' : ''}
          dark:prose-invert
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[380px]
          [&_.ProseMirror_h1]:text-3xl
          [&_.ProseMirror_h2]:text-2xl
          [&_.ProseMirror_h3]:text-xl
          [&_.ProseMirror_p]:my-3
          [&_.ProseMirror_p]:text-gray-450
          [&_.ProseMirror_p]:dark:text-grey
          [&_.ProseMirror_img]:rounded-cartoon
          [&_.ProseMirror_img]:shadow-cartoon
          [&_.ProseMirror_img]:mx-auto
          [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_blockquote]:border-l-4
          [&_.ProseMirror_blockquote]:border-cartoon-pink
          [&_.ProseMirror_blockquote]:pl-4
          [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_code]:bg-gray-100
          [&_.ProseMirror_code]:dark:bg-gray-700
          [&_.ProseMirror_code]:px-1
          [&_.ProseMirror_code]:rounded
          [&_.ProseMirror_pre]:bg-gray-900
          [&_.ProseMirror_pre]:text-gray-100
          [&_.ProseMirror_pre]:p-4
          [&_.ProseMirror_pre]:rounded-cartoon
          [&_.ProseMirror_pre]:shadow-cartoon
        `}
      />
    </div>
  );
};

export default TipTapEditor;