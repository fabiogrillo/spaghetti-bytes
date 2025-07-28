import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoIosSettings } from "react-icons/io";
import { FaRocket } from "react-icons/fa";
import { BiBookAdd, BiTargetLock } from "react-icons/bi";

const StoryManager = ({ username }) => {
  const navigate = useNavigate();

  const buttonData = [
    {
      label: "New Story",
      icon: <BiBookAdd size={28} />,
      action: () => navigate("/editor"),
      description: "Create a new masterpiece",
      color: "bg-cartoon-pink",
      emoji: "✍️",
    },
    {
      label: "Manage Stories",
      icon: <IoIosSettings size={28} />,
      action: () => navigate("/storyTable"),
      description: "Edit your existing stories",
      color: "bg-cartoon-blue",
      emoji: "📚",
    },
    {
      label: "New Goal",
      icon: <BiTargetLock size={28} />,
      action: () => navigate("/create-goal"),
      description: "Set a new achievement",
      color: "bg-cartoon-yellow",
      emoji: "🎯",
    },
    {
      label: "Manage Goals",
      icon: <IoIosSettings size={28} />,
      action: () => navigate("/goalsTable"),
      description: "Track your progress",
      color: "bg-cartoon-purple",
      emoji: "📊",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <motion.div 
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="inline-block mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-cartoon-orange text-white shadow-cartoon-sm px-6 py-3">
            <FaRocket className="mr-2" /> Creator Dashboard
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Welcome back, <span className="gradient-text-fixed">{username}</span>! 🍝
        </h1>
        
        <p className="text-lg md:text-xl max-w-3xl text-gray-600 dark:text-gray-300 mb-12">
          Your creative kitchen awaits! What amazing content shall we cook up today?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {buttonData.map((button, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <button
                className={`
                  w-full p-8 rounded-cartoon shadow-cartoon border-2 border-black
                  hover:shadow-cartoon-hover transform transition-all 
                  hover:translate-x-1 hover:translate-y-1
                  ${button.color} text-white
                `}
                onClick={button.action}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl opacity-80">{button.emoji}</span>
                  <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                    {button.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{button.label}</h3>
                <p className="text-sm opacity-90">{button.description}</p>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div 
          className="mt-12 p-6 bg-gradient-to-br from-cartoon-pink/20 to-cartoon-purple/20 rounded-cartoon border-2 border-black shadow-cartoon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Quick Tip! 💡</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Remember to add engaging titles and summaries to your stories. 
            They're the first things readers see!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StoryManager;