const { Subscriber, Campaign } = require("../models/Newsletter");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Bull = require("bull");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configure email queue for batch sending
const emailQueue = new Bull('email-queue', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1'
    }
});

// Process email queue
emailQueue.process(async (job) => {
    const { campaignId, subscriberBatch } = job.data;

    for (const subscriber of subscriberBatch) {
        await sendCampaignEmail(campaignId, subscriber);
        // Small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
    }
});

// Subscribe to newsletter
const subscribe = async (req, res) => {
    try {
        const { email, source, referrer } = req.body;

        // Check if already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            if (subscriber.status === 'active') {
                return res.status(400).json({
                    error: "You're already subscribed!"
                });
            } else if (subscriber.status === 'unsubscribed') {
                // Reactivate subscription
                subscriber.status = 'pending';
                subscriber.dates.subscribedAt = new Date();
                subscriber.generateTokens();
            }
        } else {
            // Create new subscriber
            subscriber = new Subscriber({
                email,
                metadata: {
                    source,
                    referrer,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
            subscriber.generateTokens();
        }

        await subscriber.save();

        // Send confirmation email
        await sendConfirmationEmail(subscriber);

        res.status(201).json({
            success: true,
            message: "Thanks for subscribing! Please check your email to confirm."
        });

    } catch (error) {
        console.error("Subscribe error:", error);
        res.status(500).json({
            error: "Failed to subscribe. Please try again."
        });
    }
};

// Confirm subscription
const confirmSubscription = async (req, res) => {
    try {
        const { token } = req.params;

        const subscriber = await Subscriber.findOne({
            'tokens.confirmToken': token,
            status: 'pending'
        });

        if (!subscriber) {
            return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>Invalid or Expired Link</h1>
            <p>This confirmation link is invalid or has expired.</p>
            <a href="${process.env.SITE_URL}">Go to Spaghetti Bytes</a>
          </body>
        </html>
      `);
        }

        subscriber.status = 'active';
        subscriber.dates.confirmedAt = new Date();
        subscriber.tokens.confirmToken = undefined;
        await subscriber.save();

        // Send welcome email
        await sendWelcomeEmail(subscriber);

        // Send admin notification
        await sendAdminNotification(subscriber);

        res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🎉 Welcome to Spaghetti Bytes!</h1>
          <p>Your subscription has been confirmed.</p>
          <p>You'll receive our next newsletter in your inbox.</p>
          <a href="${process.env.SITE_URL}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #FF6B9D; color: white; text-decoration: none; border-radius: 5px;">
            Visit Spaghetti Bytes
          </a>
        </body>
      </html>
    `);

    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).send("An error occurred");
    }
};

