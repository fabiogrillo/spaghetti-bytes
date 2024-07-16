import React from "react";

const StoryCard = ({ story }) => {
  return (
    <div data-theme="night" className={`p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105`} >
      <h2 className="text-xl font-bold mb-2">{story.title}</h2>
      <p className="text-sm mb-2">{story.summary}</p>
      <div className="flex flex-wrap">
        {story.tags.map((tag) => (
          <span key={tag} className="badge badge-primary mr-2 mb-2">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-gray-600 text-xs">
        Published on {new Date(story.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default StoryCard;
