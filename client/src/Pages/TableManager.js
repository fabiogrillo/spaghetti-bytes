import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { FaMedium } from "react-icons/fa";
import ResponsiveTable from "../Components/ResponsiveTable";
import { motion } from "framer-motion";

const TableManager = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediumStatus, setMediumStatus] = useState({}); // { [storyId]: 'copied' }
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stories");
      const data = await response.json();
      const storiesArray = data.stories || [];
      setStories(storiesArray);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStories(stories.filter((story) => story._id !== id));
      } else {
        console.error("Error deleting story");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const editStory = (id) => {
    navigate(`/story-publisher/${id}`);
  };

  // Medium's server API is blocked by Cloudflare — use their "Import a story" UI instead.
  // This copies the blog post URL and opens Medium's import page in one click.
  const importOnMedium = (storyId) => {
    const storyUrl = `https://spaghettibytes.blog/visualizer/${storyId}`;
    navigator.clipboard.writeText(storyUrl).catch(() => {});
    window.open("https://medium.com/p/import", "_blank", "noopener,noreferrer");
    setMediumStatus((prev) => ({ ...prev, [storyId]: "copied" }));
    setTimeout(() => setMediumStatus((prev) => ({ ...prev, [storyId]: undefined })), 4000);
  };

  // Define columns for ResponsiveTable
  const storyColumns = [
    { 
      key: "title", 
      label: "Title",
      render: (story) => (
        <span className="font-semibold">{story.title}</span>
      )
    },
    { 
      key: "summary", 
      label: "Summary", 
      render: (story) => (
        <span className="text-sm text-gray-600">
          {story.summary.length > 60 
            ? `${story.summary.slice(0, 60)}...` 
            : story.summary}
        </span>
      )
    },
    {
      key: "tags",
      label: "Tags",
      render: (story) => (
        <div className="flex flex-wrap gap-1">
          {story.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge-sm bg-primary text-white">
              {tag}
            </span>
          ))}
          {story.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{story.tags.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      render: (story) => (
        <span className="text-sm">
          {new Date(story.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "medium",
      label: "Medium",
      render: (story) => {
        const status = mediumStatus[story._id];
        if (story.sharedOnMedium) {
          return (
            <span className="badge badge-success badge-sm gap-1">
              <FaMedium /> Published
            </span>
          );
        }
        if (status === "copied") {
          return (
            <div className="flex flex-col items-start gap-0.5">
              <span className="badge badge-info badge-sm">URL copied!</span>
              <span className="text-xs text-gray-400">Paste on Medium</span>
            </div>
          );
        }
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => importOnMedium(story._id)}
            className="btn btn-xs gap-1 btn-outline border-gray-400 hover:bg-black hover:text-white hover:border-black"
            title="Copy URL and open Medium import"
          >
            <FaMedium /> Import
          </motion.button>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Story Manager</h1>
          <p className="py-2 md:text-base max-w-3xl mx-auto">
            Here you can do anything you want with the stories you've written.
            Do you want to change something? Do you want to delete them because
            you don't like them anymore? Or do you simply want to see how many
            you have written and when? Whatever you want to do, here you have
            full control over all your stories. Enjoy!
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center mt-20">
            <span className="loading loading-infinity loading-lg text-error"></span>
            <p className="mt-4 text-lg">Loading stories...</p>
          </div>
        ) : (
          <div className="w-full">
            <ResponsiveTable
              data={stories}
              columns={storyColumns}
              onEdit={editStory}
              onDelete={deleteStory}
              title=""
              colorScheme="primary"
            />
          </div>
        )}

        <div className="flex items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn btn-primary rounded-soft shadow-soft hover:shadow-soft-lg"
            onClick={() => navigate("/manager")}
          >
            <BsArrowLeft /> Back to Manager
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TableManager;