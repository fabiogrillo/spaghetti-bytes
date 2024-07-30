import React from "react";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  // Calcolare se la storia è nuova (scritta nelle ultime due settimane)
  const isNew =
    new Date() - new Date(story.createdAt) < 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="indicator w-full text-white">
      {isNew && (
        <span className="indicator-item badge bg-violet-700 text-white outline border-0">New</span>
      )}
      <div
        className="p-6 rounded-lg shadow-md cursor-pointer bg-success bg-opacity-50 w-full shadow-primary"
        onClick={() => navigate(`/visualizer/${story._id}`)}
      >
        <h2 className="text-xl font-bold mb-2">{story.title}</h2>
        <p className="text-sm mb-2">{story.summary}</p>
        <div className="flex flex-wrap">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="badge badge-primary mr-2 mb-2 rounded-full text-white"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-white-600 text-xs">
          Published on {new Date(story.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default StoryCard;
