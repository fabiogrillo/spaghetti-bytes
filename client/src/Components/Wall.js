import React, { useState, useEffect } from "react";
import StoryCard from "../Components/StoryCard";
import rocketImage from "../Assets/Images/juicy-woman-is-reading-a-book-at-home.gif";

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");

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

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-8 w-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Stories</div>
          <div className="stat-value text-primary">{stories.length}</div>
          <div className="stat-desc">21% more than last month</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-8 w-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Users Reached</div>
          <div className="stat-value text-secondary">2K</div>
          <div className="stat-desc">21% more than last month</div>
        </div>

        <div className="stat center">
          <div className="stat-figure text-secondary">
            <div className="avatar online">
              <div className="w-16 rounded-full">
                <img src="/client/src/Assets/Images/beam-a-person-is-typing-on-a-laptop.gif" />
              </div>
            </div>
          </div>
          <div className="stat-value">135</div>
          <div className="stat-title">Topics covered</div>
        </div>
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
      <div className="grid grid-cols-2 gap-16">
        {filteredStories.map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
};

export default Wall;
