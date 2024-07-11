import React, { useState } from "react";
import Editor from "../Components/Editor";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import { IoMdAdd } from "react-icons/io";
import { FaCheck, FaTimes } from "react-icons/fa";
import illustration1 from "../Assets/Images/droll-start-up-launch.gif";
const StoryPublisher = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState("");
  const [shareOnLinkedIn, setShareOnLinkedIn] = useState(false);
  const [shareOnMedium, setShareOnMedium] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const articleData = {
      title,
      summary,
      tags,
      content,
      shareOnLinkedIn,
      shareOnMedium,
    };
    // Call the backend API to save the article
    console.log("Article data:", articleData);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const { scrollY } = useViewportScroll();

  const scaleTitle = useTransform(scrollY, [0, 0.3, 0.4], [1, 0.8, 0.7]);
  const opacityTitle = useTransform(
    scrollY,
    [0, 0.3, 0.4, 0.5],
    [1, 0.7, 0.5, 0.9]
  );

  const scaleEditor = useTransform(scrollY, [0.2, 0.3, 0.8], [0.7, 1, 0.7]);
  const opacityEditor = useTransform(scrollY, [300, 600], [1, 0.5]);

  const scaleSummary = useTransform(scrollY, [600, 900], [1, 1.05]);
  const opacitySummary = useTransform(scrollY, [600, 900], [1, 0.5]);

  const scaleTags = useTransform(scrollY, [900, 1200], [1, 1.05]);
  const opacityTags = useTransform(scrollY, [900, 1200], [1, 0.5]);

  const scaleOptions = useTransform(scrollY, [1200, 1500], [1, 1.05]);
  const opacityOptions = useTransform(scrollY, [1200, 1500], [1, 0.5]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-4">
          Let's write a new incredible story 🤩
        </h1>
        <p>
          Choose the title and then start writing, remember to set the summary
          up and decide whether to publish it on LinkedIn and/or Medium. Don't
          forget about tags.
        </p>
      </motion.div>

      <motion.div
        className="form-control"
        style={{ scale: scaleTitle, opacity: opacityTitle }}
      >
        <label className="label">Title</label>
        <input
          type="text"
          placeholder="Write the title here..."
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </motion.div>

      <motion.div style={{ scale: scaleEditor, opacity: opacityEditor }}>
        <p>Story</p>
        <Editor value={content} onChange={setContent} />
      </motion.div>

      <motion.div
        className="form-control"
        style={{ scale: scaleSummary, opacity: opacitySummary }}
      >
        <label className="label">Summary</label>
        <textarea
          placeholder="Summary"
          className="textarea textarea-bordered"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </motion.div>

      <motion.div
        className="form-control"
        style={{ scale: scaleTags, opacity: opacityTags }}
      >
        <label className="label">Tags</label>
        <div className="input-group space-x-4">
          <input
            type="text"
            placeholder="New Tag"
            className="input input-bordered"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddTag}
          >
            <IoMdAdd />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
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
      </motion.div>

      <motion.div style={{ scale: scaleOptions, opacity: opacityOptions }}>
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">Share on LinkedIn</span>
            <input
              type="checkbox"
              className="toggle toggle-warning"
              checked={shareOnLinkedIn}
              onChange={() => setShareOnLinkedIn(!shareOnLinkedIn)}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">Share on Medium</span>
            <input
              type="checkbox"
              className="toggle toggle-error"
              checked={shareOnMedium}
              onChange={() => setShareOnMedium(!shareOnMedium)}
            />
          </label>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-success"
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
