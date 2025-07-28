import React from 'react';
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

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
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
    <div className="border-2 border-black rounded-t-cartoon bg-cartoon-yellow p-4 flex flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('bold') ? 'bg-cartoon-pink text-white' : 'bg-white'
        }`}
      >
        <FaBold />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('italic') ? 'bg-cartoon-pink text-white' : 'bg-white'
        }`}
      >
        <FaItalic />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('strike') ? 'bg-cartoon-pink text-white' : 'bg-white'
        }`}
      >
        <FaStrikethrough />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('code') ? 'bg-cartoon-pink text-white' : 'bg-white'
        }`}
      >
        <FaCode />
      </button>
      
      <div className="divider divider-horizontal mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('heading', { level: 2 }) ? 'bg-cartoon-blue text-white' : 'bg-white'
        }`}
      >
        <FaHeading />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('bulletList') ? 'bg-cartoon-blue text-white' : 'bg-white'
        }`}
      >
        <FaListUl />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('orderedList') ? 'bg-cartoon-blue text-white' : 'bg-white'
        }`}
      >
        <FaListOl />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('codeBlock') ? 'bg-cartoon-blue text-white' : 'bg-white'
        }`}
      >
        <BiCodeBlock />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('blockquote') ? 'bg-cartoon-blue text-white' : 'bg-white'
        }`}
      >
        <FaQuoteLeft />
      </button>
      
      <div className="divider divider-horizontal mx-1"></div>
      
      <button
        onClick={setLink}
        className={`btn btn-sm shadow-cartoon-sm hover:shadow-cartoon transition-all ${
          editor.isActive('link') ? 'bg-cartoon-purple text-white' : 'bg-white'
        }`}
      >
        <FaLink />
      </button>
      
      <button
        onClick={addImage}
        className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all"
      >
        <FaImage />
      </button>
      
      <div className="divider divider-horizontal mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all"
      >
        <FaUndo />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="btn btn-sm bg-white shadow-cartoon-sm hover:shadow-cartoon transition-all"
      >
        <FaRedo />
      </button>
    </div>
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
          [&_.ProseMirror_p]:text-gray-800
          [&_.ProseMirror_p]:dark:text-gray-200
          [&_.ProseMirror_img]:rounded-cartoon
          [&_.ProseMirror_img]:shadow-cartoon
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