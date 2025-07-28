import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsCheck2All, BsPlus, BsArrowLeft } from "react-icons/bs";
import { BiTargetLock, BiTask, BiTrash } from "react-icons/bi";
import { FaFire } from "react-icons/fa";

const GoalPublisher = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ description: "", completed: false }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchGoal = async () => {
        try {
          const response = await fetch(`/api/goals/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch goal");
          }
          const data = await response.json();
          setTitle(data.title);
          setDescription(data.description);
          setSteps(data.steps);
        } catch (error) {
          console.error("Error fetching goal:", error);
        }
      };
      fetchGoal();
    }
  }, [id]);

  const handleStepChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    const newSteps = steps.map((step, stepIndex) => {
      if (index !== stepIndex) return step;
      return {
        ...step,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: "", completed: false }]);
  };

  const handleRemoveStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, stepIndex) => stepIndex !== index);
      setSteps(newSteps);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/goals/${id}` : "/api/goals";
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, steps }),
      });
      if (response.ok) {
        navigate("/goalsTable");
      } else {
        console.error("Failed to save goal");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const completed = steps.filter(s => s.completed).length;
    return steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-8"
      >
        <motion.div
          className="inline-block"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-cartoon-yellow text-black shadow-cartoon-sm px-6 py-3">
            <BiTargetLock className="mr-2" size={20} />
            {id ? "Edit Your Goal" : "Set New Goal"}
          </span>
        </motion.div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {id ? "Refine Your" : "Create a New"} <span className="gradient-text-fixed">Goal</span>
          </h1>
          <p className="py-2 md:text-base max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            {id
              ? "Fine-tune your goal details and track your progress. Every step counts! 📈"
              : "Transform your dreams into achievable milestones. Start with a clear vision! 🚀"}
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-2xl mx-auto mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Preview */}
          {id && (
            <motion.div 
              className="bg-gradient-to-br from-cartoon-purple/20 to-cartoon-pink/20 p-6 rounded-cartoon border-2 border-black shadow-cartoon"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Current Progress</h3>
                <span className="text-2xl font-bold text-cartoon-purple">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cartoon-purple to-cartoon-pink rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>
          )}

          {/* Title Input */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transition-all"
          >
            <label className="block font-bold text-lg mb-3 flex items-center gap-2">
              <FaFire className="text-cartoon-orange" />
              Goal Title
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full rounded-cartoon text-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master React in 30 Days"
              required
            />
          </motion.div>

          {/* Description Input */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transition-all"
          >
            <label className="block font-bold text-lg mb-3">Description</label>
            <textarea
              name="description"
              className="textarea textarea-bordered w-full rounded-cartoon"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal and why it matters to you..."
              rows="4"
              required
            />
          </motion.div>

          {/* Steps Section */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black"
          >
            <label className="block font-bold text-lg mb-4 flex items-center gap-2">
              <BiTask className="text-cartoon-blue" />
              Action Steps
            </label>
            
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-cartoon">
                      <input
                        type="checkbox"
                        name="completed"
                        className="checkbox checkbox-primary"
                        checked={step.completed}
                        onChange={(e) => handleStepChange(index, e)}
                      />
                      <input
                        type="text"
                        name="description"
                        className="input input-ghost flex-1 bg-transparent"
                        placeholder={`Step ${index + 1}: What needs to be done?`}
                        value={step.description}
                        onChange={(e) => handleStepChange(index, e)}
                        required
                      />
                    </div>
                    {steps.length > 1 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn btn-circle btn-sm btn-error shadow-cartoon-sm"
                        onClick={() => handleRemoveStep(index)}
                      >
                        <BiTrash />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-sm rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon mt-4"
              onClick={handleAddStep}
            >
              <BsPlus size={20} /> Add Step
            </motion.button>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
              onClick={() => navigate("/manager")}
            >
              <BsArrowLeft /> Back
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-success rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <BsCheck2All size={20} />
                  {id ? "Update Goal" : "Create Goal"}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GoalPublisher;