const Story = require("../models/Story");
const { notifyNewArticle } = require("./newsletterController");
const { invalidateStoryCache } = require("../middleware/cacheRoutes");
const axios = require("axios");
const dotenv = require("dotenv");
const { body, validationResult } = require('express-validator');

const TurndownService = require('turndown');

dotenv.config();

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

    if (req.body.shareOnDevTo) {
      const result = await publishOnDevTo(savedStory).catch(e => ({ success: false, error: e.message }));
      if (result.success) await Story.findByIdAndUpdate(savedStory._id, { sharedOnDevTo: true });
      else console.warn('Dev.to publish failed for story:', savedStory._id, result.error);
    }

    if (req.body.shareOnHashnode) {
      const result = await publishOnHashnode(savedStory).catch(e => ({ success: false, error: e.message }));
      if (result.success) await Story.findByIdAndUpdate(savedStory._id, { sharedOnHashnode: true });
      else console.warn('Hashnode publish failed for story:', savedStory._id, result.error);
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
// Used by scrapers and bots that cannot execute client-side React.
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

// Strip base64 images from HTML content — external platforms cannot process data: URIs.
const stripBase64Images = (html) => {
  if (typeof html !== "string") return html;
  return html.replace(/<img[^>]+src="data:[^"]*"[^>]*\/?>/gi, "<p><em>[Image]</em></p>");
};

const toMarkdown = (html) => {
  const td = new TurndownService({ codeBlockStyle: 'fenced', headingStyle: 'atx' });
  return td.turndown(stripBase64Images(html));
};

const canonicalUrl = (story) =>
  `${process.env.FRONTEND_URL || 'https://spaghettibytes.blog'}/visualizer/${story._id}`;

// Publish a story on Dev.to. Returns { success, url?, error? }
const publishOnDevTo = async (story) => {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.warn('DEVTO_API_KEY not set — skipping Dev.to publish');
    return { success: false, error: 'DEVTO_API_KEY not set' };
  }
  try {
    const res = await axios.post(
      'https://dev.to/api/articles',
      {
        article: {
          title: story.title,
          body_markdown: toMarkdown(story.content),
          tags: story.tags.slice(0, 4),
          canonical_url: canonicalUrl(story),
          published: true,
        },
      },
      { headers: { 'api-key': apiKey } }
    );
    return { success: true, url: res.data.url };
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.warn('Dev.to publish failed:', typeof detail === 'object' ? JSON.stringify(detail) : detail);
    return { success: false, error: String(detail) };
  }
};

// Publish a story on Hashnode. Returns { success, url?, error? }
const publishOnHashnode = async (story) => {
  const apiKey = process.env.HASHNODE_API_KEY;
  const publicationId = process.env.HASHNODE_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    console.warn('HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID not set — skipping Hashnode publish');
    return { success: false, error: 'Hashnode env vars not set' };
  }
  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) { post { id url } }
    }
  `;
  try {
    const res = await axios.post(
      'https://gql.hashnode.com',
      {
        query,
        variables: {
          input: {
            title: story.title,
            contentMarkdown: toMarkdown(story.content),
            publicationId,
            canonicalUrl: canonicalUrl(story),
          },
        },
      },
      { headers: { Authorization: apiKey } }
    );
    if (res.data.errors) {
      const errMsg = res.data.errors.map(e => e.message).join(', ');
      console.warn('Hashnode publish GraphQL error:', errMsg);
      return { success: false, error: errMsg };
    }
    return { success: true, url: res.data?.data?.publishPost?.post?.url };
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.warn('Hashnode publish failed:', typeof detail === 'object' ? JSON.stringify(detail) : detail);
    return { success: false, error: String(detail) };
  }
};

// Cross-post an existing story to Dev.to and/or Hashnode (admin endpoint)
const crosspostStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const { platforms = [] } = req.body;
    const results = {};

    if (platforms.includes('devto') && !story.sharedOnDevTo) {
      results.devto = await publishOnDevTo(story).catch(e => ({ success: false, error: e.message }));
      if (results.devto.success) story.sharedOnDevTo = true;
    }
    if (platforms.includes('hashnode') && !story.sharedOnHashnode) {
      results.hashnode = await publishOnHashnode(story).catch(e => ({ success: false, error: e.message }));
      if (results.hashnode.success) story.sharedOnHashnode = true;
    }

    await story.save();
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
  crosspostStory,
  storyValidationRules,
  validateStory,
};