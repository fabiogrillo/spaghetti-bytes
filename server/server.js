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
const path = require("path");

// Load environment variables
dotenv.config();

// CRITICAL: Verify MongoDB URI exists
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables!");
  process.exit(1);
}

// Models
const User = require("./models/User");

// Routes
const storyRoutes = require("./routes/storyRoute");
const goalRoutes = require("./routes/goalRoute");
const conversationRoutes = require("./routes/conversationRoute");
const newsletterRoutes = require("./routes/newsletterRoute");
const analyticsRoutes = require("./routes/analyticsRoute");
const rssRoute = require("./routes/rssRoute");
const imageUploadRoutes = require("./routes/imageUploadRoute");

const app = express();

// Trust proxy - important for production
app.set('trust proxy', 1);

// Body parser middleware - MUST be before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration - MUST come before routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://www.spaghettibytes.blog',
      'https://spaghettibytes.blog',
      'https://spaghetti-bytes.vercel.app',
      // Add any other Vercel preview URLs
      /https:\/\/spaghetti-bytes-.*\.vercel\.app$/
    ];

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Connect to MongoDB BEFORE setting up session store
let mongooseConnection;
const connectDB = async () => {
  try {
    mongooseConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("✅ Connected to MongoDB successfully");
    return mongooseConnection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Don't exit in production - let Vercel handle retries
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw err;
  }
};

// Initialize database connection
connectDB().then(() => {
  // Session configuration - ONLY after MongoDB is connected
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || process.env.SECRET_KEY || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
      domain: process.env.NODE_ENV === 'production' ? '.spaghettibytes.blog' : undefined
    }
  };

  app.use(session(sessionConfig));

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            return done(null, false, { message: "User not found." });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        } catch (err) {
          console.error("Passport authentication error:", err);
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
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error("Passport deserialize error:", err);
      done(err);
    }
  });

  // Health check endpoint - MUST be before other routes
  app.get('/api/health', async (req, res) => {
    try {
      // Check MongoDB connection
      const dbState = mongoose.connection.readyState;
      const isConnected = dbState === 1;

      // Try a simple database operation
      if (isConnected) {
        await mongoose.connection.db.admin().ping();
      }

      res.json({
        status: isConnected ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        mongoConnected: isConnected,
        mongoState: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState],
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        mongoConnected: false,
        error: error.message,
        environment: process.env.NODE_ENV || 'development'
      });
    }
  });

  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'API is working',
      env: process.env.NODE_ENV,
      mongoConnected: mongoose.connection.readyState === 1,
      headers: req.headers
    });
  });

  // API Routes with proper error handling
  app.use("/api/stories", wrapAsync(storyRoutes));
  app.use("/api/goals", wrapAsync(goalRoutes));
  app.use("/api/conversations", conversationRoutes);
  app.use("/api/newsletter", newsletterRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/", rssRoute); // RSS at root level
  app.use("/api/upload", imageUploadRoutes);

  // Auth routes with better error handling
  app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword
      });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Error registering user",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for:", req.body.email);

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({
          message: "Authentication error",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Login failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({
            message: "Login error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
        res.json({
          message: "Logged in successfully",
          username: user.username,
          userId: user.id
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "Logout error",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({
            message: "Session destruction error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Check auth status endpoint
  app.get("/api/auth/check", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json({
        authenticated: true,
        username: req.user.username,
        userId: req.user.id
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../client/build")));

    // Catch all handler - MUST be last
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    });
  }

  // Global error handling middleware - MUST be last
  app.use((err, req, res, next) => {
    console.error("Global error handler:", err.stack);

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({
        code: "403",
        message: "CORS policy violation"
      });
    }

    // MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongooseError' || err.name === 'MongoNetworkError') {
      return res.status(500).json({
        code: "500",
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Default error response
    res.status(err.status || 500).json({
      code: err.status || "500",
      message: err.message || "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

}).catch(err => {
  console.error("Failed to initialize application:", err);
  process.exit(1);
});

// Helper function to wrap async routes
function wrapAsync(router) {
  const wrappedRouter = express.Router();

  // Get all routes from the original router
  router.stack.forEach(layer => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods);

      methods.forEach(method => {
        const originalHandler = layer.route.stack.find(l => l.method === method).handle;

        wrappedRouter[method](path, async (req, res, next) => {
          try {
            await originalHandler(req, res, next);
          } catch (error) {
            next(error);
          }
        });
      });
    }
  });

  return wrappedRouter;
}

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;