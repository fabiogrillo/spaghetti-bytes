import React, { useState } from 'react';
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
import { BiCodeBlock } from 'react-icons/bi';
import ImageUploadModal from './ImageUploadModal';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);

const MenuBar = ({ editor, onImageClick }) => {
  if (!editor) return null;

  const addImage = () => {
    onImageClick();
  };

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
    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-3 flex flex-wrap gap-1 items-center">
      {/* Text formatting group */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('bold') ? 'btn-active' : ''}`}
          title="Bold"
        >
          <FaBold />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('italic') ? 'btn-active' : ''}`}
          title="Italic"
        >
          <FaItalic />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('strike') ? 'btn-active' : ''}`}
          title="Strikethrough"
        >
          <FaStrikethrough />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('code') ? 'btn-active' : ''}`}
          title="Inline Code"
        >
          <FaCode />
        </button>
      </div>

      <div className="divider divider-horizontal mx-0 w-px bg-base-300 h-6"></div>

      {/* Block formatting group */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}
          title="Heading 2"
        >
          <FaHeading />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('bulletList') ? 'btn-active' : ''}`}
          title="Bullet List"
        >
          <FaListUl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('orderedList') ? 'btn-active' : ''}`}
          title="Numbered List"
        >
          <FaListOl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('codeBlock') ? 'btn-active' : ''}`}
          title="Code Block"
        >
          <BiCodeBlock />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-ghost btn-sm ${editor.isActive('blockquote') ? 'btn-active' : ''}`}
          title="Quote"
        >
          <FaQuoteLeft />
        </button>
      </div>

      <div className="divider divider-horizontal mx-0 w-px bg-base-300 h-6"></div>

      {/* Insert group */}
      <div className="flex gap-1">
        <button
          onClick={setLink}
          className={`btn btn-ghost btn-sm ${editor.isActive('link') ? 'btn-active' : ''}`}
          title="Add Link"
        >
          <FaLink />
        </button>

        <button
          onClick={addImage}
          className="btn btn-ghost btn-sm"
          title="Add Image"
        >
          <FaImage />
        </button>
      </div>

      <div className="divider divider-horizontal mx-0 w-px bg-base-300 h-6"></div>

      {/* History group */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="btn btn-ghost btn-sm"
          title="Undo"
        >
          <FaUndo />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="btn btn-ghost btn-sm"
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

const TipTapEditor = ({ value, onChange, readOnly = false }) => {
  const [showImageModal, setShowImageModal] = useState(false);

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
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  const handleImageSelect = (imageUrl) => {
    if (editor && imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  return (
    <>
      <div className={`${!readOnly ? 'shadow-soft-lg rounded-soft' : ''}`}>
        {!readOnly && <MenuBar editor={editor} onImageClick={() => setShowImageModal(true)} />}
        <EditorContent
          editor={editor}
          className={`
            prose prose-lg max-w-none
            ${!readOnly ? 'min-h-[400px] p-6 bg-white dark:bg-gray-800 rounded-b-soft border border-t-0 border-base-300' : ''}
            dark:prose-invert
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:min-h-[380px]
            [&_.ProseMirror_h1]:text-3xl
            [&_.ProseMirror_h2]:text-2xl
            [&_.ProseMirror_h3]:text-xl
            [&_.ProseMirror_p]:my-3
            [&_.ProseMirror_p]:text-base-content/70
            [&_.ProseMirror_p]:dark:text-base-content/70
            [&_.ProseMirror_img]:rounded-soft
            [&_.ProseMirror_img]:shadow-soft-lg
            [&_.ProseMirror_blockquote]:border-l-4
            [&_.ProseMirror_blockquote]:border-primary
            [&_.ProseMirror_blockquote]:pl-4
            [&_.ProseMirror_blockquote]:italic
            [&_.ProseMirror_code]:bg-base-200
            [&_.ProseMirror_code]:dark:bg-base-300
            [&_.ProseMirror_code]:px-1
            [&_.ProseMirror_code]:rounded
            [&_.ProseMirror_pre]:bg-base-300
            [&_.ProseMirror_pre]:dark:bg-base-100
            [&_.ProseMirror_pre]:p-4
            [&_.ProseMirror_pre]:rounded-soft
            [&_.ProseMirror_pre]:shadow-soft-lg
          `}
        />
      </div>

      {!readOnly && (
        <ImageUploadModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onImageSelect={handleImageSelect}
        />
      )}
    </>
  );
};

export default TipTapEditor;