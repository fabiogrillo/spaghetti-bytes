const { Subscriber, Campaign } = require("../models/Newsletter");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cron = require("node-cron");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Store scheduled tasks
const scheduledTasks = new Map();

// Initialize scheduler for campaigns
const initializeScheduler = async () => {
    try {
        // Load all scheduled campaigns on server start
        const scheduledCampaigns = await Campaign.find({
            status: 'scheduled',
            'schedule.sendAt': { $gte: new Date() }
        });

        scheduledCampaigns.forEach(campaign => {
            scheduleEmailCampaign(campaign);
        });

        console.log(`Initialized ${scheduledCampaigns.length} scheduled campaigns`);
    } catch (error) {
        console.error('Error initializing scheduler:', error);
    }
};

// Schedule a campaign
const scheduleEmailCampaign = (campaign) => {
    const sendDate = new Date(campaign.schedule.sendAt);
    const now = new Date();

    if (sendDate <= now) {
        // Send immediately if time has passed
        processCampaignSending(campaign._id);
    } else {
        // Schedule for future
        const timeout = sendDate - now;
        const timeoutId = setTimeout(() => {
            processCampaignSending(campaign._id);
        }, timeout);

        scheduledTasks.set(campaign._id.toString(), timeoutId);
    }
};

// Process campaign sending
const processCampaignSending = async (campaignId) => {
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign || campaign.status === 'sent') {
            return;
        }

        // Update status to sending
        campaign.status = 'sending';
        await campaign.save();

        // Get active subscribers
        const subscribers = await Subscriber.find({ status: 'active' });

        campaign.recipients.total = subscribers.length;
        await campaign.save();

        // Send emails in batches
        const batchSize = 10;
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            // Send emails in parallel within batch
            await Promise.all(batch.map(subscriber =>
                sendCampaignEmail(campaign, subscriber)
            ));

            // Small delay between batches
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Update campaign status
        campaign.status = 'sent';
        campaign.sentAt = new Date();
        await campaign.save();

        // Remove from scheduled tasks
        scheduledTasks.delete(campaignId.toString());

        console.log(`Campaign ${campaignId} sent to ${subscribers.length} subscribers`);
    } catch (error) {
        console.error('Error processing campaign:', error);

        // Update campaign status to failed
        await Campaign.findByIdAndUpdate(campaignId, {
            status: 'failed',
            error: error.message
        });
    }
};

// Send individual campaign email
const sendCampaignEmail = async (campaign, subscriber) => {
    try {
        // Personalize content
        let htmlContent = campaign.content.html || '';
        let textContent = campaign.content.text || '';

        // Replace placeholders  
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? (process.env.SITE_URL || 'https://www.spaghettibytes.blog')
            : 'http://localhost:3000';
        const unsubscribeLink = `${baseUrl}/api/newsletter/unsubscribe/${subscriber.tokens.unsubscribeToken}`;

        htmlContent = htmlContent
            .replace(/{{email}}/g, subscriber.email)
            .replace(/{{unsubscribe_link}}/g, unsubscribeLink);

        textContent = textContent
            .replace(/{{email}}/g, subscriber.email)
            .replace(/{{unsubscribe_link}}/g, unsubscribeLink);

        // Add unsubscribe footer if not present
        if (!htmlContent.includes('unsubscribe')) {
            htmlContent += `
                <hr style="margin-top: 40px; border: 1px solid #eee;">
                <p style="text-align: center; color: #999; font-size: 12px;">
                    You received this email because you're subscribed to Spaghetti Bytes.<br>
                    <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe</a>
                </p>
            `;
        }

        const mailOptions = {
            from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
            to: subscriber.email,
            subject: campaign.subject,
            html: htmlContent,
            text: textContent || 'Please view this email in HTML format'
        };

        await transporter.sendMail(mailOptions);

        // Update campaign stats
        await Campaign.findByIdAndUpdate(campaign._id, {
            $inc: { 'recipients.sent': 1 }
        });

        // Update subscriber engagement
        subscriber.engagement.lastSent = new Date();
        await subscriber.save();

        return { success: true, email: subscriber.email };
    } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error.message);

        // Update bounce status if permanent failure
        if (error.responseCode >= 500) {
            subscriber.engagement.bounced = true;
            await subscriber.save();
        }

        return { success: false, email: subscriber.email, error: error.message };
    }
};

