import React, { useState } from "react";
import StoryEditor from "../Components/StoryEditor";
import { motion } from "framer-motion";
import { IoMdAdd } from "react-icons/io";
import { FaCheck, FaTimes, FaLinkedin, FaMedium } from "react-icons/fa";
import illustration1 from "../Assets/Images/rondy-stickers-lettering-sticker-start-here.gif";

const StoryPublisher = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState("");
  const [shareOnLinkedIn, setShareOnLinkedIn] = useState(false);
  const [shareOnMedium, setShareOnMedium] = useState(false);
  const [errors, setErrors] = useState({});

  const maxTitleLength = 100;
  const maxSummaryLength = 1000;

  const validateForm = () => {
    const newErrors = {};
    if (!title) newErrors.title = "Title is required";
    if (!summary) newErrors.summary = "Summary is required";
    if (tags.length < 3) newErrors.tags = "Please add at least 3 tags";
    if (!content) newErrors.content = "Content is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const storyData = {
      title,
      summary,
      tags,
      content,
      shareOnLinkedIn,
      shareOnMedium,
    };

    try {
      const response = await fetch("/api/stories/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });
      if (response.ok) {
        console.log("Story published successfully");
      } else {
        console.log("Error publishing story");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
      setErrors((prevErrors) => ({ ...prevErrors, tags: "" }));
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleEditorChange = (content, delta, source, editor) => {
    setContent(editor.getHTML());
    setErrors((prevErrors) => ({ ...prevErrors, content: "" }));
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div
        className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
      >
        <div className="md:w-3/5 text-start space-y-6">
          <h1 className="text-2xl font-bold mb-4">
            Let's write a new incredible story 🤩
          </h1>
          <p>
            Choose the title and then start writing, remember to set the summary
            up and decide whether to publish it on LinkedIn and/or Medium. Don't
            forget about tags.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center md:w-2/5">
          <img src={illustration1} alt="Illustration Start" className="w-60" />
          <p className="text-xs text-center mt-4 md:mt-0">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/ODexzOcCgAMh">
              Finn Reville
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="form-control pt-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
      >
        <label className="label">
          First start with an astonishing title for your story 😲 (Max 100
          characters)
        </label>
        <input
          type="text"
          placeholder="Your title here..."
          className="input input-bordered"
          value={title}
          maxLength={maxTitleLength}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
          }}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        <p className="text-right text-sm">
          {title.length}/{maxTitleLength} characters
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
        className="pt-8"
      >
        <p className="pb-2">What is your story about?</p>
        <StoryEditor value={content} onChange={handleEditorChange} />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content}</p>
        )}
      </motion.div>

      <motion.div
        className="form-control pt-8"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 1.2, ease: "easeOut" }}
      >
        <label className="label">
          Briefly describe what you have already written (Max 1000 characters)
        </label>
        <textarea
          placeholder="Summary"
          className="textarea textarea-bordered"
          value={summary}
          maxLength={maxSummaryLength}
          onChange={(e) => {
            setSummary(e.target.value);
            setErrors((prevErrors) => ({ ...prevErrors, summary: "" }));
          }}
        />
        {errors.summary && (
          <p className="text-red-500 text-sm">{errors.summary}</p>
        )}
        <p className="text-right text-sm">
          {summary.length}/{maxSummaryLength} characters
        </p>
      </motion.div>

      <motion.div
        className="form-control pt-8 flex flex-col "
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1.2, ease: "easeOut" }}
      >
        <div className="">
          <label className="label">Insert some tags (at least 3)</label>
          <div className="input-group space-x-4 justify-center">
            <input
              type="text"
              placeholder="New Tag"
              className="input input-bordered"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setErrors((prevErrors) => ({ ...prevErrors, tags: "" }));
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddTag}
            >
              <IoMdAdd />
            </button>
          </div>
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
          <div className="flex flex-wrap mt-3 gap-3 ">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="badge badge-md badge-primary flex items-center space-x-2"
              >
                <span>{tag}</span>
                <button onClick={() => handleRemoveTag(index)}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.0, duration: 1.2, ease: "easeOut" }}
        className="pt-8"
      >
        <div className="form-control flex items-center space-x-2">
          <label className="cursor-pointer label flex items-center">
            <FaLinkedin className="mr-2" />
            <span className="label-text">Share on LinkedIn</span>
            <input
              type="checkbox"
              className="toggle toggle-warning ml-2"
              checked={shareOnLinkedIn}
              onChange={() => setShareOnLinkedIn(!shareOnLinkedIn)}
            />
          </label>
        </div>
        <div className="form-control flex items-center space-x-2">
          <label className="cursor-pointer label flex items-center">
            <FaMedium className="mr-2" />
            <span className="label-text">Share on Medium</span>
            <input
              type="checkbox"
              className="toggle toggle-error ml-2"
              checked={shareOnMedium}
              onChange={() => setShareOnMedium(!shareOnMedium)}
            />
          </label>
        </div>
        <div className="text-center p-16">
          <button
            type="submit"
            className="btn btn-success rounded-3xl"
            onClick={handleSubmit}
          >
            <FaCheck className="mr-2" />
            Publish
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryPublisher;
