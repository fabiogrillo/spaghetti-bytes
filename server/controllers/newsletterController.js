const { Subscriber, Campaign } = require("../models/Newsletter");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6B9D; text-align: center;">Welcome to the Club!</h1>
        
        <p>Hey there, fellow code chef! 👨‍🍳</p>
        
        <p>Welcome to Spaghetti Bytes! You're now part of an exclusive group that gets:</p>
        
        <ul>
          <li>🍝 Weekly digest of the best coding recipes</li>
          <li>🚀 Early access to new articles and resources</li>
          <li>💡 Exclusive tips that don't make it to the blog</li>
          <li>🎁 Occasional surprises and goodies</li>
        </ul>
        
        <p>Keep an eye on your inbox - the next newsletter is coming soon!</p>
        
        <p>In the meantime, check out some popular articles:</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.SITE_URL}/blog" style="background-color: #4ECDC4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; display: inline-block;">
            Browse Articles
          </a>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> | 
          <a href="${process.env.SITE_URL}/privacy" style="color: #999;">Privacy Policy</a>
        </p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscribers
};