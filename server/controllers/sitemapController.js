const Story = require('../models/Story');
const Goal = require('../models/Goal');

const SITE_URL = process.env.FRONTEND_URL || 'https://spaghettibytes.blog';

// Generate XML Sitemap
exports.generateSitemap = async (req, res) => {
  try {
    // Fetch all published stories
    const stories = await Story.find({ published: true })
      .select('_id updatedAt createdAt')
      .lean();

    // Fetch all goals
    const goals = await Goal.find()
      .select('_id updatedAt createdAt')
      .lean();

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/goals', priority: '0.8', changefreq: 'weekly' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add stories
    for (const story of stories) {
      const lastmod = story.updatedAt || story.createdAt;
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/visualizer/${story._id}</loc>\n`;
      xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    // Add goals page (single page, not individual goals)
    // Goals are already covered by /goals static page

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

// Generate robots.txt
exports.generateRobots = (req, res) => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
};

module.exports = exports;
