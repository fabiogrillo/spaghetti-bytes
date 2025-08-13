import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiBookAdd, BiTargetLock, BiEnvelope, BiBarChart, BiBook, BiTrophy, BiMessageSquareDetail } from "react-icons/bi";

const Manager = ({ username, isAuthenticated }) => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "📚 Stories Management",
      description: "Create and manage your blog content",
      color: "from-cartoon-pink/20 to-cartoon-purple/20",
      borderColor: "border-cartoon-pink",
      buttons: [
        {
          label: "Write New Story",
          icon: <BiBookAdd size={24} />,
          action: () => navigate("/editor"),
          description: "Create a new masterpiece",
          color: "bg-cartoon-pink hover:bg-cartoon-pink/90",
          emoji: "✍️",
        },
        {
          label: "Manage Stories",
          icon: <BiBook size={24} />,
          action: () => navigate("/storyTable"),
          description: "Edit your existing stories",
          color: "bg-cartoon-blue hover:bg-cartoon-blue/90",
          emoji: "📝",
        },
      ]
    },
    {
      title: "🎯 Goals Management",
      description: "Set and track your achievements",
      color: "from-cartoon-yellow/20 to-cartoon-orange/20",
      borderColor: "border-cartoon-yellow",
      buttons: [
        {
          label: "Create New Goal",
          icon: <BiTargetLock size={24} />,
          action: () => navigate("/create-goal"),
          description: "Set a new achievement",
          color: "bg-cartoon-yellow hover:bg-cartoon-yellow/90",
          emoji: "🎯",
        },
        {
          label: "Manage Goals",
          icon: <BiTrophy size={24} />,
          action: () => navigate("/goalsTable"),
          description: "Track your progress",
          color: "bg-cartoon-purple hover:bg-cartoon-purple/90",
          emoji: "📊",
        },
      ]
    },
    {
      title: "💌 Communication & Analytics",
      description: "Engage with your audience",
      color: "from-cartoon-blue/20 to-cartoon-blue-dark/20",
      borderColor: "border-cartoon-blue",
      buttons: [
        {
          label: "Conversations",
          icon: <BiMessageSquareDetail size={24} />,
          action: () => navigate("/conversations"),
          description: "Manage inbox & replies",
          color: "bg-cartoon-blue-dark hover:bg-cartoon-blue-dark/90",
          emoji: "💬",
        },
        {
          label: "Email Campaigns",
          icon: <BiEnvelope size={24} />,
          action: () => navigate("/newsletter/campaigns"),
          description: "Create newsletters",
          color: "bg-cartoon-orange hover:bg-cartoon-orange/90",
          emoji: "📧",
        },
        {
          label: "Analytics",
          icon: <BiBarChart size={24} />,
          action: () => navigate("/newsletter/analytics"),
          description: "View statistics",
          color: "bg-cartoon-green hover:bg-cartoon-green/90",
          emoji: "📈",
        },
      ]
    }
  ];

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

  return (
    <div className="min-h-screen py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome back, <span className="text-cartoon-pink">{username}</span>! 🍝
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
          Your creative kitchen awaits! What amazing content shall we cook up today?
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            variants={sectionVariants}
            className={`bg-gradient-to-br ${section.color} rounded-cartoon border-2 ${section.borderColor} shadow-cartoon p-6 md:p-8`}
          >
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{section.description}</p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${section.buttons.length === 2 ? '2' : '3'} gap-4`}>
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

          {isAuthenticated && username === 'admin' && (
            <a href="/moderate-comments" className="btn btn-sm bg-cartoon-purple text-white ml-2">Moderazione Commenti</a>
          )}
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
