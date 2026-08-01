import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import ResponsiveTable from "../Components/ResponsiveTable";
import { motion } from "framer-motion";

const TableGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/goals");
      const data = await response.json();
      const goalsArray = data.goals || [];
      setGoals(goalsArray);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setGoals(goals.filter((goal) => goal._id !== id));
      } else {
        console.error("Error deleting goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const editGoal = (id) => {
    navigate(`/create-goal/${id}`);
  };

  // Define columns for ResponsiveTable
  const goalColumns = [
    { 
      key: "title", 
      label: "Goal",
      render: (goal) => (
        <span className="font-semibold">{goal.title}</span>
      )
    },
    { 
      key: "description", 
      label: "Description", 
      render: (goal) => (
        <span className="text-sm text-gray-600">
          {goal.description.length > 80 
            ? `${goal.description.slice(0, 80)}...` 
            : goal.description}
        </span>
      )
    },
    {
      key: "progress",
      label: "Progress",
      render: (goal) => {
        const completedSteps = goal.steps.filter(step => step.completed).length;
        const totalSteps = goal.steps.length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        
        return (
          <div className="flex items-center gap-2">
            <progress 
              className="progress progress-success w-24" 
              value={percentage} 
              max="100"
            ></progress>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
        );
      }
    },
    {
      key: "steps",
      label: "Steps",
      render: (goal) => {
        const completedSteps = goal.steps.filter(step => step.completed).length;
        const totalSteps = goal.steps.length;
        
        return (
          <span className="badge badge-primary">
            {completedSteps}/{totalSteps}
          </span>
        );
      }
    },
    { 
      key: "createdAt", 
      label: "Created", 
      render: (goal) => (
        <span className="text-sm">
          {new Date(goal.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Goal Manager</h1>
          <p className="py-2 md:text-base max-w-3xl mx-auto">
            Here you can do anything you want with your goals. Do you want to
            change something? Do you want to delete them because you don't like
            them anymore? Or do you simply want to see how many you have and
            when? Whatever you want to do here you have full control over all
            your goals. Enjoy!
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center mt-20">
            <span className="loading loading-infinity loading-lg text-warning"></span>
            <p className="mt-4 text-lg">Loading goals...</p>
          </div>
        ) : (
          <div className="w-full">
            <ResponsiveTable
              data={goals}
              columns={goalColumns}
              onEdit={editGoal}
              onDelete={deleteGoal}
              title=""
              colorScheme="warning"
            />
          </div>
        )}

        <div className="flex items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn btn-primary rounded-soft shadow-soft hover:shadow-soft-lg"
            onClick={() => navigate("/manager")}
          >
            <BsArrowLeft /> Back to Manager
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TableGoals;