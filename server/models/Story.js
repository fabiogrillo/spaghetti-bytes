const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  tags: { type: [String], required: true },
  content: { type: Object, required: true },
  sharedOnMedium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  reactions: {
    love: { type: Number, default: 0 },
    spaghetti: { type: Number, default: 0 },
    fire: { type: Number, default: 0 },
    mind_blown: { type: Number, default: 0 },
    clap: { type: Number, default: 0 }
  }
});

// Add indexes for better query performance
storySchema.index({ createdAt: -1 });
storySchema.index({ title: 'text', summary: 'text' });
storySchema.index({ 'reactions.love': -1 });
storySchema.index({ 'reactions.clap': -1 });
storySchema.index({ tags: 1 });

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
