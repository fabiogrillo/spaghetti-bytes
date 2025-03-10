import React from "react";
import { useNavigate } from "react-router-dom";
import { GoBook } from "react-icons/go";

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  // Calcolare se la storia è nuova (scritta nelle ultime due settimane)
  const isNew =
    new Date() - new Date(story.createdAt) < 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="indicator w-full p-6 transition ease-in">
      {isNew && (
        <span className="indicator-item badge bg-warning absolute top-4 right-3.5 m-2 text-white transform scale-110">
          New
        </span>
      )}
      <div
        className="p-6 rounded-lg cursor-pointer w-full flex flex-col justify-between border border-primary transition ease-in hover:shadow-lg hover:shadow-primary"
        onClick={() => navigate(`/visualizer/${story._id}`)}
      >
        <h2 className="text-md font-bold mb-2">{story.title}</h2>
        <p className="text-sm mb-2">{story.summary}</p>
        <div className="flex flex-wrap my-2 ">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="badge border-primary m-1 rounded-full text-xs text-primary font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-white-600 text-xs">
          Published on {new Date(story.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-2 text-center">
          <button className="btn btn-primary btn-outline btn-md rounded-full ">
            <GoBook className="text-xl" /> Read
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
