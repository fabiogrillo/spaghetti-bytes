const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const session = require("express-session");
const dotenv = require("dotenv");
const User = require("./models/User");
const storyRoutes = require("./routes/storyRoute");

// Configurazione variabili ambiente
dotenv.config();

// Inizializzare Express
const app = express();

// Middleware per parsing del corpo delle richieste
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione della sessione
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Inizializzare Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurazione Passport
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
    done(err);
  }
});

// Connessione a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Route di registrazione
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
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Route di login
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in successfully", username: req.user.username });
});

// Route di logout
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Configurazione della rotta per le storie
app.use("/api/stories", storyRoutes);

// Avvio del server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
