import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BiTargetLock, BiTime, BiCheckCircle, BiCircle } from "react-icons/bi";
import { FaFire } from "react-icons/fa";
import illustration from "../Assets/Images/twinkle-online-education.gif";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals");
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
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
    const completedSteps = goal.steps.filter(step => step.completed).length;
    const totalSteps = goal.steps.length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const progressColor = getProgressColor(percentage);
    
    // Rotate colors for variety
    const cardColors = ['cartoon-pink', 'cartoon-blue', 'cartoon-yellow', 'cartoon-purple', 'cartoon-orange'];
    const cardColor = cardColors[index % cardColors.length];

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transform transition-all h-full flex flex-col">
          {/* Header */}
          <div className={`bg-${cardColor} text-white p-6 rounded-t-cartoon`}>
            <div className="flex items-start justify-between mb-2">
              <BiTargetLock className="text-3xl" />
              <motion.div 
                className="badge badge-lg bg-white/20 backdrop-blur"
                whileHover={{ scale: 1.1 }}
              >
                {percentage}%
              </motion.div>
            </div>
            <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
            <p className="text-sm opacity-90">{goal.description}</p>
          </div>

          {/* Progress Section */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 flex-1">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Milestones:
              </h4>
              <div className="space-y-2">
                {goal.steps.map((step, stepIndex) => (
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + stepIndex * 0.05 }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all
                      ${step.completed 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}
                  >
                    {step.completed ? (
                      <BiCheckCircle className="text-xl flex-shrink-0" />
                    ) : (
                      <BiCircle className="text-xl flex-shrink-0" />
                    )}
                    <span className={`text-sm ${step.completed ? 'line-through' : ''}`}>
                      {step.description}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <BiTime />
                <span>Started {new Date(goal.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto p-8">
      {/* Header Section */}
      <motion.div 
        className="flex flex-col items-center text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="inline-block mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-cartoon-yellow text-black shadow-cartoon-sm px-6 py-3">
            <FaFire className="mr-2" /> My Journey Tracker
          </span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Personal <span className="gradient-text">Goals</span> & Milestones
        </h1>
        
        <p className="text-lg md:text-xl max-w-3xl text-gray-600 dark:text-gray-300">
          Transparency is key! Here's where I'm headed, what I'm learning, 
          and how I'm progressing. No smoke and mirrors, just real goals 
          with real progress tracking.
        </p>

        <div className="mt-8">
          <img
            src={illustration}
            alt="Goals Illustration"
            className="w-full max-w-sm md:max-w-md mx-auto"
          />
          <p className="text-xs text-center mt-2">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/56v7RIkExgol" className="underline">
              Anna Żołnierowicz
            </a>
          </p>
        </div>
      </motion.div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex flex-col items-center mt-20">
          <span className="loading loading-spinner loading-lg text-cartoon-yellow"></span>
          <p className="mt-4 text-lg">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-2xl text-gray-500">No goals yet!</p>
          <p className="mt-4">Time to set some ambitious targets! 🎯</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal, index) => (
            <GoalCard key={goal._id} goal={goal} index={index} />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {goals.length > 0 && (
        <motion.div 
          className="mt-12 p-8 bg-gradient-to-br from-cartoon-pink to-cartoon-purple text-white rounded-cartoon shadow-cartoon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Overall Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-4xl font-bold">{goals.length}</p>
                <p className="text-sm opacity-90">Active Goals</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  {goals.reduce((acc, goal) => 
                    acc + goal.steps.filter(s => s.completed).length, 0
                  )}
                </p>
                <p className="text-sm opacity-90">Completed Steps</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  {goals.reduce((acc, goal) => acc + goal.steps.length, 0)}
                </p>
                <p className="text-sm opacity-90">Total Steps</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Goals;