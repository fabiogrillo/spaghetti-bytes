import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { BsArrowLeft } from "react-icons/bs";

const StoryVisualizer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true); // Stato per il caricamento

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setLoading(false); // Dati caricati, disabilitiamo il loading
      }
    };
    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-20">
        <span className="loading loading-infinity loading-lg"></span>
        <p className="mt-4 text-lg">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return <div>Error loading story...</div>;
  }

  const readingTime = Math.ceil(story.content.split(/\s+/).length / 200);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold my-4 text-center">
        {story.title}
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="w-full md:w-1/3 text-center md:text-left">
          <p className="text-sm md:text-lg">Reading time: {readingTime} min</p>
        </div>
        <div className="w-full md:w-1/3 text-center mt-2 md:mt-0">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="badge badge-primary mr-2 mb-2 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="w-full md:w-1/3 text-center md:text-right mt-2 md:mt-0">
          <p className="text-sm md:text-lg">
            Published on {new Date(story.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <ReactQuill
        value={story.content}
        readOnly={true}
        theme="bubble"
        className="p-2 custom-quill rounded-2xl bg-transparent text-black shadow-md"
      />
      <div className="flex justify-center md:justify-start mt-4">
        <button
          className="btn btn-secondary btn-sm rounded-2xl"
          onClick={() => navigate("/blog")}
        >
          <BsArrowLeft /> Back
        </button>
      </div>
    </div>
  );
};

export default StoryVisualizer;
