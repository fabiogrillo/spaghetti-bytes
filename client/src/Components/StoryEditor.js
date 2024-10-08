import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

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
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    },
  };

  return (
    <div className="card ">
      <ReactQuill
        className="custom-quill rounded-2xl border-2"
        theme={readOnly ? "bubble" : "snow"}
        value={value}
        onChange={onChange}
        modules={modules}
        readOnly={readOnly}
      />
    </div>
  );
};

export default StoryEditor;
