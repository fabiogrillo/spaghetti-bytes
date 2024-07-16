import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StoryCard from "../Components/StoryCard";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import rocketImage from "../Assets/Images/juicy-woman-is-reading-a-book-at-home.gif";

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
    <div className="container mx-auto p-4 space-y-8 mb-10">
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
            alt="Illustration Reading"
            className="w-full h-auto"
          />
          <p className="text-xs text-center mt-4 md:mt-0">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/mNCLibjicqSz">
              Julia K
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform ease-in-out duration-1000 mx-8"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {filteredStories.slice(0, 3).map((story, index) => (
            <motion.div
              key={story._id}
              className="w-full flex-shrink-0 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentIndex ? 1 : 0 }}
              transition={{ duration: 1.5 }}
            >
              <StoryCard story={story} />
            </motion.div>
          ))}
        </div>
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() =>
            setCurrentIndex((prevIndex) => (prevIndex - 1 + 3) % 3)
          }
        >
          <IoIosArrowBack size={24} />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % 3)}
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
        {filteredStories.map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
};

export default Wall;
