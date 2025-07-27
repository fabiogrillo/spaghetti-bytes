const express = require("express");
const router = express.Router();
const {
  createConversation,
  getConversations,
  getConversationById,
  updateConversationStatus,
  addReply,
  deleteConversation,
  getConversationStats
} = require("../controllers/conversationController");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Public route - create new conversation
router.post("/", createConversation);

// Protected routes - require authentication
router.get("/", isAuthenticated, getConversations);
router.get("/stats", isAuthenticated, getConversationStats);
router.get("/:id", isAuthenticated, getConversationById);
router.put("/:id", isAuthenticated, updateConversationStatus);
router.post("/:id/reply", isAuthenticated, addReply);
router.delete("/:id", isAuthenticated, deleteConversation);

module.exports = router;