import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StoryCard from "../Components/StoryCard";
import rocketImage from "../Assets/Images/juicy-woman-is-reading-a-book-at-home.gif";
import { FaRegBookmark } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";
import { LuTags } from "react-icons/lu";

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [lastMonthStories, setLastMonthStories] = useState(0);
  const [distinctTags, setDistinctTags] = useState(0);

  useEffect(() => {
    // Fetch stories from the server
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories");
        const data = await response.json();
        setStories(data);
        setFilteredStories(data);

        // Calculate stories written in the last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const storiesLastMonth = data.filter(
          (story) => new Date(story.createdAt) >= lastMonth
        );
        setLastMonthStories(storiesLastMonth.length);

        // Calculate distinct tags
        const allTags = data.flatMap((story) => story.tags);
        const uniqueTags = new Set(allTags);
        setDistinctTags(uniqueTags.size);
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

  return (
    <div className="container mx-auto mb-16">
      <div className="flex justify-between items-center my-12 mb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold">The reading corner</h1>
          <p className="py-6 italic">
            Welcome to the reading corner. Here you can view all the stories
            that have been written, along with their tags and publication dates
          </p>
        </div>
        <div className="w-3/8">
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

      <div className="flex flex-col items-center my-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="stats shadow-2xl w-full max-w-4xl outline shadow-neutral"
        >
          <div className="stat">
            <div className="stat-figure text-primary text-3xl">
              <FaRegBookmark />
            </div>
            <div className="stat-title">Total Stories</div>
            <div className="stat-value text-primary">{stories.length}</div>
            <div className="stat-desc">{`${lastMonthStories} new stories last month`}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary text-3xl">
              <PiUsersThree />
            </div>
            <div className="stat-title">Users Reached</div>
            <div className="stat-value text-secondary">2K</div>
            <div className="stat-desc">21% more than last month</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning text-3xl">
              <LuTags />
            </div>
            <div className="stat-title">Topics covered</div>
            <div className="stat-value text-warning">{distinctTags}</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
        </motion.div>
      </div>

      <div className="my-8 text-center">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="select bg-primary outline text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {filteredStories.map((story, index) => (
          <motion.div
            key={story._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <StoryCard story={story} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wall;
