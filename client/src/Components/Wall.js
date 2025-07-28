import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ImprovedStoryCard from "./ImprovedStoryCard";
import rocketImage from "../Assets/Images/juicy-woman-is-reading-a-book-at-home.gif";
import { FaRegBookmark, FaSearch } from "react-icons/fa";
import { LuTags } from "react-icons/lu";
import { BsStars } from "react-icons/bs";

const Wall = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTag, setSearchTag] = useState("");
  const [lastMonthStories, setLastMonthStories] = useState(0);
  const [distinctTags, setDistinctTags] = useState(0);
  const [loading, setLoading] = useState(true);

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
          story.tags.some((tag) =>
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
          <span className="badge badge-lg bg-cartoon-blue text-white shadow-cartoon-sm px-6 py-3">
            <BsStars className="mr-2" /> Welcome to the Reading Corner!
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          The <span className="gradient-text-fixed">Reading</span> Corner
        </h1>
        
        <p className="text-lg md:text-xl max-w-3xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Welcome, dear reader! 📚 Dive into my collection of 
          <strong> carefully crafted stories</strong> where code meets creativity. 
          Each article is a byte-sized adventure waiting to be discovered. 
          Let the stats guide you through my storytelling journey! 🚀
        </p>
        
        <div className="my-8">
          <img
            src={rocketImage}
            alt="Illustration Reading"
            className="w-full max-w-sm md:max-w-lg animate-float"
          />
          <p className="text-xs text-center mt-2">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/mNCLibjicqSz" className="underline hover:text-cartoon-pink">
              Julia K
            </a>{" "}
            from <a href="https://icons8.com/illustrations" className="underline hover:text-cartoon-pink">Ouch!</a>
          </p>
        </div>
      </motion.div>

      {/* Stats Section with Pop-Cartoon Style */}
      <motion.div 
        className="flex justify-center mx-auto mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transform transition-all hover:translate-x-1 hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-cartoon-pink mb-2">{stories.length}</div>
                <div className="text-lg font-semibold">Total Stories</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {lastMonthStories} new this month!
                </div>
              </div>
              <FaRegBookmark className="text-5xl text-cartoon-pink opacity-20" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transform transition-all hover:translate-x-1 hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-cartoon-yellow mb-2">{distinctTags}</div>
                <div className="text-lg font-semibold">Topics Covered</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Diverse content awaits!
                </div>
              </div>
              <LuTags className="text-5xl text-cartoon-yellow opacity-20" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div 
        className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="select select-bordered rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon transition-all"
        >
          <option value="newest">📅 Newest First</option>
          <option value="oldest">📅 Oldest First</option>
        </select>

        <div className="relative">
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search by tag..."
            className="input input-bordered w-full pr-10 rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon transition-all"
          />
          <div className="absolute top-3.5 right-3 text-cartoon-purple">
            <FaSearch />
          </div>
        </div>
      </motion.div>

      {/* Stories Grid */}
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
                  No stories found with tag "{searchTag}"
                </p>
                <p className="text-md text-gray-400 mt-2">
                  Try searching for something else!
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