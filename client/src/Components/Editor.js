import React, { useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion } from "framer-motion";

const Font = Quill.import("formats/font");
Font.whitelist = ["sans-serif", "serif", "monospace"];
Quill.register(Font, true);

const StoryEditor = () => {
  const [value, setValue] = useState("");

  const modules = {
    toolbar: {
      container: [
        [
          {
            font: Font.whitelist,
          },
        ],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ color: [] }, { background: [] }], // Aggiunge i colori per il testo e lo sfondo
        [{ align: [] }], // Aggiunge i pulsanti di allineamento del testo
        ["link", "image"],
        ["clean"],
      ],
    },
  };

  return (
    <motion.div
      className="card bg-carolina-blue"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: "anticipate", duration: 1.5, x: { duration: 0.5 } }}
    >
      <ReactQuill
        className="custom-quill bg-neutral-content text-slate-800 shadow-lg rounded-2xl min-h-36"
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        placeholder="Type your story here..."
      />
    </motion.div>
  );
};

export default StoryEditor;
