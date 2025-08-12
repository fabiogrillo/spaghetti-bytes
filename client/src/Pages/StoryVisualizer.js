import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TipTapEditor from "../Components/TipTapEditor";
import { BsArrowLeft } from "react-icons/bs";
import { BiTime, BiBookReader } from "react-icons/bi";
import { motion } from "framer-motion";
import ShareButtons from "../Components/ShareButtons";
import NewsletterWidget from "../Components/NewsletterWidget";
import ArticleReactions from '../Components/ArticleReactions';
import CommentSection from "../Components/CommentSection";

const StoryVisualizer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

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

  // Calculate reading progress and remaining time
  useEffect(() => {
    if (!story) return;

    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = Math.min((scrollTop / documentHeight) * 100, 100);
      setReadingProgress(progress);

      // Calculate remaining reading time
      const wordsPerMinute = 200; // Average reading speed
      const totalWords = story.content.split(/\s+/).length;
      const totalReadingTime = Math.ceil(totalWords / wordsPerMinute);
      const remainingPercent = (100 - progress) / 100;
      const timeLeft = Math.ceil(totalReadingTime * remainingPercent);
      setRemainingTime(timeLeft);
    };

    // Add throttling for performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener);
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, [story]);

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
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-cartoon-pink to-cartoon-purple"
            style={{ width: `${readingProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Reading Stats Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Progress: <strong className="text-cartoon-pink">{Math.round(readingProgress)}%</strong>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {remainingTime > 0 ? (
                  <>Time left: <strong className="text-cartoon-purple">{remainingTime} min</strong></>
                ) : (
                  <strong className="text-cartoon-green">Completed!</strong>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <BiBookReader />
              <span>{readingTime} min total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Add padding top for fixed header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 md:p-8 max-w-4xl mt-12"
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