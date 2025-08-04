const Story = require("../models/Story");
const RSS = require("rss");

// Generate RSS feed
const generateRSSFeed = async (req, res) => {
    try {
        // Get site URL from environment or request
        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

        // Create feed instance
        const feed = new RSS({
            title: "Spaghetti Bytes",
            description: "Untangling code, one byte at a time - A technical blog with a cartoon twist",
            feed_url: `${siteUrl}/rss.xml`,
            site_url: siteUrl,
            image_url: `${siteUrl}/logo.png`,
            author: "Spaghetti Bytes",
            copyright: `${new Date().getFullYear()} Spaghetti Bytes`,
            language: "en",
            categories: ["Technology", "Programming", "Web Development", "Software Engineering"],
            pubDate: new Date(),
            ttl: 60, // Cache for 1 hour
            custom_namespaces: {
                'content': 'http://purl.org/rss/1.0/modules/content/'
            }
        });

        // Get latest stories - removed 'published' field check
        const stories = await Story.find({})
            .sort({ createdAt: -1 })
            .limit(20); // Last 20 articles

        // Add each story to feed
        stories.forEach(story => {
            feed.item({
                title: story.title,
                description: story.summary || "Read more on Spaghetti Bytes",
                url: `${siteUrl}/visualizer/${story._id}`,
                guid: story._id.toString(),
                categories: story.tags || [],
                date: story.createdAt,
                custom_elements: [
                    { 'content:encoded': generateHTMLContent(story, siteUrl) }
                ]
            });
        });

        // Set content type and send
        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(feed.xml());

    } catch (error) {
        console.error("RSS feed error:", error);
        res.status(500).send("Error generating RSS feed");
    }
};

// Generate full HTML content for RSS
const generateHTMLContent = (story, siteUrl) => {
    let html = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">`;

    // Add featured image if exists (you might have this in your Story model)
    if (story.featuredImage) {
        html += `<img src="${story.featuredImage}" alt="${story.title}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">`;
    }

    // Add summary
    if (story.summary) {
        html += `<p style="font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                    ${escapeHtml(story.summary)}
                 </p>`;
    }

    // Add content - simplified for now since TipTap content is complex
    if (story.content) {
        html += `<div style="line-height: 1.8; color: #444;">`;

        // If content is a string
        if (typeof story.content === 'string') {
            html += story.content;
        } else {
            // If content is TipTap JSON, provide a link to full article
            html += `<p>This article contains rich media content. 
                     <a href="${siteUrl}/visualizer/${story._id}" style="color: #FF6B9D;">
                        Read the full article on Spaghetti Bytes →
                     </a></p>`;
        }

        html += `</div>`;
    }

    // Add footer
    html += `
        <hr style="margin: 40px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
            Originally published at 
            <a href="${siteUrl}/visualizer/${story._id}" style="color: #FF6B9D;">
                Spaghetti Bytes
            </a>
        </p>
    `;

    html += `</div>`;
    return html;
};

// Escape HTML special characters
const escapeHtml = (text) => {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
};

// Generate Atom feed (alternative to RSS)
const generateAtomFeed = async (req, res) => {
    try {
        // Get site URL from environment or request
        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

        const stories = await Story.find({})
            .sort({ createdAt: -1 })
            .limit(20);

        let atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>Spaghetti Bytes</title>
    <link href="${siteUrl}/atom.xml" rel="self"/>
    <link href="${siteUrl}/"/>
    <updated>${new Date().toISOString()}</updated>
    <id>${siteUrl}/</id>
    <author>
        <name>Spaghetti Bytes</name>
    </author>
    <subtitle>Untangling code, one byte at a time</subtitle>`;

        stories.forEach(story => {
            atom += `
    <entry>
        <title>${escapeHtml(story.title)}</title>
        <link href="${siteUrl}/visualizer/${story._id}"/>
        <id>${siteUrl}/visualizer/${story._id}</id>
        <updated>${story.createdAt.toISOString()}</updated>
        <summary>${escapeHtml(story.summary || 'Read more on Spaghetti Bytes')}</summary>
        <content type="html">${escapeHtml(generateHTMLContent(story, siteUrl))}</content>
        ${story.tags ? story.tags.map(tag => `<category term="${escapeHtml(tag)}"/>`).join('') : ''}
    </entry>`;
        });

        atom += `
</feed>`;

        res.set('Content-Type', 'application/atom+xml; charset=utf-8');
        res.send(atom);

    } catch (error) {
        console.error("Atom feed error:", error);
        res.status(500).send("Error generating Atom feed");
    }
};

// Generate JSON Feed (modern alternative)
const generateJSONFeed = async (req, res) => {
    try {
        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

        const stories = await Story.find({})
            .sort({ createdAt: -1 })
            .limit(20);

        const jsonFeed = {
            version: "https://jsonfeed.org/version/1.1",
            title: "Spaghetti Bytes",
            home_page_url: siteUrl,
            feed_url: `${siteUrl}/feed.json`,
            description: "Untangling code, one byte at a time",
            icon: `${siteUrl}/logo.png`,
            favicon: `${siteUrl}/favicon.ico`,
            authors: [{
                name: "Spaghetti Bytes"
            }],
            language: "en",
            items: stories.map(story => ({
                id: story._id.toString(),
                url: `${siteUrl}/visualizer/${story._id}`,
                title: story.title,
                summary: story.summary || "Read more on Spaghetti Bytes",
                content_html: generateHTMLContent(story, siteUrl),
                date_published: story.createdAt.toISOString(),
                tags: story.tags || []
            }))
        };

        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(jsonFeed);

    } catch (error) {
        console.error("JSON feed error:", error);
        res.status(500).json({ error: "Error generating JSON feed" });
    }
};

module.exports = {
    generateRSSFeed,
    generateAtomFeed,
    generateJSONFeed
};