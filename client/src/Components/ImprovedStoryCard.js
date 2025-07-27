import React from "react";
import { useNavigate } from "react-router-dom";
import { GoBook } from "react-icons/go";
import { BiTime } from "react-icons/bi";
import { motion } from "framer-motion";

const ImprovedStoryCard = ({ story, index }) => {
  const navigate = useNavigate();

  // Calculate if the story is new (written in the last two weeks)
  const isNew = new Date() - new Date(story.createdAt) < 14 * 24 * 60 * 60 * 1000;

  // Cartoon color palette rotation
  const colorSchemes = [
    { bg: 'bg-cartoon-pink', text: 'text-white', border: 'border-cartoon-pink' },
    { bg: 'bg-cartoon-blue', text: 'text-white', border: 'border-cartoon-blue' },
    { bg: 'bg-cartoon-yellow', text: 'text-black', border: 'border-cartoon-yellow' },
    { bg: 'bg-cartoon-purple', text: 'text-white', border: 'border-cartoon-purple' },
    { bg: 'bg-cartoon-orange', text: 'text-white', border: 'border-cartoon-orange' },
  ];

  const colorScheme = colorSchemes[index % colorSchemes.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      {isNew && (
        <div className="absolute -top-3 -right-3 z-10">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-cartoon-yellow text-black px-3 py-1 rounded-cartoon text-sm font-bold shadow-cartoon-sm border-2 border-black"
          >
            NEW! ✨
          </motion.div>
        </div>
      )}

      <div
        className={`
          h-full p-6 rounded-cartoon cursor-pointer
          bg-white border-2 border-black shadow-cartoon
          hover:shadow-cartoon-hover transform transition-all duration-200
          hover:translate-x-1 hover:translate-y-1
          flex flex-col justify-between
        `}
        onClick={() => navigate(`/visualizer/${story._id}`)}
      >
        {/* Title Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">{story.title}</h2>
          <p className="text-gray-600 line-clamp-3">{story.summary}</p>
        </div>

        {/* Tags Section */}
        <div className="flex flex-wrap gap-2 my-4">
          {story.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tag}
              className={`
                px-3 py-1 rounded-cartoon text-xs font-bold
                ${colorScheme.bg} ${colorScheme.text}
                shadow-cartoon-sm border border-black
                group-hover:animate-wiggle
              `}
              style={{ animationDelay: `${tagIndex * 100}ms` }}
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
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BiTime />
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                btn btn-sm rounded-cartoon
                ${colorScheme.bg} ${colorScheme.text}
                shadow-cartoon-sm hover:shadow-cartoon
                border-2 border-black
              `}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/visualizer/${story._id}`);
              }}
            >
              <GoBook className="text-lg mr-1" />
              Read
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImprovedStoryCard;