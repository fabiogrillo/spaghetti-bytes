// Updated storyRoute.js - Removed AI image generation route
const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/storyController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Route to get all stories
router.get("/", getStories);

// Server-side rendered HTML preview — used by Medium's "Import a story" scraper
router.get("/:id/preview", getStoryPreview);

// Route to get a single story by ID
router.get("/:id", getStoryById);

// Route to create a new story (protected - admin only, with validation)
router.post("/publish", requireAuth, requireAdmin, storyValidationRules, validateStory, createStory);

// Route to update a story by ID (protected - admin only, with validation)
router.put("/:id", requireAuth, requireAdmin, storyValidationRules, validateStory, updateStory);

// Route to delete a story by ID (protected - admin only)
router.delete("/:id", requireAuth, requireAdmin, deleteStory);

// Route to toggle like on a story
router.post("/:id/like", toggleLike);

// Route to re-publish an existing story to Medium (admin only)
router.post("/:id/publish-medium", requireAuth, requireAdmin, republishOnMedium);

module.exports = router;