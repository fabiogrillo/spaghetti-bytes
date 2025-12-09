import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TipTapEditor from "../Components/TipTapEditor";
import { BsArrowLeft } from "react-icons/bs";
import { BiTime, BiBookReader } from "react-icons/bi";
import { motion } from "framer-motion";
import ShareButtons from "../Components/ShareButtons";
import CommentSection from "../Components/CommentSection";
import BookmarkButton from "../Components/BookmarkButton";
import ReadingProgress from "../Components/ReadingProgress";
import LikeButton from "../Components/LikeButton";
import DonationButton from "../Components/DonationButton";

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
        <span className="loading loading-infinity loading-lg text-error"></span>
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
          className="btn btn-primary mt-6 rounded-soft"
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
                className="badge badge-lg bg-error text-white shadow-soft px-4 py-2"
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
          className="border-l-4 border-primary pl-6 py-4 mb-8"
        >
          <p className="text-lg text-base-content/80 leading-relaxed italic">{story.summary}</p>
        </motion.div>

        <div className="divider"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-base prose-p:leading-relaxed prose-p:my-6
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-base-content prose-strong:font-semibold
            prose-code:bg-base-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-base-200 prose-pre:border prose-pre:border-base-300
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:italic
            prose-img:rounded-lg prose-img:shadow-soft-lg
            dark:prose-invert"
        >
          <TipTapEditor
            value={story.content}
            readOnly={true}
          />
        </motion.div>

        <div className="divider mt-12"></div>

        {/* Like, Share & Bookmark Buttons - After Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-12"
        >
          <LikeButton storyId={storyId} />
          <ShareButtons
            url={window.location.href}
            title={story.title}
            summary={story.summary}
          />
          <BookmarkButton storyId={storyId} />
        </motion.div>

        {/* Donation CTA - Support the blog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-12"
        >
          <DonationButton variant="inline" compact={true} />
        </motion.div>

        {/* Divider before Comments */}
        <div className="divider mt-8 mb-8">
          <span className="text-gray-400">Comments</span>
        </div>

        {/* Comments Section - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CommentSection storyId={story._id} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4"
        >
          <button
            className="btn btn-secondary rounded-soft shadow-soft hover:shadow-soft-lg"
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
          className="fixed bottom-8 right-8 btn btn-circle bg-secondary text-white shadow-soft-lg hover:shadow-soft-hover z-40"
        >
          ↑
        </motion.button>
      )}
    </>
  );
};

export default StoryVisualizer;