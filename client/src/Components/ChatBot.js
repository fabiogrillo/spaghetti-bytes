import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiChat, BiX, BiSend, BiBot, BiUser } from 'react-icons/bi';
import { format } from 'date-fns';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 👋 I'm Spaghetti Bot! How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [stage, setStage] = useState('greeting'); // greeting, collectInfo, chatting
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "I'd like to collaborate 🤝",
    "Question about your blog 📝",
    "Just saying hi! 👋",
    "Technical question 💻",
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      handleBotResponse(inputMessage);
      setIsTyping(false);
    }, 1000);
  };

  const handleBotResponse = (userMessage) => {
    let botReply = '';

    if (stage === 'greeting') {
      if (!userInfo.name) {
        botReply = "Nice to meet you! What's your name? 😊";
        setStage('collectInfo');
      }
    } else if (stage === 'collectInfo') {
      if (!userInfo.name) {
        setUserInfo({ ...userInfo, name: userMessage });
        botReply = `Great to meet you, ${userMessage}! What's your email so Fabio can get back to you? 📧`;
      } else if (!userInfo.email) {
        setUserInfo({ ...userInfo, email: userMessage });
        botReply = `Perfect! I've got your info. Now, what would you like to talk about? Feel free to share anything! 💭`;
        setStage('chatting');
        // Here you would save the conversation to the database
        saveConversation({ ...userInfo, email: userMessage });
      }
    } else {
      // Context-aware responses
      if (userMessage.toLowerCase().includes('collaborate') || userMessage.toLowerCase().includes('project')) {
        botReply = "That's awesome! Fabio loves collaborating on interesting projects. I'll make sure he sees this. Could you tell me a bit more about what you have in mind? 🚀";
      } else if (userMessage.toLowerCase().includes('blog') || userMessage.toLowerCase().includes('article')) {
        botReply = "Thanks for your interest in the blog! Is there a specific article you'd like to discuss, or would you like to suggest a topic? 📚";
      } else if (userMessage.toLowerCase().includes('technical') || userMessage.toLowerCase().includes('code')) {
        botReply = "Great technical question! I'll make sure Fabio sees this. He usually responds within 24 hours. Feel free to share more details! 💻";
      } else {
        botReply = "Thanks for sharing! I've noted this down and Fabio will get back to you soon. Is there anything else you'd like to add? 😊";
      }
    }

    const botMessage = {
      id: messages.length + 2,
      text: botReply,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const saveConversation = async (userData) => {
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo: userData,
          messages: messages,
          timestamp: new Date(),
        }),
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 btn btn-circle btn-lg bg-cartoon-pink text-white shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-1 hover:translate-y-1 transition-all"
            aria-label="Open chat"
          >
            <BiChat size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-cartoon shadow-cartoon border-2 border-black"
          >
            {/* Header */}
            <div className="bg-cartoon-pink text-white p-4 rounded-t-cartoon flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <BiBot size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold">Spaghetti Bot 🍝</h3>
                  <p className="text-xs opacity-80">Always here to help!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <BiX size={20} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-base-100">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`avatar ${message.sender === 'bot' ? 'text-cartoon-pink' : 'text-cartoon-blue'}`}>
                      {message.sender === 'bot' ? <BiBot size={20} /> : <BiUser size={20} />}
                    </div>
                    <div
                      className={`
                        px-4 py-2 rounded-cartoon shadow-cartoon-sm
                        ${message.sender === 'user'
                          ? 'bg-cartoon-blue text-white'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {format(message.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <BiBot size={20} />
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {stage === 'greeting' && (
              <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="btn btn-sm btn-outline rounded-cartoon shadow-cartoon-sm text-cartoon-orange hover:shadow-cartoon"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t-2 border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input input-bordered flex-1 rounded-cartoon"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="btn btn-circle bg-cartoon-pink text-black shadow-cartoon-sm hover:shadow-cartoon hover:text-success disabled:opacity-900 disabled:bg-error"
                >
                  <BiSend size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;