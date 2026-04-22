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

// Return a server-side rendered HTML page for a story.
// Used by Medium's "Import a story" scraper — the React SPA cannot be scraped.
const getStoryPreview = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.status(404).send("<h1>Story not found</h1>");
    }

    const cleanContent = stripBase64Images(story.content);
    const tags = (story.tags || []).map((t) => `<span>#${t}</span>`).join(" ");
    const date = new Date(story.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const canonicalUrl = `${process.env.FRONTEND_URL || "https://spaghettibytes.blog"}/visualizer/${story._id}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${story.title}</title>
  <meta name="description" content="${(story.summary || "").replace(/"/g, "&quot;")}" />
  <meta name="author" content="Fabio Grillo" />
  <link rel="canonical" href="${canonicalUrl}" />
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #333; }
    h1 { font-size: 2.2em; margin-bottom: 0.3em; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 2em; }
    .summary { font-style: italic; color: #555; border-left: 4px solid #E85D04; padding-left: 1em; margin-bottom: 2em; }
    img { max-width: 100%; height: auto; }
    pre { background: #f4f4f4; padding: 1em; overflow-x: auto; border-radius: 4px; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; }
  </style>
</head>
<body>
  <article>
    <h1>${story.title}</h1>
    <div class="meta">By Fabio Grillo · ${date} · <a href="${canonicalUrl}">Originally published on Spaghetti Bytes</a></div>
    <div class="summary">${story.summary || ""}</div>
    ${cleanContent}
    <hr />
    <p><em>Tags: ${tags}</em></p>
    <p><em>Originally published at <a href="${canonicalUrl}">${canonicalUrl}</a></em></p>
  </article>
</body>
</html>`);
  } catch (error) {
    res.status(500).send("<h1>Server error</h1>");
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
  getStoryPreview,
  createStory,
  updateStory,
  deleteStory,
  toggleLike,
  republishOnMedium,
  storyValidationRules,
  validateStory,
};