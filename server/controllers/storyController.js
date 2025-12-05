const Story = require("../models/Story");
const axios = require("axios");
const dotenv = require("dotenv");
const { body, validationResult } = require('express-validator');

dotenv.config();

const { MEDIUM_ACCESS_TOKEN, MEDIUM_AUTHOR_ID } = process.env;

// Validation rules for story creation/update
const storyValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('summary')
    .trim()
    .notEmpty().withMessage('Summary is required')
    .isLength({ min: 10, max: 500 }).withMessage('Summary must be between 10 and 500 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('tags')
    .isArray({ min: 1 }).withMessage('At least one tag is required')
];

// Middleware to check validation results
const validateStory = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Get all stories with pagination
const getStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // max 100 per page

    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Story.countDocuments();

    res.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
    console.log("Story published on Medium:", response.data);
  } catch (error) {
    console.error(
      "Error publishing story on Medium:",
      error.response?.data || error.message
    );
  }
};

// Add a reaction to a story
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

// Remove a reaction from a story
const removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;

    const validReactions = ['love', 'spaghetti', 'fire', 'mind_blown', 'clap'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    // First get the story to check current reaction count
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Only decrement if count is greater than 0
    if (story.reactions[reaction] > 0) {
      story.reactions[reaction] -= 1;
      await story.save();
    }

    res.json({ reactions: story.reactions });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
};

// Get reactions for a story
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
  removeReaction,
  storyValidationRules,
  validateStory,
};