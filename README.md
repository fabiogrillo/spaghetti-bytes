# 🍝 Spaghetti Bytes

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js" alt="Node Version" />
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB Version" />
  <img src="https://img.shields.io/badge/Tailwind-3.4.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind Version" />
</div>

<p align="center">
  <strong>A cartoon-themed technical blog where code meets creativity</strong><br>
  Untangling spaghetti code, one byte at a time 🚀
</p>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Component Architecture](#-component-architecture)
- [Design System](#-design-system)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🌟 Overview

Spaghetti Bytes is a modern, cartoon-themed technical blog platform that combines playful aesthetics with serious technical content. Built with React and Node.js, it features a unique design system that makes reading technical articles fun and engaging.

### 🎯 Purpose

- **Share technical knowledge** in an approachable, fun format
- **Track personal goals** and professional development
- **Enable reader interaction** through an innovative chat bot system
- **Showcase projects** with a unique visual style

## ✨ Features

### 🎨 Unique Cartoon Design System
- Custom shadow effects (`shadow-cartoon`)
- Playful color palette with 5 vibrant colors
- Animated components with Framer Motion
- Consistent border-radius and spacing

### 📝 Advanced Content Editor
- **TipTap Editor** with rich text capabilities
- Code syntax highlighting with multiple language support
- Image embedding and link management
- Markdown shortcuts support
- Real-time preview

### 💬 Interactive Chat Bot
- Replaces traditional contact forms
- Context-aware responses
- Conversation persistence in MongoDB
- Email notifications for new messages
- Animated UI with smooth transitions

### 📊 Goal Tracking System
- Create and manage personal/professional goals
- Step-by-step progress tracking
- Visual progress indicators
- Timeline view of achievements

### 🔐 Authentication & Admin
- Secure login system with bcrypt
- Session management with Express sessions
- Protected admin routes
- Content management dashboard

### 📱 Fully Responsive
- Mobile-first design approach
- Animated sidebar for mobile navigation
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Tailwind CSS 3.4.4** - Utility-first CSS
- **DaisyUI 4.12.10** - Component library
- **Framer Motion 11.2.12** - Animations
- **TipTap** - Modern rich text editor
- **React Router 6.24.0** - Navigation
- **React Icons 5.2.1** - Icon library
- **date-fns 3.6.0** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express 4.19.2** - Web framework
- **MongoDB 6.8.0** - Database
- **Mongoose 8.4.4** - ODM
- **Passport.js 0.7.0** - Authentication
- **bcrypt 5.1.1** - Password hashing
- **express-session 1.18.0** - Session management
- **Axios 1.7.2** - HTTP client (for Medium API)

### Deployment
- **Vercel** - Hosting platform
- **GitHub** - Version control

## 📁 Project Structure

```
spaghetti-bytes/
├── client/                    # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── Assets/          # Images and animations
│   │   ├── Components/      # Reusable components
│   │   │   ├── ChatBot.js  # Interactive chat widget
│   │   │   ├── Footer.js   # Site footer
│   │   │   ├── ImprovedNavbar.js  # Responsive navigation
│   │   │   ├── ImprovedStoryCard.js  # Article card
│   │   │   ├── TipTapEditor.js  # Rich text editor
│   │   │   └── Wall.js     # Blog listing component
│   │   ├── Pages/          # Route components
│   │   │   ├── Blog.js     # Blog listing page
│   │   │   ├── Contacts.js # Contact page (with chat bot)
│   │   │   ├── Goals.js    # Goals display page
│   │   │   ├── GoalPublisher.js  # Goal creation/editing
│   │   │   ├── Home.js     # Landing page
│   │   │   ├── Login.js    # Authentication page
│   │   │   ├── StoryManager.js  # Admin dashboard
│   │   │   ├── StoryPublisher.js # Story creation/editing
│   │   │   ├── StoryVisualizer.js # Story reading view
│   │   │   ├── TableGoals.js    # Goals management
│   │   │   └── TableManager.js  # Stories management
│   │   ├── Api.js          # API service layer
│   │   ├── App.js          # Main app component
│   │   ├── index.css       # Global styles
│   │   └── index.js        # Entry point
│   ├── tailwind.config.js  # Tailwind configuration
│   └── package.json        # Frontend dependencies
│
├── server/                  # Express backend
│   ├── controllers/        # Business logic
│   │   ├── goalController.js
│   │   ├── storyController.js
│   │   └── conversationController.js
│   ├── models/            # MongoDB schemas
│   │   ├── Goal.js
│   │   ├── Story.js
│   │   ├── User.js
│   │   └── Conversation.js
│   ├── routes/            # API routes
│   │   ├── goalRoute.js
│   │   ├── storyRoute.js
│   │   └── conversationRoute.js
│   ├── server.js          # Express server
│   └── package.json       # Backend dependencies
│
├── vercel.json           # Vercel deployment config
├── .gitignore           # Git ignore rules
├── package.json         # Root package file
└── README.md           # This file
```

## 🚀 Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB 6.0+ (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/fabiogrillo/spaghetti-bytes.git
   cd spaghetti-bytes
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

5. **Set up environment variables** (see below)

6. **Install concurrently for development**
   ```bash
   npm install -g concurrently
   ```

## 🔐 Environment Variables

### Server Environment Variables

Create a `.env` file in the `/server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/spaghetti-bytes
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spaghetti-bytes

# Session Secret
SECRET_KEY=your-super-secret-session-key

# Medium API (optional)
MEDIUM_ACCESS_TOKEN=your-medium-integration-token
MEDIUM_AUTHOR_ID=your-medium-author-id

# Server Port
PORT=5000

# Email Notifications (for chat bot)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@spaghetti-bytes.com
```

### Client Environment Variables

Create a `.env` file in the `/client` directory:

```env
# EmailJS Configuration (if still using contact form)
REACT_APP_EMAILJS_SERVICE_ID=your-service-id
REACT_APP_EMAILJS_TEMPLATE_ID=your-template-id
REACT_APP_EMAILJS_USER_ID=your-user-id

# API URL (for production)
REACT_APP_API_URL=https://your-api-url.com
```

## 💻 Development

### Running the Development Server

From the root directory:

```bash
# Run both client and server concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Start the backend
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm start
```

### Available Scripts

**Root directory:**
- `npm run dev` - Run client and server concurrently
- `npm run install-all` - Install all dependencies

**Client directory:**
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Server directory:**
- `npm run dev` - Start server with nodemon
- `npm start` - Start server in production mode

## 📡 API Documentation

### Authentication Endpoints

```http
POST /api/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

```http
POST /api/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

```http
POST /api/logout
```

### Stories Endpoints

```http
GET /api/stories
# Get all published stories

GET /api/stories/:id
# Get single story by ID

POST /api/stories/publish
# Create new story (requires auth)

PUT /api/stories/:id
# Update story (requires auth)

DELETE /api/stories/:id
# Delete story (requires auth)
```

### Goals Endpoints

```http
GET /api/goals
# Get all goals

GET /api/goals/:id
# Get single goal by ID

POST /api/goals
# Create new goal (requires auth)

PUT /api/goals/:id
# Update goal (requires auth)

DELETE /api/goals/:id
# Delete goal (requires auth)
```

### Conversations Endpoints

```http
POST /api/conversations
# Save new chat conversation

GET /api/conversations
# Get all conversations (requires auth)

PUT /api/conversations/:id/read
# Mark conversation as read (requires auth)
```

## 🎨 Design System

### Color Palette

```css
/* Cartoon Theme Colors */
--cartoon-pink: #FF6B9D;
--cartoon-yellow: #FFC107;
--cartoon-blue: #4ECDC4;
--cartoon-purple: #9B59B6;
--cartoon-orange: #FF8C42;

/* Base Colors */
--base-100: #FFF8DC; /* Cream background */
--neutral: #2A2A2A;  /* Dark text */
```

### Shadow System

```css
/* Cartoon shadows with black borders */
.shadow-cartoon { box-shadow: 4px 4px 0px #000; }
.shadow-cartoon-hover { box-shadow: 6px 6px 0px #000; }
.shadow-cartoon-sm { box-shadow: 2px 2px 0px #000; }
```

### Animation Classes

```css
/* Wiggle animation for playful elements */
.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

/* Bounce animation for floating elements */
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
```

### Component Styling Guidelines

1. **Always use rounded corners**: `rounded-cartoon` (1.5rem)
2. **Black borders**: `border-2 border-black`
3. **Hover effects**: Translate on hover for depth
4. **Color rotation**: Use different colors for adjacent elements
5. **Consistent spacing**: Use Tailwind's spacing scale

## 🚀 Deployment

### Vercel Deployment

1. **Connect GitHub repository to Vercel**

2. **Configure environment variables in Vercel dashboard**

3. **Deploy with vercel.json configuration**:
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
         "config": { "distDir": "build" }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/client/index.html"
       }
     ]
   }
   ```

### Build Commands

```bash
# Build client
cd client && npm run build

# Build server
cd server && npm run build
```

## 🤝 Contributing

While this is a personal project, I'm open to discussions and feedback! Feel free to:

1. Open issues for bugs or suggestions
2. Fork the repository for your own use
3. Contact me through the chat bot on the site

### Code Style Guidelines

- Use functional React components with hooks
- Follow Tailwind utility-first approach
- Maintain cartoon theme consistency
- Keep components small and focused
- Add proper TypeScript types (future enhancement)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Illustrations from [Icons8 Ouch!](https://icons8.com/illustrations)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- UI components inspired by [DaisyUI](https://daisyui.com/)
- Rich text editing by [TipTap](https://tiptap.dev/)

---

<div align="center">
  Made with 🍝 and ❤️ by Fabio Grillo
</div>