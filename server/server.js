// server/server.js - Final optimized version for Vercel
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const path = require("path");

// Load environment variables
dotenv.config();

// Models
const User = require("./models/User");

// Routes
const storyRoutes = require("./routes/storyRoute");
const goalRoutes = require("./routes/goalRoute");
const conversationRoutes = require("./routes/conversationRoute");
const newsletterRoutes = require("./routes/newsletterRoute");
const analyticsRoutes = require("./routes/analyticsRoute");
const commentRoutes = require("./routes/commentRoute");

// Middleware
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const { authValidation, sanitizeMongo } = require("./middleware/validation");

// Cache middleware
const {
  cacheRSS,
  cacheStory,
  cacheWall,
  cacheAnalytics,
  cacheGoals,
  cacheAdminRoutes
} = require("./middleware/cacheRoutes");

const app = express();

// ====================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ====================================

app.set('trust proxy', 1);

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// MongoDB sanitization
app.use(mongoSanitize());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// ====================================
// CORS CONFIGURATION
// ====================================

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://www.spaghettibytes.blog',
      'https://spaghettibytes.blog',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ====================================
// SESSION CONFIGURATION
// ====================================

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'sessionId'
};

app.use(session(sessionConfig));

// ====================================
// PASSPORT CONFIGURATION
// ====================================

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ====================================
// AUTHENTICATION ROUTES
// ====================================

app.post("/api/login", authLimiter, authValidation.login, async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'default-jwt-secret',
        { expiresIn: '7d' }
      );

      return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
        token
      });
    });
  })(req, res, next);
});

app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destruction failed" });
      }
      res.clearCookie('sessionId');
      res.json({ message: "Logout successful" });
    });
  });
});

app.get("/api/auth/check", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ====================================
// API ROUTES WITH CACHING
// ====================================

// RSS feeds with caching
app.get("/rss.xml", cacheRSS, require("./controllers/rssController").generateRSSFeed);
app.get("/atom.xml", cacheRSS, require("./controllers/rssController").generateAtomFeed);
app.get("/feed.json", cacheRSS, require("./controllers/rssController").generateJSONFeed);

// Stories with caching
app.get("/api/stories", cacheWall, (req, res, next) => {
  storyRoutes(req, res, next);
});
app.get("/api/stories/:id", cacheStory, (req, res, next) => {
  storyRoutes(req, res, next);
});

// Use routes without caching for write operations
app.use("/api/stories", storyRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/comments", commentRoutes);

// Cache admin routes
cacheAdminRoutes(app);

// ====================================
// STATIC FILES (for production)
// ====================================

if (process.env.NODE_ENV === 'production') {
  // Serve optimized images
  app.use('/images', express.static(path.join(__dirname, '../uploads/optimized'), {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }));

  // Serve React build
  app.use(express.static(path.join(__dirname, '../client/build'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.match(/\.[0-9a-f]{8}\./)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ====================================
// ERROR HANDLING
// ====================================

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);

  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ====================================
// DATABASE CONNECTION & SERVER START
// ====================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Security: Helmet + CORS + Rate Limiting enabled`);
      console.log(`🚄 Performance: Compression + Simple Caching enabled`);
      console.log(`📦 Optimizations: Ready for Vercel deployment`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;