const Analytics = require("../models/Analytics");
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const trackPageView = async (req, res, next) => {
    try {
        // Skip tracking for admin and API routes
        if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) {
            return next();
        }

        const parser = new UAParser();
        const ua = parser.setUA(req.headers['user-agent']).getResult();
        const geo = geoip.lookup(req.ip);

        const analyticsData = {
            path: req.path,
            sessionId: req.sessionID,
            userId: req.user?._id,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            country: geo?.country,
            city: geo?.city,
            referrer: req.headers.referer || 'direct',
            device: {
                type: ua.device.type || 'desktop',
                browser: ua.browser.name,
                os: ua.os.name
            }
        };

        await Analytics.create(analyticsData);
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }

    next();
};

module.exports = { trackPageView };