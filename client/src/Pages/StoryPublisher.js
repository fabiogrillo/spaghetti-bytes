import React, { useState, useEffect } from "react";
import StoryEditor from "../Components/StoryEditor";
import { IoMdAdd } from "react-icons/io";
import { FaTimes, FaMedium } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft, BsCheck2All } from "react-icons/bs";

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
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {id ? "Edit Your Story" : "Let's Write a New Incredible Story"}
          </h1>
          <p className="py-2 md:text-base">
            {id
              ? "You are currently editing your story. Please ensure all details are accurate, including the title, summary, and tags. After making your changes, you can update the story by clicking the button below"
              : "Start by choosing a title for your story. Once the title is set, you can begin writing. Remember to provide a concise summary and include relevant tags. If you'd like, you can also share your story on Medium. Once you're ready, click the publish button"}
          </p>
        </div>
      </div>

      <div className="card p-6 my-8 space-y-4">
        <div className="form-control items-center">
          <label className="label font-mono text-center">
            {id
              ? "Edit the title of your story"
              : "Start with a title"}
          </label>
          <input
            type="text"
            placeholder="Your title here..."
            className="input input-bordered italic"
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
          <p className="text-right text-xs mt-1">
            {title.length}/{maxTitleLength} characters
          </p>
        </div>

        <div className="form-control items-center">
          <label className="label font-mono text-center">
            {id
              ? "Edit the summary of your story"
              : "Brief description"}
          </label>
          <textarea
            placeholder="Summary here..."
            className="textarea textarea-bordered italic"
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
          <p className="text-right text-xs mt-1">
            {summary.length}/{maxSummaryLength} characters
          </p>
        </div>

        <div className="form-control items-center">
          <label className="label font-mono text-center">
            {id ? "Edit your tags" : "Add some tags (at least 3)"}
          </label>
          <div className="input-group flex flex-row justify-between space-x-2">
            <input
              type="text"
              placeholder="New Tag..."
              className="input input-bordered italic"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setErrors((prevErrors) => ({ ...prevErrors, tags: "" }));
              }}
            />
            <button
              type="button"
              className="btn btn-primary  rounded-full"
              onClick={handleAddTag}
            >
              <IoMdAdd />
            </button>
          </div>
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
          <div className="flex flex-wrap mt-3 gap-3">
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

        <div className="form-control items-center">
          <label className="label font-mono text-center">
            {id ? "Edit your story" : "Now write your story"}
          </label>
          <StoryEditor
            value={content}
            onChange={handleEditorChange}
            error={errors.content}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content}</p>
          )}
        </div>

        <div className="form-control flex items-center">
          <label className="label font-mono text-center">
            {id
              ? "Edit your Medium sharing settings"
              : "Share your story on Medium?"}
          </label>
          <div className="flex space-x-2">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={shareOnMedium}
              onChange={(e) => setShareOnMedium(e.target.checked)}
            />
            <FaMedium className="text-2xl " />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          className="btn btn-primary btn-sm rounded-2xl"
          onClick={() => navigate("/manager")}
        >
          <BsArrowLeft /> Back
        </button>
        <button
          type="submit"
          className="btn btn-success btn-sm rounded-2xl"
          onClick={handleSubmit}
        >
          <BsCheck2All />
          {id ? "Update Story" : "Publish Story"}
        </button>
      </div>
    </div>
  );
};

export default StoryPublisher;
