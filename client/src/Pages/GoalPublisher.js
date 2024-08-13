import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsCheck2All, BsPlus } from "react-icons/bs";
import { BsArrowLeft } from "react-icons/bs";

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
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {id ? "Edit Goal" : "Create a New Goal"}
          </h1>
          <p className="py-2 md:text-base">
            {id
              ? "You are currently editing your goal. Please ensure all details are accurate, including the title, description, and steps. After making your changes, you can update the goal by clicking the button below"
              : "Start by choosing a title for your goal. Once the title is set, you can begin writing the description. Remember to include relevant steps. Once you're ready, click the create button"}
          </p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <label className="block font-mono">Title</label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full italic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your title here..."
              required
            />
          </div>
          <div className="my-4">
            <label className="block font-mono">Description</label>
            <textarea
              name="description"
              className="textarea textarea-bordered w-full italic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your description here..."
              required
            ></textarea>
          </div>
          <div>
            <label className="block font-mono">Steps</label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center mb-1">
                <input
                  type="text"
                  name="description"
                  className="input input-bordered w-full italic"
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
                  className="btn btn-error btn-sm ml-2 rounded-xl"
                  onClick={() => handleRemoveStep(index)}
                >
                  X
                </button>
              </div>
            ))}
            <div className="flex items-start">
              <button
                className="btn btn-primary btn-outline btn-sm rounded-full mt-2"
                onClick={handleAddStep}
              >
                <BsPlus /> Add Step
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-2xl"
              onClick={() => navigate("/manager")}
            >
              <BsArrowLeft /> Back
            </button>
            <button
              type="submit"
              className="btn btn-success btn-sm rounded-2xl"
            >
              <BsCheck2All /> {id ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalPublisher;
