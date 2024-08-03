import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const GoalPublisher = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ description: "", completed: false }]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch the goal details to prefill the form
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
    const newSteps = steps.filter((_, stepIndex) => stepIndex !== index);
    setSteps(newSteps);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    }
  };

  return (
    <div className="container mx-auto my-12 p-8 rounded-xl bg-primary bg-opacity-35 ">
      <h1 className="text-4xl font-bold">
        {id ? "Edit Goal" : "Create a New Goal"}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="my-4">
          <label className="block text-lg font-medium">Title</label>
          <input
            type="text"
            name="title"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="my-4">
          <label className="block text-lg font-medium">Description</label>
          <textarea
            name="description"
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="my-4">
          <label className="block text-lg font-medium">Steps</label>
          {steps.map((step, index) => (
            <div key={index} className="my-2 flex items-center">
              <input
                type="text"
                name="description"
                className="input input-bordered w-full"
                placeholder={`Step ${index + 1}`}
                value={step.description}
                onChange={(e) => handleStepChange(index, e)}
                required
              />
              <label className="inline-flex items-center mt-2 ml-2">
                <input
                  type="checkbox"
                  name="completed"
                  className="form-checkbox"
                  checked={step.completed}
                  onChange={(e) => handleStepChange(index, e)}
                />
                <span className="ml-2">Completed</span>
              </label>
              <button
                className="btn btn-error btn-md ml-4 rounded-full text-xl"
                onClick={() => handleRemoveStep(index)}
              >
                X
              </button>
            </div>
          ))}
          <button
            className="btn btn-success btn-md rounded-full text-3xl"
            onClick={handleAddStep}
          >
            +
          </button>
        </div>
        <div className="my-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button type="submit" className="btn btn-primary">
              {id ? "Update Goal" : "Create Goal"}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  );
};

export default GoalPublisher;
