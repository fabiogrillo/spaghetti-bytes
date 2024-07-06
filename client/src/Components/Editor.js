import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const StoryEditor = () => {
  const [value, setValue] = useState("");

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
    history: {
      delay: 2000,
      userOnly: true,
    }
  };


  return (
    <div className="card w-full min-h-96 bg-carolina-blue p-6">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        placeholder="Type your story here..."
      />
    </div>
  );
};

export default StoryEditor;
