import React from "react";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ story }) => {
  const navigate = useNavigate();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const isNew = new Date(story.createdAt) > thirtyDaysAgo;

  return (
    <div
      data-theme="aqua"
      className="relative p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 cursor-pointer"
      onClick={() => navigate(`/visualizer/${story._id}`)}
    >
      {isNew && (
        <div className="absolute top-0 right-0 m-2">
          <span className="badge badge-warning rounded-full text-white rotate-6">
            New
          </span>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">{story.title}</h2>
      <p className="text-sm mb-2">{story.summary}</p>
      <div className="flex flex-wrap">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="badge badge-primary mr-2 mb-2 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-white-600 text-xs">
        Published on {new Date(story.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default StoryCard;
