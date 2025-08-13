// client/src/Pages/Manager.js
// Redesigned with better organization and UI
import { motion } from "framer-motion";
import {
  BiPlus, BiEdit, BiStats, BiTargetLock,
  BiCommentCheck, BiConversation, BiUser
} from "react-icons/bi";
import {
  FaNewspaper, FaBullseye,
  FaComments, FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Manager = ({ username = 'admin', isAuthenticated = false }) => {
  const navigate = useNavigate();

  // Redirect if not admin
  if (!isAuthenticated || username !== 'admin') {
    navigate('/login');
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  const sections = [
    {
      title: "📝 Content Management",
      description: "Create and manage your blog posts",
      gridCols: 3,
      buttons: [
        {
          label: "New Story",
          description: "Write a new blog post",
          icon: <BiPlus size={24} />,
          emoji: "✍️",
          color: "bg-gradient-to-br from-cartoon-pink to-pink-600",
          action: () => navigate("/editor")
        },
        {
          label: "Edit Stories",
          description: "Manage existing posts",
          icon: <BiEdit size={24} />,
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
          description: "Chat messages from visitors",
          icon: <BiConversation size={24} />,
          emoji: "💌",
          color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
          action: () => navigate("/conversations")
        },
        {
          label: "Newsletter",
          description: "Subscriber management",
          icon: <FaEnvelope size={24} />,
          emoji: "📮",
          color: "bg-gradient-to-br from-red-500 to-red-700",
          action: () => navigate("/newsletter/campaigns")
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cartoon-pink via-cartoon-purple to-cartoon-blue bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome back, <span className="font-semibold text-cartoon-purple">{username}</span>!
            Ready to create something amazing today?
          </p>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Posts", value: "42", icon: <FaNewspaper />, color: "text-cartoon-pink" },
            { label: "Comments", value: "128", icon: <FaComments />, color: "text-cartoon-blue" },
            { label: "Goals", value: "8", icon: <FaBullseye />, color: "text-cartoon-yellow" },
            { label: "Visitors", value: "1.2k", icon: <BiUser />, color: "text-cartoon-purple" }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-4 text-center">
              <div className={`text-3xl ${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            variants={sectionVariants}
            className="mb-8"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
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