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

  const [suggestedTopics, setSuggestedTopics] = useState([
    "I'd like to collaborate 🤝",
    "Question about your blog 📝", 
    "Just saying hi! 👋",
    "Technical question 💻",
  ]);

  // FAQ responses
  const faqResponses = {
    'what do you write about': "I write about web development, JavaScript, React, Node.js, programming tips, and tech insights. You can find all my articles in the blog section! 📝",
    'how to contact': "You can contact Fabio through this chat, or connect on LinkedIn. He usually responds within 24 hours! 📞",
    'newsletter': "You can subscribe to the newsletter for weekly updates on new articles and tech insights. Just look for the newsletter signup! 📧",
    'collaboration': "Fabio is always open to interesting collaborations! Feel free to share your project ideas and he'll get back to you soon. 🤝",
    'experience': "Fabio is a fullstack developer with experience in React, Node.js, databases, and modern web technologies. Check out the blog for examples of his work! 💻",
    'services': "Fabio offers web development consultations, code reviews, and project collaborations. What kind of project are you working on? 🚀",
  };

  const getContextualSuggestions = (userMessage) => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('blog') || msg.includes('article')) {
      return ["Show me recent articles 📚", "What topics do you cover? 🔍", "How often do you post? ⏰"];
    } else if (msg.includes('collaborate') || msg.includes('project')) {
      return ["What's your experience? 💼", "Tell me about your services 🛠️", "How can we work together? 🤝"];
    } else if (msg.includes('technical') || msg.includes('code')) {
      return ["What technologies do you use? ⚡", "Can you help with code review? 👀", "Do you offer consulting? 💡"];
    }
    return suggestedTopics;
  };

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
      // Check FAQ responses first
      const msg = userMessage.toLowerCase();
      let faqMatch = Object.keys(faqResponses).find(key => 
        msg.includes(key) || key.split(' ').some(word => msg.includes(word))
      );

      if (faqMatch) {
        botReply = faqResponses[faqMatch];
      } else if (msg.includes('recent articles') || msg.includes('show me articles')) {
        botReply = "Here are some recent topics I've covered: React best practices, Node.js performance, JavaScript tips, and full-stack development. Check out the blog section for the full articles! 📚";
      } else if (msg.includes('technologies') || msg.includes('tech stack')) {
        botReply = "I work with JavaScript/TypeScript, React, Node.js, MongoDB, PostgreSQL, Express, Next.js, and modern web technologies. Always learning new things! ⚡";
      } else if (msg.includes('consulting') || msg.includes('help')) {
        botReply = "Yes! Fabio offers consulting for web development projects, code reviews, architecture planning, and technical mentoring. What kind of help are you looking for? 💡";
      } else if (msg.includes('collaborate') || msg.includes('project')) {
        botReply = "That's awesome! Fabio loves collaborating on interesting projects. I'll make sure he sees this. Could you tell me a bit more about what you have in mind? 🚀";
      } else if (msg.includes('blog') || msg.includes('article')) {
        botReply = "Thanks for your interest in the blog! Is there a specific article you'd like to discuss, or would you like to suggest a topic? 📚";
      } else if (msg.includes('technical') || msg.includes('code')) {
        botReply = "Great technical question! I'll make sure Fabio sees this. He usually responds within 24 hours. Feel free to share more details! 💻";
      } else {
        botReply = "Thanks for sharing! I've noted this down and Fabio will get back to you soon. Is there anything else you'd like to add? 😊";
      }

      // Update suggestions based on context
      setSuggestedTopics(getContextualSuggestions(userMessage));
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

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(255, 107, 157, 0.4)",
                "0 0 0 20px rgba(255, 107, 157, 0)",
                "0 0 0 0 rgba(255, 107, 157, 0)",
              ]
            }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              scale: { duration: 0.3 },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 btn btn-circle btn-lg bg-cartoon-pink text-white shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-1 hover:translate-y-1 transition-all"
            aria-label="Open chat"
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            >
              <BiChat size={28} />
            </motion.div>
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
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
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
                {suggestedTopics.map((reply, index) => (
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