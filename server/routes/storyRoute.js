const express = require("express");
const router = express.Router();
const { publishStory, getStories } = require("../controllers/storyController");

router.post("/publish", publishStory);
router.get("/", getStories);

module.exports = router;
