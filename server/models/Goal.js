// models/Goal.js
const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  steps: [stepSchema],
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
goalSchema.index({ createdAt: -1 });
goalSchema.index({ 'steps.completed': 1 });

const Goal = mongoose.model("Goal", goalSchema);

module.exports = Goal;
