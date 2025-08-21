# 🍝 Spaghetti Bytes - Technical Blog Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3.4.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
</div>

<p align="center">
  <strong>Where code meets creativity - A cartoon-themed technical blog with a twist of spaghetti</strong>
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Frontend Documentation](#-frontend-documentation)
- [Backend Documentation](#-backend-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🌟 Overview

Spaghetti Bytes is a full-stack blog platform that combines playful cartoon aesthetics with serious technical content. Built with React, Node.js, and MongoDB, it features a unique design system, advanced content management, and interactive features like comments, reactions, and a chat bot.

### 🎯 Core Philosophy
- **Approachable Technical Content**: Making complex topics digestible
- **Interactive Learning**: Engage readers through comments and reactions
- **Visual Appeal**: Cartoon-themed design that makes reading fun
- **Performance First**: Optimized for speed and SEO

## ✨ Features

### Content Management
- **Rich Text Editor** (TipTap) with syntax highlighting
- **Comment System** with moderation workflow
- **Reactions** (likes, hearts, claps)
- **Newsletter Integration** with analytics
- **RSS/Atom/JSON Feed** generation
- **Medium Cross-posting** capability

### User Experience
- **Dark/Light Theme** (Cartoon/Night modes)
- **Progressive Web App** capabilities
- **Responsive Design** (mobile-first)
- **Interactive Chat Bot** for contact
- **Reading Progress** indicator
- **Search & Filter** functionality

### Admin Features
- **Dashboard** with analytics
- **Comment Moderation** panel
- **Content Scheduling**
- **SEO Optimization** tools
- **Cache Management**
- **Email Notifications**

## 🛠 Tech Stack

### Frontend (`/client`)
```json
{
  "core": {
    "react": "18.3.1",
    "react-router-dom": "6.24.0",
    "axios": "1.7.2"
  },
  "ui": {
    "tailwindcss": "3.4.4",
    "daisyui": "4.12.10",
    "framer-motion": "11.2.12"
  },
  "editor": {
    "@tiptap/react": "2.5.9",
    "@tiptap/starter-kit": "2.5.9",
    "highlight.js": "11.10.0"
  },
  "utilities": {
    "date-fns": "3.6.0",
    "react-hot-toast": "2.4.1",
    "react-icons": "5.2.1"
  }
}
```

### Backend (`/server`)
```json
{
  "core": {
    "express": "4.19.2",
    "mongoose": "8.4.4",
    "mongodb": "6.8.0"
  },
  "auth": {
    "passport": "0.7.0",
    "passport-local": "1.0.0",
    "bcrypt": "5.1.1",
    "express-session": "1.18.0"
  },
  "middleware": {
    "cors": "2.8.5",
    "helmet": "8.1.0",
    "compression": "1.8.1",
    "express-rate-limit": "8.0.1"
  },
  "utilities": {
    "nodemailer": "6.10.1",
    "express-validator": "7.2.1",
    "dotenv": "16.6.1"
  }
}
```

## 🏗 Architecture

### Directory Structure
```
spaghetti-bytes/
├── client/                    # React Frontend
│   ├── public/               
│   ├── src/
│   │   ├── Assets/           # Images, animations
│   │   ├── Components/       # Reusable components
│   │   │   ├── CommentSection.js    # Comment system with delete
│   │   │   ├── ImprovedNavbar.js    # Navigation with auth
│   │   │   ├── TipTapEditor.js      # Rich text editor
│   │   │   ├── ChatBot.js           # Interactive contact
│   │   │   └── ...
│   │   ├── Pages/            # Route components
│   │   │   ├── Blog.js              
│   │   │   ├── StoryVisualizer.js   
│   │   │   ├── StoryPublisher.js    
│   │   │   ├── ModerateComments.js  
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions
│   │   └── Api.js            # API service layer
│   └── package.json
│
├── server/                   # Express Backend
│   ├── controllers/          
│   │   ├── storyController.js
│   │   ├── commentController.js     # With delete methods
│   │   ├── newsletterController.js
│   │   └── ...
│   ├── models/              
│   │   ├── Story.js
│   │   ├── Comment.js               # With moderation fields
│   │   ├── User.js
│   │   └── ...
│   ├── routes/              
│   │   ├── storyRoute.js
│   │   ├── commentRoute.js          # With admin delete routes
│   │   └── ...
│   ├── middleware/          
│   ├── utils/               
│   ├── server.js            
│   └── package.json
│
├── vercel.json              # Deployment config
└── README.md
```

## 📡 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.spaghettibytes.blog/api`

### Authentication
```http
POST /api/login
POST /api/logout
POST /api/register
GET  /api/auth/status
```

### Stories/Articles
```http
GET    /api/stories              # Get all stories
GET    /api/stories/:id          # Get single story
POST   /api/stories/publish      # Create story (auth)
PUT    /api/stories/:id          # Update story (auth)
DELETE /api/stories/:id          # Delete story (auth)
GET    /api/stories/:id/reactions
POST   /api/stories/:id/reactions
```

### Comments System
```http
GET    /api/comments/story/:storyId     # Get comments
POST   /api/comments/story/:storyId     # Create comment
POST   /api/comments/:id/reaction       # Add reaction
POST   /api/comments/:id/flag           # Flag comment
DELETE /api/comments/:id                # Delete (owner)
DELETE /api/comments/:id/admin          # Force delete (admin)

# Admin routes
GET    /api/comments/moderate           # Pending comments
GET    /api/comments/pending-count      # Badge count
POST   /api/comments/:id/approve        # Approve
POST   /api/comments/:id/reject         # Reject
GET    /api/comments/stats              # Statistics
```

### Newsletter
```http
POST   /api/newsletter/subscribe
POST   /api/newsletter/unsubscribe
GET    /api/newsletter/stats            # Admin only
POST   /api/newsletter/send             # Admin only
```

### Goals
```http
GET    /api/goals
GET    /api/goals/:id
POST   /api/goals                       # Admin only
PUT    /api/goals/:id                   # Admin only
DELETE /api/goals/:id                   # Admin only
```

### Chat/Conversations
```http
POST   /api/conversations               # Create conversation
GET    /api/conversations               # Get all (auth)
GET    /api/conversations/:id           # Get single (auth)
POST   /api/conversations/:id/reply     # Add reply (auth)
```

### Feeds
```http
GET    /api/rss/feed.xml                # RSS 2.0
GET    /api/rss/atom.xml                # Atom
GET    /api/rss/feed.json               # JSON Feed
```

## 🎨 Frontend Documentation

### Key Components

#### CommentSection.js
- **Features**: 
  - Nested comments support
  - Admin delete functionality
  - Moderation workflow
  - Reactions system
  - Collapsible comment form
- **Props**: `storyId`, `username`, `isAuthenticated`

#### TipTapEditor.js
- **Features**:
  - Rich text editing
  - Code syntax highlighting
  - Image upload
  - Markdown shortcuts
- **Usage**: Used in StoryPublisher for content creation

#### ImprovedNavbar.js
- **Features**:
  - Responsive design
  - Theme toggle (Cartoon/Night)
  - Authentication state
  - Pending comments badge (admin)
  - Mobile sidebar

#### ChatBot.js
- **Features**:
  - Interactive conversation
  - Email notifications
  - Conversation persistence
  - Animated UI

### State Management
- **Authentication**: Session-based with Express
- **Theme**: LocalStorage persistence
- **Comments**: Real-time updates for admin
- **Reactions**: Optimistic UI updates

### Styling System
```css
/* Custom Tailwind utilities */
.shadow-cartoon {
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 1);
}

.rounded-cartoon {
  border-radius: 8px;
}

/* Theme colors */
--cartoon-purple: #A855F7
--cartoon-blue: #3B82F6
--cartoon-green: #10B981
--cartoon-pink: #EC4899
--cartoon-yellow: #FBBF24
```

## 🔧 Backend Documentation

### Database Schema

#### Story Model
```javascript
{
  title: String,
  slug: String,
  content: String,
  author: String,
  summary: String,
  tags: [String],
  coverImage: String,
  readingTime: Number,
  reactions: {
    likes: [String],
    hearts: [String],
    shares: Number
  },
  commentCount: Number,
  published: Boolean,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Comment Model
```javascript
{
  story: ObjectId,
  content: String,
  author: {
    name: String,
    email: String,
    userId: ObjectId,
    sessionId: String
  },
  parentComment: ObjectId,
  status: 'pending' | 'approved' | 'rejected' | 'spam',
  reactions: {
    likes: [String],
    hearts: [String],
    claps: [String],
    totalCount: Number
  },
  moderatedBy: ObjectId,
  moderatedAt: Date,
  flagReason: String,
  createdAt: Date
}
```

### Middleware

#### Authentication
```javascript
// Session-based auth with Passport.js
passport.use(new LocalStrategy({...}))

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') next();
  else res.status(403).json({error: 'Admin required'});
}
```

#### Rate Limiting
```javascript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
```

#### Caching
- RSS feeds: 1 hour
- Stories: 10 minutes
- Analytics: 5 minutes
- Goals: 10 minutes

### Email Configuration
```javascript
// Nodemailer setup for notifications
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## 🚀 Deployment

### Vercel Configuration

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

### Environment Variables

#### Production (.env)
```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Session
SESSION_SECRET=your-secret-key

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
ADMIN_EMAIL=admin@spaghettibytes.blog

# URLs
FRONTEND_URL=https://spaghettibytes.blog
API_URL=https://api.spaghettibytes.blog

# Features
NODE_ENV=production
```

### Deployment Steps
1. Push to GitHub
2. Connect repo to Vercel
3. Configure environment variables
4. Deploy

## 🔨 Development

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/spaghetti-bytes.git

# Install dependencies
cd spaghetti-bytes
npm install
cd client && npm install
cd ../server && npm install

# Setup environment variables
cp .env.example .env

# Run development servers
npm run dev  # Runs both client and server
```

### Available Scripts

#### Root
- `npm run dev` - Run full stack
- `npm run build` - Build for production

#### Client
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests

#### Server
- `npm run dev` - Development with nodemon
- `npm start` - Production server

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Standards
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👨‍💻 Author

**Fabio Grillo**
- Website: [spaghettibytes.blog](https://spaghettibytes.blog)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@fabiogrillo](https://github.com/fabiogrillo)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- DaisyUI for the component library
- TipTap for the rich text editor
- All contributors and supporters

---

<p align="center">Made with ❤️ and lots of ☕ by Fabio Grillo</p>
<p align="center">© 2024 Spaghetti Bytes. All rights reserved.</p>