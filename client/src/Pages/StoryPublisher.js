import React, { useState, useEffect } from "react";
import TipTapEditor from "../Components/TipTapEditor";
import { IoMdAdd } from "react-icons/io";
import { FaTimes, FaMedium } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft, BsArrowRight, BsCheck2All } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const StoryPublisher = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [content, setContent] = useState("");
  const [shareOnMedium, setShareOnMedium] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const maxTitleLength = 100;
  const maxSummaryLength = 1000;

  useEffect(() => {
    if (id) {
      fetchStory(id);
    }
  }, [id]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!id && (title || summary || tags.length > 0 || content)) {
      setIsSaving(true);
      const saveTimer = setTimeout(() => {
        localStorage.setItem('draft', JSON.stringify({ title, summary, tags, content }));
        setLastSaved(new Date());
        setIsSaving(false);
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [title, summary, tags, content, id]);

  // Load draft on mount
  useEffect(() => {
    if (!id) {
      const draft = localStorage.getItem('draft');
      if (draft) {
        const { title: draftTitle, summary: draftSummary, tags: draftTags, content: draftContent } = JSON.parse(draft);
        if (draftTitle) setTitle(draftTitle);
        if (draftSummary) setSummary(draftSummary);
        if (draftTags) setTags(draftTags);
        if (draftContent) setContent(draftContent);
      }
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

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!title) newErrors.title = "Title is required";
      if (!summary) newErrors.summary = "Summary is required";
    } else if (step === 2) {
      if (tags.length < 3) newErrors.tags = "Please add at least 3 tags";
      if (!content || content === "<p></p>") newErrors.content = "Content is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
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
        localStorage.removeItem('draft');
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
        <span className="loading loading-spinner loading-lg text-error"></span>
        <p className="mt-4">Loading story...</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {id ? "Edit Your Story" : "Create a New Story"}
        </h1>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            1
          </div>
          <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            2
          </div>
          <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            3
          </div>
        </div>

        <p className="text-sm text-base-content/60">
          Step {currentStep} of 3: {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Content" : "Review & Publish"}
        </p>

        {/* Auto-save indicator */}
        {!id && (
          <div className="mt-2 text-xs text-base-content/40">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <span className="loading loading-spinner loading-xs"></span>
                Saving draft...
              </span>
            ) : lastSaved ? (
              <span>Draft saved {new Date(lastSaved).toLocaleTimeString()}</span>
            ) : null}
          </div>
        )}
      </motion.div>

      {/* Wizard Steps */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait" custom={currentStep}>
          {/* Step 1: Title & Summary */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content">Basic Information</h2>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Story Title</span>
                  <span className="label-text-alt text-base-content/60">{title.length}/{maxTitleLength}</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a captivating title..."
                  className="input input-bordered w-full rounded-soft"
                  value={title}
                  maxLength={maxTitleLength}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                  }}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.title}</span>
                  </label>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Summary</span>
                  <span className="label-text-alt text-base-content/60">{summary.length}/{maxSummaryLength}</span>
                </label>
                <textarea
                  placeholder="Brief description of your story..."
                  className="textarea textarea-bordered w-full rounded-soft h-32"
                  value={summary}
                  maxLength={maxSummaryLength}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, summary: "" }));
                  }}
                />
                {errors.summary && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.summary}</span>
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Tags & Content */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content">Tags & Content</h2>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Tags (minimum 3)</span>
                  <span className="label-text-alt text-base-content/60">{tags.length} tags</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="input input-bordered flex-1 rounded-soft"
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
                    className="btn btn-primary rounded-soft"
                    onClick={handleAddTag}
                  >
                    <IoMdAdd size={20} />
                  </motion.button>
                </div>
                {errors.tags && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.tags}</span>
                  </label>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="badge badge-lg badge-primary flex items-center gap-2 px-4 py-3"
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

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content mb-2">Story Content</span>
                </label>
                <TipTapEditor
                  value={content}
                  onChange={handleEditorChange}
                  error={errors.content}
                />
                {errors.content && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.content}</span>
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Publish */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content">Review & Publish</h2>

              {/* Preview */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">TITLE</h3>
                  <p className="text-xl font-bold text-base-content">{title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">SUMMARY</h3>
                  <p className="text-base-content">{summary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="badge badge-primary badge-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">CONTENT PREVIEW</h3>
                  <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content.substring(0, 300) + '...' }} />
                </div>
              </div>

              <div className="divider"></div>

              {/* Medium Sharing */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-lg"
                    checked={shareOnMedium}
                    onChange={(e) => setShareOnMedium(e.target.checked)}
                  />
                  <div className="flex items-center gap-3">
                    <FaMedium className="text-3xl text-primary" />
                    <div>
                      <span className="label-text font-bold text-base-content">Share on Medium</span>
                      <p className="text-xs text-base-content/60">Automatically publish to your Medium account</p>
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {currentStep > 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-outline rounded-soft shadow-soft"
                onClick={handleBack}
              >
                <BsArrowLeft /> Back
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-outline rounded-soft shadow-soft"
                onClick={() => navigate("/manager")}
              >
                <BsArrowLeft /> Cancel
              </motion.button>
            )}
          </div>

          <div>
            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-primary rounded-soft shadow-soft-lg"
                onClick={handleNext}
              >
                Next <BsArrowRight />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-success rounded-soft shadow-soft-lg text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <BsCheck2All size={20} />
                    {id ? "Update Story" : "Publish Story"}
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPublisher;
