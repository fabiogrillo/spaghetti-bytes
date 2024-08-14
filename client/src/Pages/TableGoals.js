import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
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
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Goal Manager</h1>
          <p className="py-2 md:text-base">
            Here you can do anything you want with your goals. Do you want to
            change something? Do you want to delete them because you don't like
            them anymore? Or do you simply want to see how many you have and
            when? Whatever you want to do here you have full control over all
            your goals. Enjoy!
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="table-zebra bg-secondary rounded-2xl bg-opacity-50 w-full">
            <thead>
              <tr>
                <th className="px-2 md:px-4 py-2">#</th>
                <th className="px-2 md:px-4 py-2">Title</th>
                <th className="px-2 md:px-4 py-2">Description</th>
                <th className="px-2 md:px-4 py-2">Created At</th>
                <th className="px-2 md:px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {goals.map((goal, index) => (
                <tr key={goal._id} className="border-t">
                  <td className="px-2 md:px-4 py-2">{index + 1}</td>
                  <td className="px-2 md:px-4 py-2">{goal.title}</td>
                  <td className="px-2 md:px-4 py-22">
                    {goal.description.length > 50
                      ? `${goal.description.slice(0, 50)}...`
                      : goal.description}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    {new Date(goal.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    <button
                      className="btn btn-error btn-sm mr-2"
                      onClick={() => deleteGoal(goal._id)}
                    >
                      Delete <FaTrashAlt />
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
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

        <div className="flex items-center mt-8">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => navigate("/manager")}
          >
            <BsArrowLeft /> Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableGoals;
