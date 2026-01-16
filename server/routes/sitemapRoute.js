const express = require('express');
const router = express.Router();
const { generateSitemap, generateRobots } = require('../controllers/sitemapController');

router.get('/sitemap.xml', generateSitemap);
router.get('/robots.txt', generateRobots);

module.exports = router;
