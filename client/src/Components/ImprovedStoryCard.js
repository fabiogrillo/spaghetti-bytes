import React from "react";
import { useNavigate } from "react-router-dom";
import { GoBook } from "react-icons/go";
import { BiTime } from "react-icons/bi";
import { motion } from "framer-motion";
import BookmarkButton from "./BookmarkButton";
import { minimal } from "../utils/minimalAnimations";

const ImprovedStoryCard = ({ story, index }) => {
  const navigate = useNavigate();

  // Calculate if the story is new (written in the last two weeks)
  const isNew = new Date() - new Date(story.createdAt) < 14 * 24 * 60 * 60 * 1000;

  // Cartoon color palette rotation
  const colorSchemes = [
    { bg: 'bg-error', text: 'text-white', border: 'border-error' },
    { bg: 'bg-primary', text: 'text-white', border: 'border-primary' },
    { bg: 'bg-warning', text: 'text-black', border: 'border-warning' },
    { bg: 'bg-secondary', text: 'text-white', border: 'border-secondary' },
    { bg: 'bg-accent', text: 'text-white', border: 'border-accent' },
  ];

  const colorScheme = colorSchemes[index % colorSchemes.length];

  return (
    <motion.div
      whileHover={minimal.hover}
      className="relative group"
    >
      {isNew && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-warning text-black px-3 py-1 rounded-soft text-sm font-bold shadow-soft border border-base-300">
            NEW
          </div>
        </div>
      )}

      <div
        className={`
          h-full p-6 rounded-soft cursor-pointer
          bg-white border border-base-300 shadow-soft-lg
          hover:shadow-soft-hover transform transition-all duration-200
          hover:translate-x-1 hover:translate-y-1
          flex flex-col justify-between
        `}
        onClick={() => navigate(`/visualizer/${story._id}`)}
      >
        {/* Title Section */}
        <div className="mb-4">
          <h2 className="text-xl text-black font-bold mb-2 line-clamp-2">{story.title}</h2>
          <p className="text-gray-600 line-clamp-3">{story.summary}</p>
        </div>

        {/* Tags Section */}
        <div className="flex flex-wrap gap-2 my-4">
          {story.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tag}
              className={`
                px-3 py-1 rounded-soft text-xs font-bold
                ${colorScheme.bg} ${colorScheme.text}
                shadow-soft border border-black
              `}
            >
              #{tag}
            </span>
          ))}
          {story.tags.length > 3 && (
            <span className="px-3 py-1 text-xs text-gray-500">
              +{story.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <BiTime />
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <BookmarkButton storyId={story._id} variant="compact" />
            </div>
          </div>
          <motion.button
            whileHover={minimal.hover}
            whileTap={minimal.tap}
            className={`
              btn btn-sm rounded-soft w-full
              ${colorScheme.bg} ${colorScheme.text}
              shadow-soft hover:shadow-soft-lg
              border border-base-300
            `}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/visualizer/${story._id}`);
            }}
          >
            <GoBook className="text-lg mr-1" />
            Read Story
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImprovedStoryCard;