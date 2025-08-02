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

// Body parser middleware
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
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Session configuration - MUST come before passport.initialize()
const sessionConfig = {
  secret: process.env.SESSION_SECRET || process.env.SECRET_KEY || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// In production, we need to set the domain
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.domain = '.spaghettibytes.blog'; // allows subdomains
}

app.use(session(sessionConfig));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
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

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if can't connect to DB
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    env: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// API Routes with error handling wrapper
app.use("/api/stories", storyRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/", rssRoute); // RSS at root level
app.use("/api/upload", imageUploadRoutes);

// Auth routes with better error handling
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
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
  if (req.isAuthenticated()) {
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

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Global error handling middleware
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
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({
      code: "500",
      message: "Database error occurred"
    });
  }

  // Default error response
  res.status(500).json({
    code: "500",
    message: "A server error has occurred",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    code: "404",
    message: "Route not found"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});