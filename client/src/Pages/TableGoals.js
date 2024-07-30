import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import illustration1 from "../Assets/Images/sammy-woman-working-on-laptop-checking-her-workflow.gif";

const TableGoals = () => {
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const deleteGoal = async (id) => {
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

  return (
    <div className="container mx-auto p-4 mb-16 items-center mt-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Goal Manager</h1>
      <div className="flex justify-between items-center flex-row">
        <img
          src={illustration1}
          alt="Header Illustration"
          className="my-8 w-2/6"
        />
        <p className="w-3/5 p-4 text-lg">
          Here you can do anything you want with your goals. Do you want to
          change something? Do you want to delete them because you don't like
          them anymore? Or do you simply want to see how many you have and when?
          Whatever you want to do here you have full control over all your
          goals. Enjoy!
        </p>
      </div>
      <table className="table-auto table-zebra w-full mt-16 bg-secondary rounded-2xl bg-opacity-30">
        <thead>
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {goals.map((goal, index) => (
            <tr key={goal._id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{goal.title}</td>
              <td className="px-4 py-2">
                {goal.description.length > 50
                  ? `${goal.description.slice(0, 50)}...`
                  : goal.description}
              </td>
              <td className="px-4 py-2">
                {new Date(goal.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  className="btn btn-error btn-sm mr-2"
                  onClick={() => deleteGoal(goal._id)}
                >
                  Delete <FaTrashAlt />
                </button>
                <button
                  className="btn btn-warning btn-sm mr-2"
                  onClick={() => editGoal(goal._id)}
                >
                  Edit <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableGoals;