// Subscribe to newsletter
const subscribe = async (req, res) => {
    try {
        const { email, source, referrer } = req.body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Please provide a valid email address"
            });
        }

        // Check if already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            if (subscriber.status === 'active') {
                return res.status(409).json({
                    error: "You're already subscribed to our newsletter!",
                    success: false
                });
            } else if (subscriber.status === 'pending') {
                // Resend confirmation email for pending subscriptions
                await sendConfirmationEmail(subscriber);
                return res.status(200).json({
                    success: true,
                    message: "Confirmation email resent! Please check your inbox."
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
                    source: source || 'website',
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
                <head>
                    <title>Invalid Link</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; }
                        h1 { color: #FF6B9D; }
                        a { display: inline-block; margin-top: 20px; padding: 10px 20px; 
                            background: #FF6B9D; color: white; text-decoration: none; 
                            border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Invalid or Expired Link</h1>
                    <p>This confirmation link is invalid or has expired.</p>
                    <a href="${process.env.SITE_URL || 'https://www.spaghettibytes.blog'}">Go to Spaghetti Bytes</a>
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
        if (process.env.ADMIN_EMAIL) {
            await sendAdminNotification(subscriber);
        }

        res.send(`
            <html>
            <head>
                <title>Welcome!</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    h1 { color: #4ECDC4; }
                    a { display: inline-block; margin-top: 20px; padding: 10px 20px; 
                        background: #FF6B9D; color: white; text-decoration: none; 
                        border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>🎉 Welcome to Spaghetti Bytes!</h1>
                <p>Your subscription has been confirmed.</p>
                <p>You'll receive our next newsletter in your inbox.</p>
                <a href="${process.env.SITE_URL || 'https://www.spaghettibytes.blog'}">Visit Spaghetti Bytes</a>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).send("An error occurred");
    }
};

// Unsubscribe
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.params;

        const subscriber = await Subscriber.findOne({
            'tokens.unsubscribeToken': token
        });

        if (!subscriber) {
            return res.status(404).send('Invalid unsubscribe link');
        }

        subscriber.status = 'unsubscribed';
        subscriber.dates.unsubscribedAt = new Date();
        await subscriber.save();

        res.send(`
            <html>
            <head>
                <title>Unsubscribed</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    h1 { color: #666; }
                </style>
            </head>
            <body>
                <h1>You've been unsubscribed</h1>
                <p>We're sorry to see you go!</p>
                <p>You won't receive any more emails from us.</p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(500).send("An error occurred");
    }
};

// Get all subscribers
const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find()
            .sort({ 'dates.subscribedAt': -1 })
            .select('-tokens'); // Don't send tokens to frontend

        res.json({ subscribers });
    } catch (error) {
        console.error("Get subscribers error:", error);
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
};

// Delete subscriber
const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;

        const subscriber = await Subscriber.findByIdAndDelete(id);

        if (!subscriber) {
            return res.status(404).json({ error: "Subscriber not found" });
        }

        res.json({
            success: true,
            message: "Subscriber deleted successfully"
        });
    } catch (error) {
        console.error("Delete subscriber error:", error);
        res.status(500).json({ error: "Failed to delete subscriber" });
    }
};

// Create campaign
const createCampaign = async (req, res) => {
    try {
        const { subject, preheader, content, schedule } = req.body;

        // Validate required fields
        if (!subject || !content) {
            return res.status(400).json({
                error: "Subject and content are required"
            });
        }

        const campaign = new Campaign({
            subject,
            preheader: preheader || '',
            content: {
                html: content.html || content,
                text: content.text || ''
            },
            schedule: schedule || {},
            status: schedule?.sendAt ? 'scheduled' : 'draft',
            createdBy: req.user?._id
        });

        await campaign.save();

        // Schedule if needed
        if (schedule?.sendAt) {
            scheduleEmailCampaign(campaign);
        }

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

// Send campaign immediately
const sendCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.status === 'sent') {
            return res.status(400).json({ error: "Campaign already sent" });
        }

        // Process sending immediately
        processCampaignSending(campaignId);

        res.json({
            success: true,
            message: "Campaign sending started"
        });

    } catch (error) {
        console.error("Send campaign error:", error);
        res.status(500).json({ error: "Failed to send campaign" });
    }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Cancel scheduled task if exists
        if (scheduledTasks.has(campaignId)) {
            clearTimeout(scheduledTasks.get(campaignId));
            scheduledTasks.delete(campaignId);
        }

        const campaign = await Campaign.findByIdAndDelete(campaignId);

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        res.json({
            success: true,
            message: "Campaign deleted successfully"
        });
    } catch (error) {
        console.error("Delete campaign error:", error);
        res.status(500).json({ error: "Failed to delete campaign" });
    }
};

