// server/server.js - Simplified version for Vercel deployment
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
const Comment = require("./models/Comment");

// Routes
const storyRoutes = require("./routes/storyRoute");
const goalRoutes = require("./routes/goalRoute");
const conversationRoutes = require("./routes/conversationRoute");
const newsletterRoutes = require("./routes/newsletterRoute");
const analyticsRoutes = require("./routes/analyticsRoute");
const rssRoute = require("./routes/rssRoute");
const commentRoutes = require("./routes/commentRoute");

// Middleware
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const { authValidation, sanitizeMongo } = require("./middleware/validation");

const app = express();

// ====================================
// SECURITY MIDDLEWARE
// ====================================

// Trust proxy - important for production
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

// Compression for all responses
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

// MongoDB query sanitization
app.use(mongoSanitize());

// Body parser middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use('/api/', apiLimiter);

// ====================================
// CORS CONFIGURATION
// ====================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'sessionId' // don't use default name
};

app.use(session(sessionConfig));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict'
  }
}));

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

// Login route with rate limiting
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

      // Also create JWT token for API calls
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

// Logout route
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

// Check authentication status
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
// API ROUTES
// ====================================

// Story routes
app.use("/api/stories", storyRoutes);

// Goal routes
app.use("/api/goals", goalRoutes);

// Conversation routes
app.use("/api/conversations", conversationRoutes);

// Newsletter routes
app.use("/api/newsletter", newsletterRoutes);

// Analytics routes (admin only)
app.use("/api/analytics", analyticsRoutes);

// RSS feed routes
app.use("/", rssRoute);

// Comment routes
app.use("/api/comments", commentRoutes);

// ====================================
// STATIC FILES (for production)
// ====================================

if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ====================================
// ERROR HANDLING
// ====================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Don't leak error details in production
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

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Security: Helmet + CORS + Rate Limiting enabled`);
      console.log(`🚄 Performance: Compression enabled`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;