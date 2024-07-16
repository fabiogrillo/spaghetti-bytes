import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StoryCard from "../Components/StoryCard";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import rocketImage from "../Assets/Images/taxi-rocket-delivering-parcels-to-aliens-in-space.gif";

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch stories from the server
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories");
        const data = await response.json();
        setStories(data);
        setFilteredStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };
    fetchStories();
  }, []);

  useEffect(() => {
    // Sort stories based on sortOption
    const sortStories = () => {
      let sortedStories = [...stories];
      if (sortOption === "newest") {
        sortedStories.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (sortOption === "oldest") {
        sortedStories.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
      setFilteredStories(sortedStories);
    };
    sortStories();
  }, [sortOption, stories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stories.length]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div className="w-3/5">
          <h1 className="text-3xl font-bold">
            Where the magic happens! This is the corner where you can inspect
            every single story I wrote
          </h1>
        </div>
        <div className="w-2/5">
          <img
            src={rocketImage}
            alt="Rocket delivering parcels to aliens in space"
            className="w-full h-auto"
          />
        </div>
      </div>
      <div className="carousel relative">
        {stories.slice(0, 3).map((story, index) => (
          <motion.div
            key={story._id}
            className={`carousel-item absolute w-full ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black to-transparent text-white rounded-b-lg w-full">
              <h2 className="text-2xl font-bold">{story.title}</h2>
              <p className="text-sm">{story.summary}</p>
            </div>
          </motion.div>
        ))}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() =>
            setCurrentIndex(
              (prevIndex) => (prevIndex - 1 + stories.length) % stories.length
            )
          }
        >
          <IoIosArrowBack size={24} />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() =>
            setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length)
          }
        >
          <IoIosArrowForward size={24} />
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="select select-bordered rounded-3xl"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map((story, index) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
};

export default Wall;
