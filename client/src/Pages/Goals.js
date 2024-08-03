import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import illustration from "../Assets/Images/twinkle-online-education.gif";

const Goals = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // Fetch goals from the server
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals");
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };
    fetchGoals();
  }, []);

  return (
    <div className="container mx-auto p-16 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center m-16 mb-32">
        <div className="md:w-3/5">
          <h1 className="text-4xl font-bold">My Personal Goals</h1>
          <p className="py-6 italic">
            Here you can view all my personal goals and the steps I am taking to
            achieve them. This helps me keep track of my progresses.
          </p>
        </div>
        <div className="md:w-2/5">
          <img
            src={illustration}
            alt="Illustration Blog"
            className="w-full max-w-md"
          />
          <p className="text-xs text-center mt-4 md:mt-0">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/56v7RIkExgol">
              Anna Żołnierowicz
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {goals.map((goal, index) => (
          <motion.div
            key={goal._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="timeline-item"
          >
            <h2 className="text-2xl font-bold">{goal.title}</h2>
            <p>{goal.description}</p>
            <p className="text-sm italic py-2">
              {format(new Date(goal.createdAt), "MMMM dd, yyyy")}
            </p>
            <ul className="steps mt-4">
              {goal.steps.map((step, index) => (
                <li
                  key={index}
                  className={`step ${step.completed ? "step-primary" : ""}`}
                >
                  {step.description}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Goals;
