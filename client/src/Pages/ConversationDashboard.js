import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BiChat,
  BiCheckCircle,
  BiTime,
  BiArchive,
  BiReply,
  BiTrash,
  BiRefresh
} from "react-icons/bi";
import { BsCircleFill } from "react-icons/bs";
import { format, formatDistanceToNow } from "date-fns";
import api from "../Api";

const ConversationDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [stats, setStats] = useState({
    statusCounts: { new: 0, read: 0, replied: 0, archived: 0 },
    total: 0,
    today: 0,
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const query = filter !== "all" ? `?status=${filter}` : "";
      const response = await api.get(`/conversations${query}`);

      const conversationsData = response.data.conversations || [];
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);


  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/conversations/stats");
      setStats(response.data || {
        statusCounts: { new: 0, read: 0, replied: 0, archived: 0 },
        total: 0,
        today: 0,
        recent: []
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default stats on error
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    // Mark as read if new
    if (conversation.status === "new") {
      await updateStatus(conversation._id, "read");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/conversations/${id}`, { status });
      fetchConversations();
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    try {
      const response = await api.post(`/conversations/${selectedConversation._id}/reply`, {
        text: replyText
      });

      if (response.status === 200) {
        setReplyText("");
        fetchConversations();
        // Refresh selected conversation
        setSelectedConversation(response.data);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await api.delete(`/conversations/${id}`);
      fetchConversations();
      if (selectedConversation?._id === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "text-cartoon-pink";
      case "read": return "text-cartoon-blue";
      case "replied": return "text-cartoon-green";
      case "archived": return "text-gray-400";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new": return <BsCircleFill className="animate-pulse" />;
      case "read": return <BiTime />;
      case "replied": return <BiCheckCircle />;
      case "archived": return <BiArchive />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Conversation Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-cartoon shadow-cartoon border-2 border-black"
          >
            <h3 className="text-2xl font-bold text-cartoon-pink">
              {stats?.statusCounts?.new || 0}
            </h3>
            <p className="text-sm text-gray-600">New Messages</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-cartoon shadow-cartoon border-2 border-black"
          >
            <h3 className="text-2xl font-bold text-cartoon-blue">
              {stats?.today || 0}
            </h3>
            <p className="text-sm text-gray-600">Today</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-cartoon shadow-cartoon border-2 border-black"
          >
            <h3 className="text-2xl font-bold text-cartoon-purple">
              {stats?.statusCounts?.replied || 0}
            </h3>
            <p className="text-sm text-gray-600">Replied</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-cartoon shadow-cartoon border-2 border-black"
          >
            <h3 className="text-2xl font-bold text-cartoon-orange">
              {stats?.total || 0}
            </h3>
            <p className="text-sm text-gray-600">Total</p>
          </motion.div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["all", "new", "read", "replied", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn btn-sm rounded-cartoon capitalize ${filter === status
                ? "bg-cartoon-pink text-white shadow-cartoon"
                : "btn-outline"
                }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={fetchConversations}
            className="btn btn-sm btn-circle"
          >
            <BiRefresh />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black h-[600px] overflow-hidden">
            <div className="bg-cartoon-yellow p-4 border-b-2 border-black">
              <h2 className="font-bold text-lg">Conversations</h2>
            </div>

            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No conversations found
                </div>
              ) : (
                <div className="divide-y-2 divide-gray-200">
                  {conversations.map((conv) => (
                    <motion.div
                      key={conv._id}
                      whileHover={{ backgroundColor: "#f9f9f9" }}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer transition-colors ${selectedConversation?._id === conv._id ? "bg-gray-100" : ""
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`${getStatusColor(conv.status)}`}>
                              {getStatusIcon(conv.status)}
                            </span>
                            <h3 className="font-semibold truncate">
                              {conv.userInfo?.name || "Unknown"}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.userInfo?.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {conv.createdAt
                              ? formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })
                              : "Unknown time"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black h-[600px] flex flex-col">
              {/* Header */}
              <div className="bg-cartoon-blue p-4 border-b-2 border-black text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg">
                      {selectedConversation.userInfo?.name || "Unknown"}
                    </h2>
                    <p className="text-sm opacity-90">
                      {selectedConversation.userInfo?.email || "No email"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => updateStatus(selectedConversation._id, e.target.value)}
                      className="select select-sm rounded-cartoon text-black"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      onClick={() => handleDelete(selectedConversation._id)}
                      className="btn btn-sm btn-error rounded-cartoon"
                    >
                      <BiTrash />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages?.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`
                        max-w-[80%] p-4 rounded-cartoon shadow-cartoon-sm
                        ${message.sender === "user"
                          ? "bg-gray-100 text-black"
                          : "bg-cartoon-purple text-white"
                        }
                      `}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp
                          ? format(new Date(message.timestamp), "MMM d, HH:mm")
                          : "Unknown time"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Reply Section */}
              <div className="p-4 border-t-2 border-gray-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="input input-bordered flex-1 rounded-cartoon"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="btn bg-cartoon-purple text-white rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
                  >
                    <BiReply size={20} />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-cartoon shadow-cartoon border-2 border-black h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BiChat size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-xl">Select a conversation to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationDashboard;