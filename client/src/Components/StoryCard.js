import React from "react";
import { useNavigate } from "react-router-dom";
import { GoBook } from "react-icons/go";

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  // Calcolare se la storia è nuova (scritta nelle ultime due settimane)
  const isNew =
    new Date() - new Date(story.createdAt) < 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="indicator w-full p-6 transition ease-in hover:scale-105">
      {isNew && (
        <span className="indicator-item badge bg-emerald-800 animate-pulse absolute top-4 right-3.5 m-2 text-white transform transition ease-in hover:scale-105">
          New
        </span>
      )}
      <div
        className="p-4 rounded-lg shadow-md cursor-pointer w-full flex flex-col justify-between shadow-md shadow-warning"
        onClick={() => navigate(`/visualizer/${story._id}`)}
      >
        <h2 className="text-lg font-bold mb-2">{story.title}</h2>
        <p className="text-md mb-2">{story.summary}</p>
        <div className="flex flex-wrap my-2 ">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="badge badge-primary m-1 rounded-full text-white text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-white-600 text-xs">
          Published on {new Date(story.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-2 text-center">
          <button className="btn btn-success btn-outline btn-md rounded-full">
            <GoBook className="text-xl"/> Read
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
