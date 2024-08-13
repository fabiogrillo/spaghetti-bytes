import React from "react";
import { useNavigate } from "react-router-dom";
import { VscNewFile } from "react-icons/vsc";
import { IoIosSettings } from "react-icons/io";

const StoryManager = ({ username }) => {
  const navigate = useNavigate();

  const buttonData = [
    {
      label: "New Story",
      icon: <VscNewFile />,
      action: () => navigate("/editor"),
      description: "Create a new story",
      color: "btn-primary",
    },
    {
      label: "Manage Stories",
      icon: <IoIosSettings />,
      action: () => navigate("/storyTable"),
      description: "Manage your existing stories",
      color: "btn-secondary",
    },
    {
      label: "New Goal",
      icon: <VscNewFile />,
      action: () => navigate("/create-goal"),
      description: "Create a new goal",
      color: "btn-warning",
    },
    {
      label: "Manage Goals",
      icon: <IoIosSettings />,
      action: () => navigate("/goalsTable"),
      description: "Manage your existing goals",
      color: "btn-success",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            {username} 🍝, welcome to your stories manager
          </h1>
        </div>
        <div className="space-y-8 mx-4">
          {buttonData.map((button, index) => (
            <div key={index} className={`flex flex-col items-center `}>
              <button
                className={`btn rounded-3xl p-4 hover:-translate-y-1 hover:scale-110 ${button.color}`}
                onClick={button.action}
              >
                {button.label} {button.icon}
              </button>
              <p className="text-lg m-2">{button.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryManager;
