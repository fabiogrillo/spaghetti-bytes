import React, { useState, useEffect } from "react";
import StoryEditor from "../Components/StoryEditor";
import { motion } from "framer-motion";
import { IoMdAdd } from "react-icons/io";
import { FaCheck, FaTimes, FaMedium } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import illustration1 from "../Assets/Images/rondy-stickers-lettering-sticker-start-here.gif";

const StoryPublisher = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState("");
  const [shareOnMedium, setShareOnMedium] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const maxTitleLength = 100;
  const maxSummaryLength = 1000;

  useEffect(() => {
    if (id) {
      fetchStory(id);
    }
  }, [id]);

  const fetchStory = async (storyId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      const data = await response.json();
      setTitle(data.title);
      setSummary(data.summary);
      setTags(data.tags);
      setContent(data.content);
      setShareOnMedium(data.sharedOnMedium);
    } catch (error) {
      console.error("Error fetching story:", error);
    }
  };

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
      shareOnMedium,
    };

    try {
      const response = await fetch(
        id ? `/api/stories/${id}` : "/api/stories/publish",
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(storyData),
        }
      );
      if (response.ok) {
        console.log("Story published/updated successfully");
        navigate("/blog", { state: { success: true } });
      } else {
        const errorData = await response.json();
        console.error("Error publishing/updating story:", errorData);
        navigate("/blog", { state: { success: false } });
      }
    } catch (error) {
      console.error("Network error:", error);
      navigate("/blog", { state: { success: false } });
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
    <div className="container mx-auto p-8 space-y-8">
      <motion.div
        className="flex flex-col md:flex-row items-center space-y-8 md:space-y-4 md:space-x-4 mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="md:w-3/5 text-start space-y-12">
          <h1 className="text-2xl font-bold mb-4">
            {id ? "Edit your story" : "Let's write a new incredible story 🤩"}
          </h1>
          <p className="italic">
            {id
              ? "Edit your existing story. Make sure to update the summary and tags if necessary."
              : "Choose the title and then start writing, remember to set the summary up and decide whether to publish it on LinkedIn and/or Medium. Don't forget about tags."}
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
        className="card bg-info  bg-opacity-35 shadow-md p-8 space-y-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="form-control">
          <label className="label">
            {id
              ? "Edit the title of your story"
              : "First start with an astonishing title for your story 😲 (Max 100 characters)"}
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
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
          <p className="text-right text-sm">
            {title.length}/{maxTitleLength} characters
          </p>
        </div>

        <div className="form-control">
          <label className="label">
            {id
              ? "Edit the summary of your story"
              : "Briefly describe what you have already written (Max 1000 characters)"}
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
        </div>

        <div className="form-control">
          <label className="label">
            {id ? "Edit your tags" : "Insert some tags (at least 3)"}
          </label>
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

        <div className="form-control">
          <label className="label">
            {id ? "Edit your story content" : "What is your story about?"}
          </label>
          <StoryEditor value={content} onChange={handleEditorChange} />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content}</p>
          )}
        </div>
        <div className="form-control flex items-center space-x-2">
          <label className="cursor-pointer label flex items-center">
            <FaMedium className="mr-2 text-3xl" />
            <span className="label-text">Share on Medium</span>
            <input
              type="checkbox"
              className="toggle toggle-primary ml-2"
              checked={shareOnMedium}
              onChange={() => setShareOnMedium(!shareOnMedium)}
            />
          </label>
        </div>
        <div className="text-center pt-8">
          <button
            type="submit"
            className="btn btn-primary rounded-3xl"
            onClick={handleSubmit}
          >
            <FaCheck className="mr-2" />
            {id ? "Update" : "Publish"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryPublisher;
