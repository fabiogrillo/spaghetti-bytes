const Story = require("../models/Story");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const { MEDIUM_ACCESS_TOKEN, MEDIUM_AUTHOR_ID } = process.env;

// Get all stories
const getStories = async (req, res) => {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single story by ID
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new story
const createStory = async (req, res) => {
  try {
    const newStory = new Story(req.body);
    const savedStory = await newStory.save();

    if (req.body.shareOnMedium) {
      await publishOnMedium(savedStory);
    }

    res.status(201).json(savedStory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a story by ID
const updateStory = async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a story by ID
const deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Publish a story on Medium
const publishOnMedium = async (story) => {
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
    //console.log("Story published on Medium:", response.data);
  } catch (error) {
    console.error(
      "Error publishing story on Medium:",
      error.response?.data || error.message
    );
  }
};

const addReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { reaction } = req.body;
        
        const validReactions = ['love', 'spaghetti', 'fire', 'mind_blown', 'clap'];
        if (!validReactions.includes(reaction)) {
            return res.status(400).json({ error: 'Invalid reaction type' });
        }
        
        const story = await Story.findByIdAndUpdate(
            id,
            { $inc: { [`reactions.${reaction}`]: 1 } },
            { new: true }
        );
        
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        res.json({ reactions: story.reactions });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ error: 'Failed to add reaction' });
    }
};

const getReactions = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id).select('reactions');
        
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        res.json({ reactions: story.reactions });
    } catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Failed to get reactions' });
    }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getReactions,
  addReaction,
};
