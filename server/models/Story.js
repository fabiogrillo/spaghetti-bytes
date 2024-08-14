const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  tags: { type: [String], required: true },
  content: { type: Object, required: true },
  sharedOnMedium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
