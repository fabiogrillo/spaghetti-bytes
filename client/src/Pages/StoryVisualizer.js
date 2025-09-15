import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TipTapEditor from "../Components/TipTapEditor";
import { BsArrowLeft } from "react-icons/bs";
import { BiTime, BiBookReader } from "react-icons/bi";
import { motion } from "framer-motion";
import ShareButtons from "../Components/ShareButtons";
import NewsletterWidget from "../Components/NewsletterWidget";
import ArticleReactions from '../Components/ArticleReactions';
import CommentSection from "../Components/CommentSection";
import BookmarkButton from "../Components/BookmarkButton";
import ReadingProgress from "../Components/ReadingProgress";

const StoryVisualizer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentRef, setContentRef] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const handleProgressChange = useCallback((progress) => {
    setReadingProgress(progress);
  }, []);

  useEffect(() => {
    // Scroll to top when story changes
    window.scrollTo(0, 0);
    
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
    <>
      <ReadingProgress 
        contentRef={{ current: contentRef }} 
        onProgressChange={handleProgressChange}
      />

      {/* Main Content */}
      <motion.div
        ref={(el) => setContentRef(el)}
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

        {/* Share & Bookmark Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <ShareButtons
            url={window.location.href}
            title={story.title}
            summary={story.summary}
          />
          <BookmarkButton storyId={storyId} />
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

        {/* Reactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mt-8 mb-8"
        >
          <ArticleReactions articleId={storyId} compact={true} />
        </motion.div>

        {/* Divider before Comments */}
        <div className="divider mt-16 mb-8">
          <span className="text-gray-400">💬</span>
        </div>

        {/* Comments Section - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CommentSection storyId={story._id} />
        </motion.div>

        {/* Newsletter Widget */}
        <div className="my-12">
          <NewsletterWidget source="article" variant="inline" />
        </div>

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

      {/* Scroll to Top Button - appears when scrolled down */}
      {readingProgress > 20 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 btn btn-circle bg-cartoon-purple text-white shadow-cartoon hover:shadow-cartoon-hover z-40"
        >
          ↑
        </motion.button>
      )}
    </>
  );
};

export default StoryVisualizer;