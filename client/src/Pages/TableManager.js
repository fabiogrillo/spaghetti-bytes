import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

const TableManager = () => {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories");
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const deleteStory = async (id) => {
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Story Manager</h1>
          <p className="py-2 md:text-base">
            Here you can do anything you want with the stories you've written.
            Do you want to change something? Do you want to delete them because
            you don't like them anymore? Or do you simply want to see how many
            you have written and when? Whatever you want to do, here you have
            full control over all your stories. Enjoy!
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="table-zebra bg-primary rounded-2xl bg-opacity-50 w-full">
            <thead>
              <tr>
                <th className="px-2 md:px-4 py-2">#</th>
                <th className="px-2 md:px-4 py-2">Title</th>
                <th className="px-2 md:px-4 py-2">Summary</th>
                <th className="px-2 md:px-4 py-2">Created At</th>
                <th className="px-2 md:px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {stories.map((story, index) => (
                <tr key={story._id} className="border-t">
                  <td className="px-2 md:px-4 py-2">{index + 1}</td>
                  <td className="px-2 md:px-4 py-2">{story.title}</td>
                  <td className="px-2 md:px-4 py-2">
                    {story.summary.length > 50
                      ? `${story.summary.slice(0, 50)}...`
                      : story.summary}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    {new Date(story.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    <button
                      className="btn btn-error btn-sm mr-2"
                      onClick={() => deleteStory(story._id)}
                    >
                      Delete <FaTrashAlt />
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => editStory(story._id)}
                    >
                      Edit <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center mt-8">
          <button
            type="button"
            className="btn btn-secondary btn-sm rounded-xl"
            onClick={() => navigate("/manager")}
          >
            <BsArrowLeft/> Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableManager;
