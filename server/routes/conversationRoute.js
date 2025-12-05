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
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Public route - create new conversation
router.post("/", createConversation);

// Protected routes - require authentication (admin only for conversation management)
router.get("/", requireAuth, requireAdmin, getConversations);
router.get("/stats", requireAuth, requireAdmin, getConversationStats);
router.get("/:id", requireAuth, requireAdmin, getConversationById);
router.put("/:id", requireAuth, requireAdmin, updateConversationStatus);
router.post("/:id/reply", requireAuth, requireAdmin, addReply);
router.delete("/:id", requireAuth, requireAdmin, deleteConversation);

module.exports = router;