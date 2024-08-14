import React, { useState, useEffect } from "react";
import illustration from "../Assets/Images/twinkle-online-education.gif";

const Goals = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Personal Goals</h1>
          <p className="py-2 md:text-base">
            I am excited to share with you all of my personal goals, as well as
            the detailed steps that I am currently undertaking to reach them.
            Documenting this process not only allows me to maintain a clear view
            of my progress, but also serves as a constant reminder of my
            dedication and commitment to personal growth and achievement.
          </p>
        </div>
        <div className="mb-8">
          <img
            src={illustration}
            alt="Illustration Goals"
            className="w-full max-w-sm md:max-w-lg"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/56v7RIkExgol">
              Anna Żołnierowicz
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal) => (
          <div key={goal._id} className="timeline-item p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold">{goal.title}</h2>
            <p>{goal.description}</p>
            <p className="text-sm italic py-2">
              {new Date(goal.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <ul className="steps mt-4">
              {goal.steps.map((step, index) => (
                <li
                  key={index}
                  className={`step ${step.completed ? "step-primary" : ""} text-sm`}
                >
                  {step.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;
