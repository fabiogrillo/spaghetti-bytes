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

// Site URL helper — strips trailing slash from SITE_URL env var
const getSiteUrl = () =>
    (process.env.SITE_URL || 'https://www.spaghettibytes.blog').replace(/\/$/, '');

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
            ? getSiteUrl()
            : 'http://localhost:3000';
        const unsubscribeLink = `${baseUrl}/unsubscribe?token=${subscriber.tokens.unsubscribeToken}`;

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
                    <a href="${getSiteUrl()}">Go to Spaghetti Bytes</a>
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
                <a href="${getSiteUrl()}">Visit Spaghetti Bytes</a>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).send("An error occurred");
    }
};

// Unsubscribe — deletes the subscriber document entirely
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.params;

        const subscriber = await Subscriber.findOneAndDelete({
            'tokens.unsubscribeToken': token
        });

        if (!subscriber) {
            return res.status(404).json({ error: 'Invalid or already-used unsubscribe link' });
        }

        res.status(200).json({ success: true, message: "You've been unsubscribed successfully." });

    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(500).json({ error: "An error occurred. Please try again." });
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

// ─── Shared email wrapper ────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f0ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;border:3px solid #1a1a2e;box-shadow:6px 6px 0 #1a1a2e;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6B9D,#A855F7);padding:32px 40px;text-align:center;border-bottom:3px solid #1a1a2e;">
            <span style="font-size:36px;">🍝</span>
            <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Spaghetti Bytes</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">where code meets flavor</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f6ff;padding:20px 40px;text-align:center;border-top:2px solid #e9e3ff;">
            <p style="margin:0;color:#888;font-size:12px;">
              © ${new Date().getFullYear()} Spaghetti Bytes ·
              <a href="${getSiteUrl()}" style="color:#A855F7;text-decoration:none;">spaghettibytes.blog</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Email templates ──────────────────────────────────────────────────────────
