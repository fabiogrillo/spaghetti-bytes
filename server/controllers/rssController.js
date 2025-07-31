const { Story } = require("../models/Story");
const RSS = require("rss");

// Generate RSS feed
const generateRSSFeed = async (req, res) => {
    try {
        // Create feed instance
        const feed = new RSS({
            title: "Spaghetti Bytes",
            description: "Untangling code, one byte at a time - A technical blog with a cartoon twist",
            feed_url: `${process.env.SITE_URL}/feed.xml`,
            site_url: process.env.SITE_URL,
            image_url: `${process.env.SITE_URL}/logo.png`,
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

        // Get latest stories
        const stories = await Story.find({ published: true })
            .sort({ createdAt: -1 })
            .limit(20); // Last 20 articles

        // Add each story to feed
        stories.forEach(story => {
            // Extract plain text summary from content
            const summary = extractSummary(story.content);

            feed.item({
                title: story.title,
                description: story.summary || summary,
                url: `${process.env.SITE_URL}/story/${story._id}`,
                guid: story._id.toString(),
                categories: story.tags,
                date: story.createdAt,
                custom_elements: [
                    { 'content:encoded': generateHTMLContent(story) }
                ]
            });
        });

        // Set content type and send
        res.set('Content-Type', 'application/rss+xml');
        res.send(feed.xml());

    } catch (error) {
        console.error("RSS feed error:", error);
        res.status(500).send("Error generating RSS feed");
    }
};

// Extract summary from TipTap content
const extractSummary = (content) => {
    if (!content || !content.content) return "";

    let text = "";
    const extractText = (node) => {
        if (node.text) {
            text += node.text + " ";
        }
        if (node.content) {
            node.content.forEach(extractText);
        }
    };

    extractText(content);
    return text.trim().substring(0, 200) + "...";
};

// Generate full HTML content for RSS
const generateHTMLContent = (story) => {
    // Convert TipTap JSON to HTML
    let html = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">`;

    // Add featured image if exists
    if (story.featuredImage) {
        html += `<img src="${story.featuredImage}" alt="${story.title}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">`;
    }

    // Add content
    html += convertTipTapToHTML(story.content);

    // Add footer
    html += `
        <hr style="margin: 40px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
            Originally published at 
            <a href="${process.env.SITE_URL}/story/${story._id}" style="color: #FF6B9D;">
                Spaghetti Bytes
            </a>
        </p>
    `;

    html += `</div>`;
    return html;
};

// Convert TipTap JSON to HTML
const convertTipTapToHTML = (doc) => {
    if (!doc || !doc.content) return "";

    let html = "";

    const processNode = (node) => {
        switch (node.type) {
            case 'paragraph':
                html += `<p>${processContent(node.content)}</p>`;
                break;

            case 'heading':
                const level = node.attrs?.level || 2;
                html += `<h${level}>${processContent(node.content)}</h${level}>`;
                break;

            case 'codeBlock':
                const lang = node.attrs?.language || 'text';
                html += `<pre><code class="language-${lang}">${escapeHtml(node.content?.[0]?.text || '')}</code></pre>`;
                break;

            case 'blockquote':
                html += `<blockquote>${processContent(node.content)}</blockquote>`;
                break;

            case 'bulletList':
                html += `<ul>${processContent(node.content)}</ul>`;
                break;

            case 'orderedList':
                html += `<ol>${processContent(node.content)}</ol>`;
                break;

            case 'listItem':
                html += `<li>${processContent(node.content)}</li>`;
                break;

            case 'image':
                html += `<img src="${node.attrs.src}" alt="${node.attrs.alt || ''}" style="max-width: 100%; height: auto;">`;
                break;

            case 'horizontalRule':
                html += '<hr>';
                break;

            default:
                if (node.content) {
                    html += processContent(node.content);
                }
        }
    };

    const processContent = (content) => {
        if (!content) return "";

        return content.map(item => {
            if (item.type === 'text') {
                let text = escapeHtml(item.text);

                // Apply marks
                if (item.marks) {
                    item.marks.forEach(mark => {
                        switch (mark.type) {
                            case 'bold':
                                text = `<strong>${text}</strong>`;
                                break;
                            case 'italic':
                                text = `<em>${text}</em>`;
                                break;
                            case 'code':
                                text = `<code>${text}</code>`;
                                break;
                            case 'link':
                                text = `<a href="${mark.attrs.href}" target="_blank">${text}</a>`;
                                break;
                        }
                    });
                }

                return text;
            } else {
                let nodeHtml = "";
                const tempHtml = html;
                html = "";
                processNode(item);
                nodeHtml = html;
                html = tempHtml;
                return nodeHtml;
            }
        }).join('');
    };

    if (doc.content) {
        doc.content.forEach(processNode);
    }

    return html;
};

// Escape HTML special characters
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// Generate Atom feed (alternative to RSS)
const generateAtomFeed = async (req, res) => {
    try {
        const stories = await Story.find({ published: true })
            .sort({ createdAt: -1 })
            .limit(20);

        let atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>Spaghetti Bytes</title>
    <link href="${process.env.SITE_URL}/atom.xml" rel="self"/>
    <link href="${process.env.SITE_URL}/"/>
    <updated>${new Date().toISOString()}</updated>
    <id>${process.env.SITE_URL}/</id>
    <author>
        <name>Spaghetti Bytes</name>
    </author>
    <subtitle>Untangling code, one byte at a time</subtitle>`;

        stories.forEach(story => {
            const summary = story.summary || extractSummary(story.content);
            atom += `
    <entry>
        <title>${escapeHtml(story.title)}</title>
        <link href="${process.env.SITE_URL}/story/${story._id}"/>
        <id>${process.env.SITE_URL}/story/${story._id}</id>
        <updated>${story.createdAt.toISOString()}</updated>
        <summary>${escapeHtml(summary)}</summary>
        <content type="html">${escapeHtml(generateHTMLContent(story))}</content>
        ${story.tags.map(tag => `<category term="${escapeHtml(tag)}"/>`).join('')}
    </entry>`;
        });

        atom += `
</feed>`;

        res.set('Content-Type', 'application/atom+xml');
        res.send(atom);

    } catch (error) {
        console.error("Atom feed error:", error);
        res.status(500).send("Error generating Atom feed");
    }
};

module.exports = {
    generateRSSFeed,
    generateAtomFeed
};