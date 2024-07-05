const mongoose = require("mongoose");
const express = require("express");
const app = express();

// Carica le variabili d'ambiente dal file .env
require("dotenv").config();

// Prendi la stringa di connessione dal file .env
const MONGODB_URI = process.env.MONGODB_URI;

// Connettiti a MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Configura un semplice endpoint per testare il server
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Avvia il server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
