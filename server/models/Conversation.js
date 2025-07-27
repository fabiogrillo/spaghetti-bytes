const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  readAt: { type: Date },
  repliedAt: { type: Date }
});

// Update the updatedAt timestamp on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for conversation summary
conversationSchema.virtual('summary').get(function() {
  if (this.messages.length > 0) {
    const userMessages = this.messages.filter(m => m.sender === 'user');
    return userMessages.length > 0 ? userMessages[0].text.substring(0, 100) + '...' : 'No messages';
  }
  return 'Empty conversation';
});

// Method to mark as read
conversationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to mark as replied
conversationSchema.methods.markAsReplied = function() {
  this.status = 'replied';
  this.repliedAt = new Date();
  return this.save();
};

// Static method to get unread count
conversationSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ status: 'new' });
};

// Static method to get recent conversations
conversationSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('userInfo status createdAt summary');
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;