const sendConfirmationEmail = async (subscriber) => {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? getSiteUrl()
        : 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/api/newsletter/confirm/${subscriber.tokens.confirmToken}`;

    await transporter.sendMail({
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "🍝 Confirm your subscription to Spaghetti Bytes",
        html: emailWrapper(`
            <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:800;">Almost there! 🎉</h2>
            <p style="color:#555;line-height:1.6;margin:0 0 24px;">
                Thanks for subscribing! Just one click to confirm your email and join the Spaghetti Club.
            </p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${confirmUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#FF6B9D,#A855F7);color:#fff;
                          padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;
                          text-decoration:none;border:2px solid #1a1a2e;box-shadow:3px 3px 0 #1a1a2e;">
                    ✅ Confirm Subscription
                </a>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                Or copy this link: <a href="${confirmUrl}" style="color:#A855F7;word-break:break-all;">${confirmUrl}</a>
            </p>
            <hr style="border:none;border-top:2px solid #f0ebff;margin:28px 0;">
            <p style="color:#aaa;font-size:12px;text-align:center;margin:0;">
                Didn't subscribe? You can safely ignore this email.
            </p>
        `)
    });
};

const sendWelcomeEmail = async (subscriber) => {
    const siteUrl = getSiteUrl();

    await transporter.sendMail({
        from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "🎉 Welcome to the Spaghetti Club!",
        html: emailWrapper(`
            <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:800;">Welcome to the family! 🍝</h2>
            <p style="color:#555;line-height:1.6;margin:0 0 20px;">
                You're officially part of the <strong>Spaghetti Bytes</strong> community. Here's what's coming your way:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                    <td style="padding:10px 14px;background:#f9f6ff;border-radius:10px;border:2px solid #e9e3ff;margin-bottom:8px;">
                        <span style="font-size:20px;">📚</span>
                        <span style="color:#444;font-size:14px;margin-left:8px;">Weekly articles and tutorials</span>
                    </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                    <td style="padding:10px 14px;background:#f9f6ff;border-radius:10px;border:2px solid #e9e3ff;">
                        <span style="font-size:20px;">💡</span>
                        <span style="color:#444;font-size:14px;margin-left:8px;">Tips, tricks and deep dives</span>
                    </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                    <td style="padding:10px 14px;background:#f9f6ff;border-radius:10px;border:2px solid #e9e3ff;">
                        <span style="font-size:20px;">🚀</span>
                        <span style="color:#444;font-size:14px;margin-left:8px;">Updates on new technologies</span>
                    </td>
                </tr>
            </table>
            <div style="text-align:center;margin:28px 0 0;">
                <a href="${siteUrl}"
                   style="display:inline-block;background:#4ECDC4;color:#1a1a2e;
                          padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;
                          text-decoration:none;border:2px solid #1a1a2e;box-shadow:3px 3px 0 #1a1a2e;">
                    🍝 Read the latest articles
                </a>
            </div>
        `)
    });
};

const sendAdminNotification = async (subscriber) => {
    try {
        await transporter.sendMail({
            from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: "🎉 New Newsletter Subscriber!",
            html: emailWrapper(`
                <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:800;">New subscriber! 🎊</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e9e3ff;border-radius:10px;overflow:hidden;">
                    <tr style="background:#f9f6ff;">
                        <td style="padding:10px 14px;color:#888;font-size:13px;font-weight:600;width:100px;border-bottom:1px solid #e9e3ff;">Email</td>
                        <td style="padding:10px 14px;color:#1a1a2e;font-size:13px;border-bottom:1px solid #e9e3ff;">${subscriber.email}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 14px;color:#888;font-size:13px;font-weight:600;border-bottom:1px solid #e9e3ff;">Source</td>
                        <td style="padding:10px 14px;color:#1a1a2e;font-size:13px;border-bottom:1px solid #e9e3ff;">${subscriber.metadata?.source || 'Unknown'}</td>
                    </tr>
                    <tr style="background:#f9f6ff;">
                        <td style="padding:10px 14px;color:#888;font-size:13px;font-weight:600;">Date</td>
                        <td style="padding:10px 14px;color:#1a1a2e;font-size:13px;">${new Date().toLocaleString('it-IT')}</td>
                    </tr>
                </table>
            `)
        });
    } catch (error) {
        console.error('Failed to send admin notification:', error);
    }
};

// Request unsubscribe link via email (self-service)
const requestUnsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address" });
        }

        const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

        // Always respond the same way to prevent email enumeration
        const genericResponse = {
            success: true,
            message: "If that email is subscribed, you'll receive an unsubscribe link shortly."
        };

        if (!subscriber || subscriber.status === 'unsubscribed') {
            return res.status(200).json(genericResponse);
        }

        // Ensure subscriber has an unsubscribe token
        if (!subscriber.tokens.unsubscribeToken) {
            subscriber.generateTokens();
            await subscriber.save();
        }

        const baseUrl = process.env.NODE_ENV === 'production'
            ? getSiteUrl()
            : 'http://localhost:3000';
        const unsubscribeLink = `${baseUrl}/unsubscribe?token=${subscriber.tokens.unsubscribeToken}`;

        await transporter.sendMail({
            from: `Spaghetti Bytes <${process.env.EMAIL_USER}>`,
            to: subscriber.email,
            subject: "Unsubscribe from Spaghetti Bytes",
            html: emailWrapper(`
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:800;">Unsubscribe request 👋</h2>
                <p style="color:#555;line-height:1.6;margin:0 0 24px;">
                    We received a request to remove this email from Spaghetti Bytes.<br>
                    Click the button below to confirm. If you didn't ask for this, just ignore it.
                </p>
                <div style="text-align:center;margin:32px 0;">
                    <a href="${unsubscribeLink}"
                       style="display:inline-block;background:#888;color:#fff;
                              padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;
                              text-decoration:none;border:2px solid #1a1a2e;box-shadow:3px 3px 0 #1a1a2e;">
                        Confirm Unsubscribe
                    </a>
                </div>
                <p style="color:#aaa;font-size:12px;text-align:center;margin:24px 0 0;">
                    Didn't request this? No action needed — your subscription stays active.
                </p>
            `)
        });

        res.status(200).json(genericResponse);

    } catch (error) {
        console.error("Request unsubscribe error:", error);
        res.status(500).json({ error: "Failed to process request. Please try again." });
    }
};

// Initialize scheduler on module load
initializeScheduler();

module.exports = {
    subscribe,
    confirmSubscription,
    unsubscribe,
    requestUnsubscribe,
    getSubscribers,
    deleteSubscriber,
    getSubscriberStats
};