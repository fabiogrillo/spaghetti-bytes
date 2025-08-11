// server/server.js
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
const rssRoute = require("./routes/rssRoute");

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
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
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
      'https://spaghetti-bytes.vercel.app'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
};

app.use(cors(corsOptions));

// ====================================
// SESSION CONFIGURATION
// ====================================

// Use SESSION_SECRET from env, fallback to SECRET_KEY if not available
const sessionSecret = process.env.SESSION_SECRET || process.env.SECRET_KEY || 'change-this-secret-key';

const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    // Remove crypto config to avoid encryption issues
    // Let MongoDB handle sessions without additional encryption
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// In production, set the domain for cookies
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.domain = '.spaghettibytes.blog';
}

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
          return done(null, false, { message: "Incorrect email." });
        }

        // Use the comparePassword method if it exists, otherwise use bcrypt directly
        const isMatch = user.comparePassword
          ? await user.comparePassword(password)
          : await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ====================================
// DATABASE CONNECTION
// ====================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Clean up old sessions on startup (optional)
    if (process.env.NODE_ENV === 'development') {
      console.log("🧹 Cleaning up expired sessions...");
      const sessionCollection = mongoose.connection.db.collection('sessions');
      sessionCollection.deleteMany({
        expires: { $lt: new Date() }
      }).then(result => {
        if (result.deletedCount > 0) {
          console.log(`🗑️ Removed ${result.deletedCount} expired sessions`);
        }
      }).catch(err => {
        console.error("Error cleaning sessions:", err);
      });
    }
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1); // Exit if database connection fails
  });

// ====================================
// API ROUTES
// ====================================

app.use("/api/stories", storyRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/", rssRoute); // RSS at root level

// ====================================
// AUTHENTICATION ROUTES
// ====================================

// Register endpoint with validation
app.post("/api/register",
  authLimiter, // Rate limiting for auth endpoints
  authValidation.register, // Input validation
  async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: 'user' // Default role
      });
      await newUser.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error registering user"
      });
    }
  }
);

// Login endpoint with JWT generation
app.post("/api/login",
  authLimiter, // Rate limiting for auth endpoints
  authValidation.login, // Input validation
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({
          success: false,
          message: "Authentication error"
        });
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || "Login failed"
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({
            success: false,
            message: "Login error"
          });
        }

        // Use JWT_SECRET from env, fallback to SECRET_KEY
        const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY || 'your-secret-key';

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            role: user.role || 'user'
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        // Set token as httpOnly cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
          success: true,
          message: "Logged in successfully",
          username: user.username,
          userId: user._id,
          role: user.role || 'user',
          token // Also send token in response for API usage
        });
      });
    })(req, res, next);
  }
);

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout error"
      });
    }

    // Clear the JWT cookie
    res.clearCookie('token');

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
      res.json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });
});

// Check authentication status
app.get("/api/auth/check", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      username: req.user.username,
      userId: req.user._id,
      role: req.user.role || 'user'
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// ====================================
// ERROR HANDLING
// ====================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't expose internal errors to client
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: message
  });
});

// ====================================
// SERVER STARTUP
// ====================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});