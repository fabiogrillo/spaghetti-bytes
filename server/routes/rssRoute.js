const express = require("express");
const router = express.Router();
const { generateRSSFeed, generateAtomFeed, generateJSONFeed } = require("../controllers/rssController");

// RSS 2.0 feed
router.get("/feed.xml", generateRSSFeed);
router.get("/rss", generateRSSFeed);
router.get("/rss.xml", generateRSSFeed);

// Atom feed (alternative format)
router.get("/atom.xml", generateAtomFeed);

// JSON Feed (modern format)
router.get("/feed.json", generateJSONFeed);

module.exports = router;