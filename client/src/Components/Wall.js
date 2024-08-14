import React, { useState, useEffect } from "react";
import StoryCard from "../Components/StoryCard";
import rocketImage from "../Assets/Images/juicy-woman-is-reading-a-book-at-home.gif";
import { FaRegBookmark, FaSearch } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";
import { LuTags } from "react-icons/lu";

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTag, setSearchTag] = useState("");
  const [lastMonthStories, setLastMonthStories] = useState(0);
  const [distinctTags, setDistinctTags] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
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
    const sortAndFilterStories = () => {
      let sortedStories = [...stories];

      // Filtro per il tag cercato
      if (searchTag) {
        sortedStories = sortedStories.filter((story) =>
          story.tags.some((tag) =>
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        );
      }

      // Ordinamento per la data
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

    sortAndFilterStories();
  }, [sortOption, searchTag, stories]);

  return (
    <div>
      <div className="flex flex-col items-center mx-auto justify-between md:m-8">
        <div className="text-center py-10">
          <h1 className="text-3xl md:text-4xl font-bold">The reading corner</h1>
          <p className="py-2 md:py-2 md:text-base">
            Welcome, dear reader! I am delighted to invite you into this space
            where you can explore all the stories that have been thoughtfully
            crafted and shared. There are some stats that provide insights into
            various aspects of my storytelling journey. I sincerely hope that
            you find enjoyment in exploring this collection and that the stories
            resonate with you 🤗
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

      <div className="flex justify-center items-center text-center mt-12">
        <h1 className="text-xl font-semibold">
          Click 🖱️ on a story to read it, enjoy!
        </h1>
      </div>
      <div className="mt-8 mb-4 flex  gap-2">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="select select-bordered max-w-md "
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <div className="relative">
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search by tag"
            className="input input-bordered w-full pr-10"
          />
          <div className="absolute top-3.5 right-3 text-gray-400">
            <FaSearch />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <div key={story._id}>
              <StoryCard story={story} />
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center">
            <p className="text-md  text-gray-500">
              None of the stories has the "{searchTag}" tag 😢
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wall;