// Admin notification for new subscribers
const sendAdminNotification = async (subscriber) => {
    const adminMailOptions = {
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "🎉 New Newsletter Subscriber!",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>New Subscriber Confirmed</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.status}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.metadata.source || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Referrer:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.metadata.referrer || 'Direct'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>IP Address:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.metadata.ipAddress || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>User Agent:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;" style="word-break: break-all;">${subscriber.metadata.userAgent || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subscribed:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(subscriber.dates.subscribedAt).toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Confirmed:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(subscriber.dates.confirmedAt).toLocaleString()}</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px;">
                <a href="${process.env.SITE_URL}/newsletter/manager" style="background-color: #4ECDC4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    View in Dashboard
                </a>
            </p>
        </div>
        `
    };

    await transporter.sendMail(adminMailOptions);
};

// Get subscriber stats
const getSubscriberStats = async (req, res) => {
    try {
        const active = await Subscriber.countDocuments({ status: 'active' });
        const total = await Subscriber.countDocuments();
        const pending = await Subscriber.countDocuments({ status: 'pending' });
        const unsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });

        res.json({
            active,
            total,
            pending,
            unsubscribed,
            growth: {
                // Calculate growth stats here
                thisMonth: 0,
                lastMonth: 0,
                percentChange: 0
            }
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

// Create campaign
const createCampaign = async (req, res) => {
    try {
        const { subject, preheader, content, schedule } = req.body;

        const campaign = new Campaign({
            subject,
            preheader,
            content,
            schedule,
            createdBy: req.user._id
        });

        await campaign.save();

        res.status(201).json({
            success: true,
            campaign
        });
    } catch (error) {
        console.error("Create campaign error:", error);
        res.status(500).json({ error: "Failed to create campaign" });
    }
};

// Get campaigns
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username email');

        res.json({ campaigns });
    } catch (error) {
        console.error("Get campaigns error:", error);
        res.status(500).json({ error: "Failed to fetch campaigns" });
    }
};

// Send campaign
const sendCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.status !== 'draft') {
            return res.status(400).json({ error: "Campaign already sent or scheduled" });
        }

        // Get active subscribers
        const subscribers = await Subscriber.find({ status: 'active' });

        // Update campaign status
        campaign.status = 'sending';
        campaign.recipients.total = subscribers.length;
        await campaign.save();

        // Batch subscribers for queue processing
        const batchSize = 50;
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);
            await emailQueue.add({
                campaignId: campaign._id,
                subscriberBatch: batch
            });
        }

        res.json({
            success: true,
            message: `Campaign queued for ${subscribers.length} subscribers`
        });

    } catch (error) {
        console.error("Send campaign error:", error);
        res.status(500).json({ error: "Failed to send campaign" });
    }
};

// Send individual campaign email
const sendCampaignEmail = async (campaignId, subscriber) => {
    try {
        const campaign = await Campaign.findById(campaignId);

        // Personalize content
        let htmlContent = campaign.content.html;
        htmlContent = htmlContent.replace(/{{email}}/g, subscriber.email);
        htmlContent = htmlContent.replace(/{{unsubscribe_link}}/g,
            `${process.env.SITE_URL}/api/newsletter/unsubscribe/${subscriber.tokens.unsubscribeToken}`
        );

        const mailOptions = {
            from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
            to: subscriber.email,
            subject: campaign.subject,
            html: htmlContent,
            text: campaign.content.text
        };

        await transporter.sendMail(mailOptions);

        // Update campaign stats
        await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { 'recipients.sent': 1 }
        });

    } catch (error) {
        console.error("Send email error:", error);
    }
};

// Email templates
const sendConfirmationEmail = async (subscriber) => {
    const confirmUrl = `${process.env.SITE_URL}/api/newsletter/confirm/${subscriber.tokens.confirmToken}`;

    const mailOptions = {
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "🍝 Confirm your subscription to Spaghetti Bytes",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6B9D; text-align: center;">Almost there!</h1>
        
        <p>Hi there!</p>
        
        <p>Thanks for subscribing to Spaghetti Bytes newsletter. 
        Just one more step - please confirm your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background-color: #FF6B9D; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Confirm Subscription
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link: ${confirmUrl}
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          If you didn't subscribe to our newsletter, you can safely ignore this email.
        </p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (subscriber) => {
    const unsubscribeUrl = `${process.env.SITE_URL}/api/newsletter/unsubscribe/${subscriber.tokens.unsubscribeToken}`;

    const mailOptions = {
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "🎉 Welcome to Spaghetti Bytes!",
        html: getEmailTemplate('welcome', {
            unsubscribeUrl
        })
    };

    await transporter.sendMail(mailOptions);
};

// Email template system
const getEmailTemplate = (templateName, variables = {}) => {
    const templates = {
        welcome: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #FF6B9D; padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 36px;">🍝</h1>
                    <h2 style="color: white; margin: 10px 0;">Welcome to Spaghetti Bytes!</h2>
                </div>
                
                <div style="padding: 40px 20px;">
                    <p style="font-size: 18px; color: #333;">Hey there, fellow code chef! 👨‍🍳</p>
                    
                    <p>Welcome to Spaghetti Bytes! You're now part of an exclusive group that gets:</p>
                    
                    <ul style="line-height: 2;">
                        <li>🍝 Weekly digest of the best coding recipes</li>
                        <li>🚀 Early access to new articles and resources</li>
                        <li>💡 Exclusive tips that don't make it to the blog</li>
                        <li>🎁 Occasional surprises and goodies</li>
                    </ul>
                    
                    <p>Keep an eye on your inbox - the next newsletter is coming soon!</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${process.env.SITE_URL}/blog" style="background-color: #4ECDC4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                            Browse Articles
                        </a>
                    </div>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        You're receiving this because you subscribed to Spaghetti Bytes.<br>
                        <a href="${variables.unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | 
                        <a href="${process.env.SITE_URL}/privacy" style="color: #666;">Privacy Policy</a>
                    </p>
                </div>
            </div>
        `,

        newsletter: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #FF6B9D; padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 36px;">🍝</h1>
                    <h2 style="color: white; margin: 10px 0;">{{subject}}</h2>
                </div>
                
                <div style="padding: 40px 20px;">
                    {{content}}
                </div>
                
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        You're receiving this because you subscribed to Spaghetti Bytes.<br>
                        <a href="{{unsubscribe_link}}" style="color: #666;">Unsubscribe</a> | 
                        <a href="${process.env.SITE_URL}/privacy" style="color: #666;">Privacy Policy</a>
                    </p>
                </div>
            </div>
        `
    };

    // Replace variables in template
    let template = templates[templateName] || templates.newsletter;
    Object.keys(variables).forEach(key => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });

    return template;
};

// Unsubscribe
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.params;

        const subscriber = await Subscriber.findOne({
            'tokens.unsubscribeToken': token
        });

        if (!subscriber) {
            return res.status(404).send("Invalid unsubscribe link");
        }

        subscriber.status = 'unsubscribed';
        subscriber.dates.unsubscribedAt = new Date();
        await subscriber.save();

        res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>You've been unsubscribed</h1>
          <p>We're sorry to see you go! 😢</p>
          <p>You won't receive any more emails from us.</p>
          <a href="${process.env.SITE_URL}">Visit Spaghetti Bytes</a>
        </body>
      </html>
    `);

    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(500).send("An error occurred");
    }
};

// Get subscribers (admin only)
const getSubscribers = async (req, res) => {
    try {
        const { status = 'active', page = 1, limit = 50 } = req.query;

        const subscribers = await Subscriber.find({ status })
            .sort({ 'dates.subscribedAt': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Subscriber.countDocuments({ status });

        res.json({
            subscribers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get subscribers error:", error);
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        // For now, return mock data
        res.json({
            overview: {
                totalSubscribers: await Subscriber.countDocuments(),
                activeSubscribers: await Subscriber.countDocuments({ status: 'active' }),
                monthlyGrowth: 12.5,
                avgOpenRate: 24.5,
                avgClickRate: 8.3
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};

module.exports = {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers,
    getSubscriberStats,
    createCampaign,
    getCampaigns,
    sendCampaign,
    getAnalytics
};