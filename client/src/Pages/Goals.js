import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiTargetLock, BiTime, BiCheckCircle, BiCircle, BiChevronDown, BiChevronUp, BiTrophy } from "react-icons/bi";
import { FaFire } from "react-icons/fa";
import SEO from "../Components/SEO";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState({});
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals");
        const data = await response.json();
        const goalsArray = data.goals || [];
        setGoals(goalsArray);

        // Auto-expand current year
        setExpandedYears({ [currentYear]: true });
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [currentYear]);

  // Group goals by year
  const groupByYear = (goals) => {
    return goals.reduce((acc, goal) => {
      const year = new Date(goal.createdAt).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(goal);
      return acc;
    }, {});
  };

  const goalsByYear = groupByYear(goals);
  const years = Object.keys(goalsByYear).sort((a, b) => b - a); // Descending order

  // Calculate year stats
  const getYearStats = (yearGoals) => {
    const totalGoals = yearGoals.length;
    const completedGoals = yearGoals.filter(goal => {
      const completed = goal.steps.filter(s => s.completed).length;
      return completed === goal.steps.length && goal.steps.length > 0;
    }).length;
    const totalSteps = yearGoals.reduce((acc, g) => acc + g.steps.length, 0);
    const completedSteps = yearGoals.reduce((acc, g) => acc + g.steps.filter(s => s.completed).length, 0);
    const isYearComplete = completedGoals === totalGoals && totalGoals > 0;

    return { totalGoals, completedGoals, totalSteps, completedSteps, isYearComplete };
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "from-green-400 to-green-600";
    if (percentage >= 50) return "from-yellow-400 to-yellow-600";
    if (percentage >= 25) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const GoalCard = ({ goal, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const completedSteps = goal.steps.filter(step => step.completed).length;
    const totalSteps = goal.steps.length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const progressColor = getProgressColor(percentage);

    const cardColors = ['error', 'primary', 'warning', 'secondary', 'accent'];
    const cardColor = cardColors[index % cardColors.length];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="bg-base-100/95 backdrop-blur-sm rounded-soft shadow-soft-lg border border-base-300 hover:shadow-soft-hover transition-all duration-300 flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-base-300 p-6 rounded-t-soft">
            <div className="flex items-start justify-between mb-2">
              <BiTargetLock className={`text-3xl text-${cardColor}`} />
              <motion.div
                className={`badge badge-lg bg-${cardColor}/20 text-${cardColor} font-bold`}
                whileHover={{ scale: 1.05 }}
              >
                {percentage}%
              </motion.div>
            </div>
            <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
            <p className="text-sm opacity-80">{goal.description}</p>
          </div>

          {/* Progress Section */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Progress</span>
                <span className="text-sm opacity-70">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden shadow-soft">
                <motion.div
                  className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Steps - Collapsible */}
            <div className="space-y-3 flex-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-all duration-300"
              >
                <h4 className="font-semibold text-sm uppercase tracking-wide">
                  Milestones ({completedSteps}/{totalSteps})
                </h4>
                {isExpanded ? (
                  <BiChevronUp className="text-xl" />
                ) : (
                  <BiChevronDown className="text-xl" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {goal.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                          ${step.completed
                            ? 'bg-success/10 border-l-4 border-l-success'
                            : 'bg-base-200 hover:bg-base-300'
                          }
                        `}
                      >
                        {step.completed ? (
                          <BiCheckCircle className="text-xl flex-shrink-0 text-success" />
                        ) : (
                          <BiCircle className="text-xl flex-shrink-0 opacity-50" />
                        )}
                        <span className={`text-sm ${step.completed ? 'line-through opacity-70' : ''}`}>
                          {step.description}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-auto border-t border-base-300">
              <div className="flex items-center gap-2 text-sm opacity-70">
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

  const YearSection = ({ year, yearGoals, index }) => {
    const isExpanded = expandedYears[year];
    const stats = getYearStats(yearGoals);
    const isCurrentYear = parseInt(year) === currentYear;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="mb-8"
      >
        {/* Year Header */}
        <button
          onClick={() => toggleYear(year)}
          className={`
            w-full flex items-center justify-between p-6 rounded-soft
            bg-base-100/95 backdrop-blur-sm shadow-soft-lg border border-base-300
            hover:shadow-soft-hover transition-all duration-300
            ${isCurrentYear ? 'border-l-4 border-l-primary' : ''}
          `}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold gradient-text">{year}</span>
            {stats.isYearComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-lg bg-success text-white gap-1"
              >
                <BiTrophy /> Year Complete!
              </motion.div>
            )}
            {isCurrentYear && !stats.isYearComplete && (
              <span className="badge badge-primary badge-outline">Current Year</span>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Year Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <BiTargetLock className="text-primary" />
                <strong>{stats.completedGoals}</strong>/{stats.totalGoals} goals
              </span>
              <span className="flex items-center gap-1">
                <BiCheckCircle className="text-success" />
                <strong>{stats.completedSteps}</strong>/{stats.totalSteps} steps
              </span>
            </div>

            {isExpanded ? (
              <BiChevronUp className="text-2xl" />
            ) : (
              <BiChevronDown className="text-2xl" />
            )}
          </div>
        </button>

        {/* Year Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Mobile Stats */}
              <div className="md:hidden flex justify-center gap-4 py-4 text-sm">
                <span className="flex items-center gap-1">
                  <BiTargetLock className="text-primary" />
                  <strong>{stats.completedGoals}</strong>/{stats.totalGoals} goals
                </span>
                <span className="flex items-center gap-1">
                  <BiCheckCircle className="text-success" />
                  <strong>{stats.completedSteps}</strong>/{stats.totalSteps} steps
                </span>
              </div>

              {/* Goals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {yearGoals.map((goal, goalIndex) => (
                  <GoalCard key={goal._id} goal={goal} index={goalIndex} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Calculate overall stats
  const overallStats = goals.length > 0 ? {
    totalGoals: goals.length,
    completedSteps: goals.reduce((acc, g) => acc + g.steps.filter(s => s.completed).length, 0),
    totalSteps: goals.reduce((acc, g) => acc + g.steps.length, 0)
  } : null;

  return (
    <div className="container mx-auto p-8">
      <SEO
        title="Goals"
        description="Follow my professional journey and personal milestones. Transparent tracking of learning goals, projects, and career objectives in software engineering."
      />
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
          <span className="badge badge-lg bg-warning text-black shadow-soft px-6 py-3">
            <FaFire className="mr-2" /> My Journey Tracker
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Personal <span className="gradient-text">Goals</span> & Milestones
        </h1>

        <p className="text-lg md:text-xl max-w-3xl text-gray dark:text-gray">
          Transparency is key! Here's where I'm headed, what I'm learning,
          and how I'm progressing. No smoke and mirrors, just real goals
          with real progress tracking.
        </p>
      </motion.div>

      {/* Overall Summary Stats */}
      {!loading && overallStats && (
        <motion.div
          className="mb-12 p-8 bg-base-100/95 backdrop-blur-sm rounded-soft shadow-soft-lg border border-base-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              Overall Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-base-200 rounded-soft">
                <p className="text-4xl font-bold text-primary mb-2">{overallStats.totalGoals}</p>
                <p className="text-sm font-semibold opacity-70">Total Goals</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-base-200 rounded-soft">
                <p className="text-4xl font-bold text-success mb-2">{overallStats.completedSteps}</p>
                <p className="text-sm font-semibold opacity-70">Completed Steps</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-base-200 rounded-soft">
                <p className="text-4xl font-bold text-accent mb-2">{years.length}</p>
                <p className="text-sm font-semibold opacity-70">Years Tracked</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals by Year */}
      {loading ? (
        <div className="flex flex-col items-center mt-20">
          <span className="loading loading-spinner loading-lg text-warning"></span>
          <p className="mt-4 text-lg">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-2xl text-gray-500">No goals yet!</p>
          <p className="mt-4 flex items-center gap-2 justify-center">
            <BiTargetLock className="text-2xl text-error" />
            Time to set some ambitious targets!
          </p>
        </motion.div>
      ) : (
        <div>
          {years.map((year, index) => (
            <YearSection
              key={year}
              year={year}
              yearGoals={goalsByYear[year]}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
