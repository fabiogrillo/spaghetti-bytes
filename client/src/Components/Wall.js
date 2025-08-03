import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ImprovedStoryCard from "./ImprovedStoryCard";
import { FaRegBookmark, FaSearch } from "react-icons/fa";
import { LuTags } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import { api } from "../utils/fetchWrapper"; // Use the new fetch wrapper

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTag, setSearchTag] = useState("");
  const [lastMonthStories, setLastMonthStories] = useState(0);
  const [distinctTags, setDistinctTags] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the new api wrapper
        const data = await api.get("/api/stories");

        console.log("Fetched stories:", data);

        // Ensure data is an array
        const storiesArray = Array.isArray(data) ? data : [];

        setStories(storiesArray);
        setFilteredStories(storiesArray);

        // Calculate stories written in the last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const storiesLastMonth = storiesArray.filter(
          (story) => new Date(story.createdAt) >= lastMonth
        );
        setLastMonthStories(storiesLastMonth.length);

        // Calculate distinct tags
        const allTags = storiesArray.flatMap((story) => story.tags || []);
        const uniqueTags = new Set(allTags);
        setDistinctTags(uniqueTags.size);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError(error.message || "Failed to load stories. Please try again later.");
        setStories([]);
        setFilteredStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    const sortAndFilterStories = () => {
      let sortedStories = [...stories];

      // Filter by search tag
      if (searchTag) {
        sortedStories = sortedStories.filter((story) =>
          (story.tags || []).some((tag) =>
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        );
      }

      // Sort by date
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

  // Error display
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-400 rounded-cartoon p-6 inline-block"
          >
            <p className="text-xl text-red-600 mb-2">😔 Oops! Something went wrong</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-cartoon-blue text-white rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon transition-all"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-block mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-cartoon-blue text-white shadow-cartoon-sm px-3 md:px-6 py-3 whitespace-nowrap">
            <BsStars className="mr-2" /> Welcome to the Reading Corner!
          </span>
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">
          Explore My <span className="text-cartoon-pink">Stories</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-10 max-w-2xl">
          Dive into a collection of articles about tech, creativity, and everything in between.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-4xl">
          <motion.div
            className="bg-cartoon-yellow p-4 rounded-cartoon shadow-cartoon-sm border-2 border-black"
            whileHover={{ translateY: -2 }}
          >
            <FaRegBookmark className="text-2xl mb-2" />
            <p className="font-bold text-lg">{stories.length}</p>
            <p className="text-sm">Total Stories</p>
          </motion.div>

          <motion.div
            className="bg-cartoon-pink p-4 rounded-cartoon shadow-cartoon-sm border-2 border-black text-white"
            whileHover={{ translateY: -2 }}
          >
            <LuTags className="text-2xl mb-2" />
            <p className="font-bold text-lg">{distinctTags}</p>
            <p className="text-sm">Unique Tags</p>
          </motion.div>

          <motion.div
            className="bg-cartoon-purple p-4 rounded-cartoon shadow-cartoon-sm border-2 border-black text-white"
            whileHover={{ translateY: -2 }}
          >
            <BsStars className="text-2xl mb-2" />
            <p className="font-bold text-lg">{lastMonthStories}</p>
            <p className="text-sm">Recent Stories</p>
          </motion.div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-2xl">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tag..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-cartoon focus:outline-none focus:ring-2 focus:ring-cartoon-blue"
            />
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border-2 border-black rounded-cartoon focus:outline-none focus:ring-2 focus:ring-cartoon-blue bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center mt-20">
          <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
          <p className="mt-4 text-lg">Loading amazing stories...</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {filteredStories.length > 0 ? (
            filteredStories.map((story, index) => (
              <ImprovedStoryCard key={story._id} story={story} index={index} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center mt-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-block"
              >
                <p className="text-2xl mb-4">😢</p>
                <p className="text-xl text-gray-500">
                  {searchTag ? `No stories found with tag "${searchTag}"` : "No stories available"}
                </p>
                <p className="text-md text-gray-400 mt-2">
                  {searchTag ? "Try searching for something else!" : "Check back later for new content!"}
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Wall;