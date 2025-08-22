// client/src/Pages/Manager.js
// Updated Manager component with real statistics

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEdit, FaBullseye, FaComments
} from "react-icons/fa";
import {
  BiMessageSquareAdd, BiCommentCheck,
  BiTargetLock, BiStats, BiPaperPlane
} from "react-icons/bi";
import StatsDisplay from "../Components/StatsDisplay";

const Manager = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Section configurations
  const sections = [
    {
      title: "✍️ Content Management",
      description: "Create and manage your blog content",
      gridCols: 3,
      buttons: [
        {
          label: "Write Story",
          description: "Create a new blog post",
          icon: <BiMessageSquareAdd size={24} />,
          emoji: "✍️",
          color: "bg-gradient-to-br from-cartoon-pink to-pink-600",
          action: () => navigate("/editor")
        },
        {
          label: "Manage Stories",
          description: "Edit or delete posts",
          icon: <FaEdit size={24} />,
          emoji: "📚",
          color: "bg-gradient-to-br from-cartoon-blue to-blue-600",
          action: () => navigate("/storyTable")
        },
        {
          label: "Moderate Comments",
          description: "Review and approve comments",
          icon: <BiCommentCheck size={24} />,
          emoji: "💬",
          color: "bg-gradient-to-br from-cartoon-purple to-purple-600",
          action: () => navigate("/moderate-comments")
        }
      ]
    },
    {
      title: "🎯 Goals & Planning",
      description: "Track your progress and achievements",
      gridCols: 2,
      buttons: [
        {
          label: "Create Goal",
          description: "Set new objectives",
          icon: <BiTargetLock size={24} />,
          emoji: "🎯",
          color: "bg-gradient-to-br from-cartoon-yellow to-yellow-600",
          action: () => navigate("/create-goal")
        },
        {
          label: "Manage Goals",
          description: "Track your progress",
          icon: <FaBullseye size={24} />,
          emoji: "📊",
          color: "bg-gradient-to-br from-cartoon-orange to-orange-600",
          action: () => navigate("/goalsTable")
        }
      ]
    },
    {
      title: "📊 Analytics & Communication",
      description: "Monitor performance and engage with readers",
      gridCols: 3,
      buttons: [
        {
          label: "Analytics",
          description: "View site statistics",
          icon: <BiStats size={24} />,
          emoji: "📈",
          color: "bg-gradient-to-br from-green-500 to-green-700",
          action: () => navigate("/newsletter/analytics")
        },
        {
          label: "Conversations",
          description: "Chat history & support",
          icon: <FaComments size={24} />,
          emoji: "💬",
          color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
          action: () => navigate("/conversations")
        },
        {
          label: "Newsletter",
          description: "Manage campaigns",
          icon: <BiPaperPlane size={24} />,
          emoji: "📧",
          color: "bg-gradient-to-br from-purple-500 to-purple-700",
          action: () => navigate("/newsletter/campaigns")
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={sectionVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cartoon-pink to-cartoon-purple bg-clip-text text-transparent">
            Content Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Ready to create something amazing today?
          </p>
        </motion.div>

        {/* Real Stats Component */}
        <StatsDisplay variant="grid" showAnimation={true} className="mb-8" />

        {/* Main Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            variants={sectionVariants}
            className="mb-8"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold dark:text-gray">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${section.gridCols === 2 ? '2' : '3'} gap-4`}>
              {section.buttons.map((button, buttonIndex) => (
                <motion.button
                  key={buttonIndex}
                  whileHover={{
                    scale: 1.02,
                    translateY: -2,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={button.action}
                  className={`
                    group relative overflow-hidden
                    ${button.color} text-white
                    p-6 rounded-cartoon shadow-lg
                    border-2 border-black/10
                    transition-all duration-300
                    hover:shadow-xl
                  `}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl opacity-80">{button.emoji}</span>
                      <div className="p-2 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                        {button.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-left">{button.label}</h3>
                    <p className="text-sm opacity-90 text-left">{button.description}</p>
                  </div>

                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Quick Stats Card */}
        <motion.div
          variants={sectionVariants}
          className="mt-12 p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-cartoon border-2 border-gray-300 dark:border-gray-600 shadow-cartoon"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> Pro Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cartoon-pink">•</span>
              <p className="text-gray-700 dark:text-gray-300">
                Use engaging titles to capture readers' attention from the first glance
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cartoon-yellow">•</span>
              <p className="text-gray-700 dark:text-gray-300">
                Add relevant tags to help readers discover your amazing content
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cartoon-blue">•</span>
              <p className="text-gray-700 dark:text-gray-300">
                Check analytics regularly to understand what resonates with your audience
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Manager;