// Get subscriber stats
const getSubscriberStats = async (req, res) => {
    try {
        const active = await Subscriber.countDocuments({ status: 'active' });
        const total = await Subscriber.countDocuments();
        const pending = await Subscriber.countDocuments({ status: 'pending' });
        const unsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });

        // Calculate growth
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonth = await Subscriber.countDocuments({
            'dates.subscribedAt': { $gte: startOfMonth }
        });

        const lastMonth = await Subscriber.countDocuments({
            'dates.subscribedAt': {
                $gte: startOfLastMonth,
                $lt: startOfMonth
            }
        });

        const percentChange = lastMonth > 0
            ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
            : 100;

        // Calculate source breakdown
        const sourceStats = await Subscriber.aggregate([
            { $match: { status: { $ne: 'unsubscribed' } } },
            {
                $group: {
                    _id: '$metadata.source',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const totalActiveSubscribers = active + pending;
        const sourceBreakdown = sourceStats.map(stat => ({
            name: stat._id || 'Unknown',
            value: totalActiveSubscribers > 0 ? Math.round((stat.count / totalActiveSubscribers) * 100) : 0,
            count: stat.count
        }));

        res.json({
            active,
            total,
            pending,
            unsubscribed,
            growth: {
                thisMonth,
                lastMonth,
                percentChange: parseFloat(percentChange)
            },
            sourceBreakdown
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

// Email templates
const sendConfirmationEmail = async (subscriber) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.SITE_URL || 'https://www.spaghettibytes.blog')
        : 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/api/newsletter/confirm/${subscriber.tokens.confirmToken}`;

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
                    <a href="${confirmUrl}" 
                       style="background-color: #FF6B9D; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 25px; display: inline-block;">
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
    const mailOptions = {
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "🎉 Welcome to Spaghetti Bytes!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4ECDC4; text-align: center;">Welcome to the family!</h1>
                
                <p>Hi there!</p>
                
                <p>Your subscription is confirmed! You're now part of the Spaghetti Bytes community.</p>
                
                <p>Here's what you can expect:</p>
                <ul>
                    <li>📚 Weekly technical articles and tutorials</li>
                    <li>💡 Tips and tricks for better coding</li>
                    <li>🚀 Updates on new technologies</li>
                    <li>🍝 A dash of humor with your tech</li>
                </ul>
                
                <p>Stay tuned for our next newsletter!</p>
                
                <hr style="border: 1px solid #eee; margin: 30px 0;">
                
                <p style="text-align: center;">
                    <a href="${process.env.SITE_URL || 'https://www.spaghettibytes.blog'}" 
                       style="color: #FF6B9D;">Visit Spaghetti Bytes</a>
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendAdminNotification = async (subscriber) => {
    const mailOptions = {
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "🎉 New Newsletter Subscriber!",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>New Subscriber Alert!</h2>
                <p>A new user has subscribed to the newsletter:</p>
                <table style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${subscriber.metadata?.source || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
                    </tr>
                </table>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send admin notification:', error);
    }
};

// Initialize scheduler on module load
initializeScheduler();

module.exports = {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers,
    deleteSubscriber,
    createCampaign,
    getCampaigns,
    sendCampaign,
    deleteCampaign,
    getSubscriberStats
};