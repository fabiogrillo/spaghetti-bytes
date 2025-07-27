import React, { useState, useEffect } from "react";
import TipTapEditor from "../Components/TipTapEditor";
import { IoMdAdd } from "react-icons/io";
import { FaTimes, FaMedium } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft, BsCheck2All } from "react-icons/bs";
import { motion } from "framer-motion";

const StoryPublisher = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState("");
  const [shareOnMedium, setShareOnMedium] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const response = await fetch(`/api/stories/${storyId}`);
      const data = await response.json();
      setTitle(data.title);
      setSummary(data.summary);
      setTags(data.tags);
      setContent(data.content);
      setShareOnMedium(data.sharedOnMedium);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title) newErrors.title = "Title is required";
    if (!summary) newErrors.summary = "Summary is required";
    if (tags.length < 3) newErrors.tags = "Please add at least 3 tags";
    if (!content || content === "<p></p>") newErrors.content = "Content is required";
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
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const handleEditorChange = (htmlContent) => {
    setContent(htmlContent);
    setErrors((prevErrors) => ({ ...prevErrors, content: "" }));
  };

  if (loading && id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
        <p className="mt-4">Loading story...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            {id ? "Edit Your Story" : "Let's Write a New Incredible Story"}
          </h1>
          <p className="py-2 md:text-base max-w-3xl mx-auto">
            {id
              ? "You are currently editing your story. Please ensure all details are accurate, including the title, summary, and tags. After making your changes, you can update the story by clicking the button below"
              : "Start by choosing a title for your story. Once the title is set, you can begin writing. Remember to provide a concise summary and include relevant tags. If you'd like, you can also share your story on Medium. Once you're ready, click the publish button"}
          </p>
        </div>
      </motion.div>

      <div className="card my-8 space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-cartoon shadow-cartoon border-2 border-black">
        <div className="form-control items-center w-full">
          <label className="label font-mono text-center">
            {id ? "Edit the title of your story" : "Start with a title"}
          </label>
          <input
            type="text"
            placeholder="Your title here..."
            className="input input-bordered w-full rounded-cartoon"
            value={title}
            maxLength={maxTitleLength}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
            }}
          />
          {errors.title && (
            <p className="text-error text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-right text-xs mt-1 w-full">
            {title.length}/{maxTitleLength} characters
          </p>
        </div>

        <div className="form-control items-center w-full">
          <label className="label font-mono text-center">
            {id ? "Edit the summary of your story" : "Brief description"}
          </label>
          <textarea
            placeholder="Summary here..."
            className="textarea textarea-bordered w-full rounded-cartoon"
            value={summary}
            maxLength={maxSummaryLength}
            onChange={(e) => {
              setSummary(e.target.value);
              setErrors((prevErrors) => ({ ...prevErrors, summary: "" }));
            }}
          />
          {errors.summary && (
            <p className="text-error text-sm mt-1">{errors.summary}</p>
          )}
          <p className="text-right text-xs mt-1 w-full">
            {summary.length}/{maxSummaryLength} characters
          </p>
        </div>

        <div className="form-control items-center w-full">
          <label className="label font-mono text-center">
            {id ? "Edit your tags" : "Add some tags (at least 3)"}
          </label>
          <div className="input-group flex flex-row justify-between space-x-2 w-full">
            <input
              type="text"
              placeholder="New Tag..."
              className="input input-bordered w-full rounded-cartoon"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setErrors((prevErrors) => ({ ...prevErrors, tags: "" }));
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="btn btn-primary rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
              onClick={handleAddTag}
            >
              <IoMdAdd />
            </motion.button>
          </div>
          {errors.tags && <p className="text-error text-sm mt-1">{errors.tags}</p>}
          <div className="flex flex-wrap mt-3 gap-3">
            {tags.map((tag, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-lg bg-cartoon-pink text-white flex items-center space-x-2 p-3 shadow-cartoon-sm"
              >
                <span>{tag}</span>
                <button 
                  onClick={() => handleRemoveTag(index)}
                  className="hover:scale-110 transition-transform"
                >
                  <FaTimes />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="form-control items-center w-full">
          <label className="label font-mono text-center mb-4">
            {id ? "Edit your story" : "Now write your story"}
          </label>
          <TipTapEditor
            value={content}
            onChange={handleEditorChange}
            error={errors.content}
          />
          {errors.content && (
            <p className="text-error text-sm mt-1">{errors.content}</p>
          )}
        </div>

        <div className="form-control flex items-center w-full">
          <label className="label font-mono text-center">
            {id
              ? "Edit your Medium sharing settings"
              : "Share your story on Medium?"}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-lg"
              checked={shareOnMedium}
              onChange={(e) => setShareOnMedium(e.target.checked)}
            />
            <FaMedium className="text-3xl" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="btn btn-primary btn-outline rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
          onClick={() => navigate("/manager")}
        >
          <BsArrowLeft /> Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="btn btn-success rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <BsCheck2All />
              {id ? "Update Story" : "Publish Story"}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default StoryPublisher;