const express = require("express");
const router = express.Router();
const { publishStory } = require("../controllers/storyController");

router.post("/publish", publishStory);

module.exports = router;
