import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BiTargetLock, BiTime, BiCheckCircle, BiCircle } from "react-icons/bi";
import { FaFire } from "react-icons/fa";
import { api } from "../utils/fetchWrapper"; // Use the new fetch wrapper

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the new api wrapper
        const data = await api.get("/api/goals");

        console.log("Fetched goals:", data);

        // Ensure data is an array
        const goalsArray = Array.isArray(data) ? data : [];
        setGoals(goalsArray);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setError(error.message || "Failed to load goals. Please try again later.");
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "from-green-400 to-green-600";
    if (percentage >= 50) return "from-yellow-400 to-yellow-600";
    if (percentage >= 25) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const GoalCard = ({ goal, index }) => {
    const completedSteps = goal.steps ? goal.steps.filter(step => step.completed).length : 0;
    const totalSteps = goal.steps ? goal.steps.length : 0;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-cartoon shadow-cartoon border-2 border-black p-6 hover:shadow-cartoon-hover transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <BiTargetLock className="text-3xl text-cartoon-blue mr-3" />
            <h3 className="text-xl font-bold">{goal.title}</h3>
          </div>
          {percentage === 100 && (
            <FaFire className="text-2xl text-orange-500 animate-pulse" />
          )}
        </div>

        <p className="text-gray-600 mb-4">{goal.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        {goal.steps && goal.steps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Steps ({completedSteps}/{totalSteps})
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {goal.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-center text-sm">
                  {step.completed ? (
                    <BiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <BiCircle className="text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={step.completed ? "line-through text-gray-400" : ""}>
                    {step.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <BiTime className="mr-1" />
          <span>Created {new Date(goal.createdAt).toLocaleDateString()}</span>
        </div>
      </motion.div>
    );
  };

  // Error display
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-400 rounded-cartoon p-6 inline-block"
          >
            <p className="text-xl text-red-600 mb-2">😔 Oops! Something went wrong</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-cartoon-blue text-white rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon transition-all"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          My <span className="text-cartoon-purple">Goals</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track my progress and stay motivated on the journey to achieving these milestones.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center mt-20">
          <span className="loading loading-spinner loading-lg text-cartoon-purple"></span>
          <p className="mt-4 text-lg">Loading goals...</p>
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <GoalCard key={goal._id} goal={goal} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block"
          >
            <p className="text-2xl mb-4">🎯</p>
            <p className="text-xl text-gray-500">No goals set yet</p>
            <p className="text-md text-gray-400 mt-2">
              Check back later for new goals!
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;