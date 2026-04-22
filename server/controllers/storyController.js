const Story = require("../models/Story");
const { notifyNewArticle } = require("./newsletterController");
const { invalidateStoryCache } = require("../middleware/cacheRoutes");
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
    .isLength({ min: 10, max: 1000 }).withMessage('Summary must be between 10 and 1000 characters'),
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
      const mediumResult = await publishOnMedium(savedStory);
      if (mediumResult.success) {
        savedStory.sharedOnMedium = true;
        await savedStory.save();
      } else {
        console.warn("Medium publish failed for story:", savedStory._id, mediumResult.error);
      }
    }

    // Notify subscribers — fire-and-forget, errors don't affect the response
    notifyNewArticle(savedStory).catch(err =>
      console.error('Newsletter notification failed:', err.message)
    );

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
    invalidateStoryCache(req.params.id);
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
    invalidateStoryCache(req.params.id);
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Strip base64 images from HTML content before sending to Medium.
// Medium's API cannot process data: URIs — replace them with a text placeholder.
const stripBase64Images = (html) => {
  if (typeof html !== "string") return html;
  return html.replace(/<img[^>]+src="data:[^"]*"[^>]*\/?>/gi, "<p><em>[Image]</em></p>");
};

// Publish a story on Medium. Returns { success, url?, error? }
const publishOnMedium = async (story) => {
  if (!MEDIUM_ACCESS_TOKEN || !MEDIUM_AUTHOR_ID) {
    console.error("Medium credentials not configured.");
    return { success: false, error: "Medium credentials not configured" };
  }

  const url = `https://api.medium.com/v1/users/${MEDIUM_AUTHOR_ID}/posts`;
  const headers = {
    Authorization: `Bearer ${MEDIUM_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  const data = {
    title: story.title,
    contentFormat: "html",
    content: stripBase64Images(story.content),
    tags: story.tags,
    publishStatus: "public",
    notifyFollowers: true,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("Story published on Medium:", response.data);
    return { success: true, url: response.data?.data?.url };
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.error("Error publishing story on Medium:", detail);
    return { success: false, error: typeof detail === "object" ? JSON.stringify(detail) : detail };
  }
};

// Re-publish an existing story to Medium (admin endpoint)
const republishOnMedium = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const result = await publishOnMedium(story);
    if (!result.success) {
      return res.status(502).json({ message: "Failed to publish on Medium", error: result.error });
    }

    // Mark as shared
    story.sharedOnMedium = true;
    await story.save();

    res.json({ message: "Story published on Medium successfully", url: result.url });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Toggle like on a story
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Simple increment/decrement logic
    // Frontend will track if user already liked
    const { action } = req.body; // 'add' or 'remove'

    if (action === 'add') {
      story.likes = (story.likes || 0) + 1;
    } else if (action === 'remove' && story.likes > 0) {
      story.likes -= 1;
    }

    await story.save();
    res.json({ likes: story.likes });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  toggleLike,
  republishOnMedium,
  storyValidationRules,
  validateStory,
};