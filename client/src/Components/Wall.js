import React, { useState, useEffect } from "react";
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
    <div>
      <div className="flex flex-col items-center mx-auto justify-center">
        <div className="max-w-md text-center py-10">
          <h1 className="text-3xl md:text-4xl font-bold">The reading corner</h1>
          <p className="py-2 md:py-2 md:text-base">
            Welcome, reader! Here you can view all the stories that have been
            written, along with their tags and publication dates. You can find
            also some overall stats on my stories, I hope you enjoy!
          </p>
        </div>
        <div className="mb-8">
          <img
            src={rocketImage}
            alt="Illustration Reading"
            className="w-full max-w-sm md:max-w-lg uniform-img"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/mNCLibjicqSz">
              Julia K
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>

      {/* Container per centrare le stats */}
      <div className="flex justify-center mx-auto">
        <div className="stats stats-vertical lg:stats-horizontal w-full max-w-4xl shadow-md">
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
            <div className="stat-value text-secondary">100</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning text-3xl">
              <LuTags />
            </div>
            <div className="stat-title">Topics covered</div>
            <div className="stat-value text-warning">{distinctTags}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-4">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="select select-bordered w-full max-w-xs"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredStories.map((story) => (
          <div key={story._id}>
            <StoryCard story={story} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wall;
