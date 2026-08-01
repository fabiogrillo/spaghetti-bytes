import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsCheck2All, BsPlus, BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { BiTargetLock, BiTask, BiTrash } from "react-icons/bi";
import { FaFire } from "react-icons/fa";

const GoalPublisher = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ description: "", completed: false }]);
  const [errors, setErrors] = useState({});
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

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!title) newErrors.title = "Title is required";
      if (!description) newErrors.description = "Description is required";
    } else if (step === 2) {
      const emptySteps = steps.filter(s => !s.description.trim());
      if (emptySteps.length > 0) newErrors.steps = "All steps must have a description";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
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

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <motion.div
          className="inline-block mb-4"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-warning text-black shadow-soft px-6 py-3">
            <BiTargetLock className="mr-2" size={20} />
            {id ? "Edit Your Goal" : "Set New Goal"}
          </span>
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {id ? "Refine Your" : "Create a New"} <span className="gradient-text-fixed">Goal</span>
        </h1>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            1
          </div>
          <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            2
          </div>
          <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-base-300 text-base-content'}`}>
            3
          </div>
        </div>

        <p className="text-sm text-base-content/60">
          Step {currentStep} of 3: {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Action Steps" : "Review & Save"}
        </p>
      </motion.div>

      {/* Wizard Steps */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait" custom={currentStep}>
          {/* Step 1: Title & Description */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content flex items-center justify-center gap-2">
                <FaFire className="text-accent" />
                Basic Information
              </h2>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Goal Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Master React in 30 Days"
                  className="input input-bordered w-full rounded-soft text-lg"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                  }}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.title}</span>
                  </label>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Description</span>
                </label>
                <textarea
                  placeholder="Describe your goal and why it matters to you..."
                  className="textarea textarea-bordered w-full rounded-soft h-32"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, description: "" }));
                  }}
                />
                {errors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.description}</span>
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Action Steps */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content flex items-center justify-center gap-2">
                <BiTask className="text-primary" />
                Action Steps
              </h2>

              <p className="text-center text-base-content/60 text-sm">
                Break down your goal into actionable steps. You can add or remove steps as needed.
              </p>

              {errors.steps && (
                <div className="alert alert-error">
                  <span>{errors.steps}</span>
                </div>
              )}

              <div className="space-y-4">
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 flex items-center gap-3 p-3 bg-base-200 dark:bg-base-300 rounded-soft">
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
                        />
                      </div>
                      {steps.length > 1 && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-circle btn-sm btn-error shadow-soft"
                          onClick={() => handleRemoveStep(index)}
                        >
                          <BiTrash />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-sm rounded-soft shadow-soft hover:shadow-soft-lg w-full"
                onClick={handleAddStep}
              >
                <BsPlus size={20} /> Add Another Step
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="card bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 space-y-6"
            >
              <h2 className="text-2xl font-bold text-center text-base-content">Review Your Goal</h2>

              {/* Progress Preview (only for edit mode) */}
              {id && (
                <motion.div
                  className="bg-gradient-to-br from-secondary/20 to-error/20 p-6 rounded-soft border border-base-300 shadow-soft-lg"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-base-content">Current Progress</h3>
                    <span className="text-2xl font-bold text-secondary">{calculateProgress()}%</span>
                  </div>
                  <div className="w-full bg-base-300 dark:bg-base-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-secondary to-error rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Preview */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">GOAL TITLE</h3>
                  <p className="text-xl font-bold text-base-content">{title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-1">DESCRIPTION</h3>
                  <p className="text-base-content">{description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-base-content/60 mb-2">ACTION STEPS ({steps.length})</h3>
                  <ul className="space-y-2">
                    {steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-base-200 dark:bg-base-300 rounded-soft">
                        <div className={`checkbox checkbox-sm ${step.completed ? 'checkbox-primary' : ''}`}>
                          {step.completed && <span>✓</span>}
                        </div>
                        <span className={`flex-1 ${step.completed ? 'line-through opacity-60' : ''}`}>
                          {step.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {currentStep > 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-outline rounded-soft shadow-soft"
                onClick={handleBack}
              >
                <BsArrowLeft /> Back
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-outline rounded-soft shadow-soft"
                onClick={() => navigate("/manager")}
              >
                <BsArrowLeft /> Cancel
              </motion.button>
            )}
          </div>

          <div>
            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-primary rounded-soft shadow-soft-lg"
                onClick={handleNext}
              >
                Next <BsArrowRight />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="btn btn-success rounded-soft shadow-soft-lg text-white"
                onClick={handleSubmit}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalPublisher;
