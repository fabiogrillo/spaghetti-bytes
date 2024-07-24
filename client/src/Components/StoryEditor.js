import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { motion } from "framer-motion";

const Font = Quill.import("formats/font");
Font.whitelist = ["sans-serif", "serif", "monospace"];
Quill.register(Font, true);

const StoryEditor = ({ value, onChange, readOnly = false }) => {
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
        className="custom-quill shadow-2xl rounded-2xl outline min-h-64 bg-neutral"
        theme={readOnly ? "bubble" : "snow"}
        value={value}
        onChange={onChange}
        modules={modules}
        readOnly={readOnly}
      />
    </motion.div>
  );
};

export default StoryEditor;
