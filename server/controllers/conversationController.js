const Conversation = require("../models/Conversation");
const nodemailer = require("nodemailer");

// Configure email transporter (you can also use other services)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { userInfo, messages } = req.body;
    
    const newConversation = new Conversation({
      userInfo,
      messages
    });
    
    const savedConversation = await newConversation.save();
    
    // Send email notification to admin
    if (process.env.ADMIN_EMAIL) {
      await sendNotificationEmail(savedConversation);
    }
    
    res.status(201).json({ 
      success: true, 
      conversationId: savedConversation._id,
      message: "Conversation saved successfully" 
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save conversation", 
      error: error.message 
    });
  }
};

// Get all conversations (admin only)
const getConversations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    
    const conversations = await Conversation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('userInfo status createdAt updatedAt messages');
    
    const total = await Conversation.countDocuments(query);
    const unreadCount = await Conversation.getUnreadCount();
    
    res.json({
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single conversation by ID (admin only)
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Mark as read when viewed
    if (conversation.status === 'new') {
      await conversation.markAsRead();
    }
    
    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update conversation status (admin only)
const updateConversationStatus = async (req, res) => {
  try {
    const { status, notes, tags } = req.body;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    if (status) conversation.status = status;
    if (notes !== undefined) conversation.notes = notes;
    if (tags) conversation.tags = tags;
    
    if (status === 'read' && !conversation.readAt) {
      conversation.readAt = new Date();
    } else if (status === 'replied' && !conversation.repliedAt) {
      conversation.repliedAt = new Date();
    }
    
    const updatedConversation = await conversation.save();
    res.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a reply to conversation (admin only)
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    conversation.messages.push({
      text,
      sender: 'bot',
      timestamp: new Date()
    });
    
    await conversation.markAsReplied();
    
    // Send email reply to user
    if (conversation.userInfo.email) {
      await sendReplyEmail(conversation.userInfo, text);
    }
    
    res.json(conversation);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete conversation (admin only)
const deleteConversation = async (req, res) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(req.params.id);
    
    if (!deletedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get conversation statistics (admin only)
const getConversationStats = async (req, res) => {
  try {
    const stats = await Conversation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalConversations = await Conversation.countDocuments();
    const todayConversations = await Conversation.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const recentConversations = await Conversation.getRecent(5);
    
    res.json({
      statusCounts: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      total: totalConversations,
      today: todayConversations,
      recent: recentConversations
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to send notification email
const sendNotificationEmail = async (conversation) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New message from ${conversation.userInfo.name} - Spaghetti Bytes`,
    html: `
      <h2>New conversation on Spaghetti Bytes</h2>
      <p><strong>From:</strong> ${conversation.userInfo.name} (${conversation.userInfo.email})</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <h3>Messages:</h3>
      ${conversation.messages.map(msg => `
        <div style="margin: 10px 0; padding: 10px; background: ${msg.sender === 'user' ? '#f0f0f0' : '#e3f2fd'};">
          <strong>${msg.sender === 'user' ? conversation.userInfo.name : 'Bot'}:</strong> ${msg.text}
        </div>
      `).join('')}
      <p><a href="${process.env.SITE_URL}/admin/conversations/${conversation._id}">View conversation</a></p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};

// Helper function to send reply email
const sendReplyEmail = async (userInfo, replyText) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userInfo.email,
    subject: "Reply from Spaghetti Bytes",
    html: `
      <h2>Hi ${userInfo.name}!</h2>
      <p>Fabio has replied to your message:</p>
      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #FF6B9D;">
        ${replyText}
      </div>
      <p>Best regards,<br>Fabio from Spaghetti Bytes</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reply email:", error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  updateConversationStatus,
  addReply,
  deleteConversation,
  getConversationStats
};