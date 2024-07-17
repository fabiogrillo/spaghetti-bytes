import React from "react";
import { useNavigate } from "react-router-dom";
import { VscNewFile } from "react-icons/vsc";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { motion } from "framer-motion";

const StoryManager = ({ username }) => {
  const navigate = useNavigate();

  const buttonData = [
    {
      label: "New",
      icon: <VscNewFile />,
      action: () => navigate("/editor"),
      description: "Create a new story",
      color: "btn-primary",
    },
    {
      label: "Manage",
      icon: <MdOutlineDeleteOutline />,
      action: () => navigate("/storyTable"),
      description: "Manage your existing stories",
      color: "btn-secondary",
    }
  ];

  return (
    <div className="card w-full bg-carolina-blue p-6">
      <div className="card-body">
        <div className="card-title flex flex-col rounded-md">
          <p className="text-start italic">
            {username} 🍝, welcome to your stories manager
          </p>
        </div>
        <div className="card-actions justify-center flex flex-col items-center p-6 space-y-8">
          {buttonData.map((button, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.4 }}
              className={`flex ${
                index % 2 === 0
                  ? "flex-row space-x-8"
                  : "flex-row-reverse space-x-reverse space-x-8"
              } items-center `}
            >
              <button
                className={`btn btn-lg rounded-3xl p-4 ${button.color}`}
                onClick={button.action}
              >
                {button.label} {button.icon}
              </button>
              <p className="text-lg">{button.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryManager;
