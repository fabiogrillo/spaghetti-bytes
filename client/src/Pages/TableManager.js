import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import illustration1 from "../Assets/Images/sammy-woman-working-on-laptop-checking-her-workflow.gif";

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
    <div className="container mx-auto p-4 mb-16 items-center mt-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Story Manager</h1>
      <div className="flex justify-between items-center flex-row">
        <img
          src={illustration1}
          alt="Header Illustration"
          className="my-8 w-2/6"
        />
        <p className="w-3/5 p-4 text-lg">
          Here you can do anything you want with the stories you've written. Do
          you want to change something? 
          Do you want to delete them because you
          don't like them anymore? Or do you simply want to see how many you
          have written and when? Whatever you want to do here you have full
          control over all your stories. Enjoy!
        </p>
      </div>
      <table className="table-auto table-zebra w-full mt-16">
        <thead>
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Summary</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {stories.map((story, index) => (
            <tr key={story._id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{story.title}</td>
              <td className="px-4 py-2">
                {story.summary.length > 50
                  ? `${story.summary.slice(0, 50)}...`
                  : story.summary}
              </td>
              <td className="px-4 py-2">
                {new Date(story.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  className="btn btn-error btn-sm mr-2"
                  onClick={() => deleteStory(story._id)}
                >
                  Delete <FaTrashAlt />
                </button>
                <button
                  className="btn btn-warning btn-sm mr-2"
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
  );
};

export default TableManager;
