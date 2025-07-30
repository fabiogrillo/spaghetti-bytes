import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TipTapEditor from "../Components/TipTapEditor";
import { BsArrowLeft } from "react-icons/bs";
import { BiTime, BiBookReader } from "react-icons/bi";
import { motion } from "framer-motion";
import ShareButtons from "../Components/ShareButtons";

const StoryVisualizer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-20">
        <span className="loading loading-infinity loading-lg text-cartoon-pink"></span>
        <p className="mt-4 text-lg">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-error">Story not found</h2>
        <p className="mt-4">The story you're looking for doesn't exist.</p>
        <button
          className="btn btn-primary mt-6 rounded-cartoon"
          onClick={() => navigate("/blog")}
        >
          <BsArrowLeft /> Back to Blog
        </button>
      </div>
    );
  }

  const readingTime = Math.ceil(story.content.split(/\s+/).length / 200);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 md:p-8 max-w-4xl"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          {story.title}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <BiTime className="text-xl" />
            <span>{readingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <BiBookReader className="text-xl" />
            <span>{new Date(story.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {story.tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="badge badge-lg bg-cartoon-pink text-white shadow-cartoon-sm px-4 py-2"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cartoon-yellow/20 p-6 rounded-cartoon mb-8 border-2 border-black shadow-cartoon"
      >
        <p className="text-lg italic text-center">{story.summary}</p>
      </motion.div>

      {/* Share Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex justify-center mb-8"
      >
        <ShareButtons
          url={window.location.href}
          title={story.title}
          summary={story.summary}
        />
      </motion.div>

      <div className="divider"></div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="prose prose-lg max-w-none"
      >
        <TipTapEditor
          value={story.content}
          readOnly={true}
        />
      </motion.div>

      <div className="divider mt-12"></div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4"
      >
        <button
          className="btn btn-secondary rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
          onClick={() => navigate("/blog")}
        >
          <BsArrowLeft /> Back to Blog
        </button>

        {story.sharedOnMedium && (
          <div className="badge badge-lg bg-black text-white">
            Also on Medium
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StoryVisualizer;