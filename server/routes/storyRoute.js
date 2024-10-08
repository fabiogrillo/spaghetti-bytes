const express = require("express");
const router = express.Router();
const {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
} = require("../controllers/storyController");

// Route to get all stories
router.get("/", getStories);

// Route to get a single story by ID
router.get("/:id", getStoryById);

// Route to create a new story
router.post("/publish", createStory);

// Route to update a story by ID
router.put("/:id", updateStory);

// Route to delete a story by ID
router.delete("/:id", deleteStory);

module.exports = router;
