const Story = require("../models/Story");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const { MEDIUM_ACCESS_TOKEN, MEDIUM_AUTHOR_ID } = process.env;

// Get all stories with error handling
const getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single story by ID
const getStoryById = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid story ID format"
      });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({
        code: "404",
        message: "Story not found"
      });
    }
    res.json(story);
  } catch (error) {
    console.error("Error fetching story by ID:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new story
const createStory = async (req, res) => {
  try {
    // Validate required fields
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        code: "400",
        message: "Title and content are required"
      });
    }

    const newStory = new Story(req.body);
    const savedStory = await newStory.save();

    // Try to publish on Medium if requested, but don't fail if it doesn't work
    if (req.body.shareOnMedium) {
      try {
        await publishOnMedium(savedStory);
      } catch (mediumError) {
        console.error("Medium publishing failed:", mediumError);
        // Continue anyway - story is saved locally
      }
    }

    res.status(201).json(savedStory);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a story by ID
const updateStory = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid story ID format"
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return res.status(404).json({
        code: "404",
        message: "Story not found"
      });
    }

    res.json(updatedStory);
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a story by ID
const deleteStory = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid story ID format"
      });
    }

    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({
        code: "404",
        message: "Story not found"
      });
    }
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Publish a story on Medium
const publishOnMedium = async (story) => {
  if (!MEDIUM_ACCESS_TOKEN || !MEDIUM_AUTHOR_ID) {
    console.log("Medium integration not configured");
    return;
  }

  const url = `https://api.medium.com/v1/users/${MEDIUM_AUTHOR_ID}/posts`;
  const headers = {
    Authorization: `Bearer ${MEDIUM_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  const data = {
    title: story.title,
    contentFormat: "html",
    content: story.content,
    tags: story.tags,
    publishStatus: "public",
    notifyFollowers: true,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("Story published on Medium:", response.data.data.id);
  } catch (error) {
    console.error(
      "Error publishing story on Medium:",
      error.response?.data || error.message
    );
    throw error; // Re-throw to be caught by caller
  }
};

// Add reaction to a story
const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, userId } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid story ID format"
      });
    }

    // Validate reaction type
    const validReactions = ['like', 'love', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid reaction type"
      });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        code: "404",
        message: "Story not found"
      });
    }

    // Add or update reaction logic here
    // This is a simplified version - you might want to implement more complex logic
    if (!story.reactions) {
      story.reactions = {};
    }
    if (!story.reactions[type]) {
      story.reactions[type] = [];
    }

    // Toggle reaction
    const userIndex = story.reactions[type].indexOf(userId);
    if (userIndex > -1) {
      story.reactions[type].splice(userIndex, 1);
    } else {
      story.reactions[type].push(userId);
    }

    await story.save();
    res.json({ message: "Reaction updated", reactions: story.reactions });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reactions for a story
const getReactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid story ID format"
      });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        code: "404",
        message: "Story not found"
      });
    }

    res.json({ reactions: story.reactions || {} });
  } catch (error) {
    console.error("Error getting reactions:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  addReaction,
  getReactions,
};