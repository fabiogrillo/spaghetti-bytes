# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spaghetti Bytes is a full-stack blog platform built with React, Express, and MongoDB. The project features a cartoon-themed design system, rich content management with TipTap editor, comment moderation, newsletter functionality, and comprehensive admin tools.

## Development Commands

### Full Stack Development
```bash
# Install dependencies for all packages
npm install
cd client && npm install
cd ../server && npm install

# Run both client and server concurrently
npm run dev

# Build for production
npm run build                # Build both client and server
npm run build:client         # Build only client
npm run build:server         # Build only server
```

### Client Development (from /client directory)
```bash
npm start                    # Start development server (port 3000)
npm run build                # Create production build
npm test                     # Run React tests
```

### Server Development (from /server directory)
```bash
npm run dev                  # Start with nodemon (hot reload)
npm start                    # Production server (port 5000)
```

### Utility Commands (from root)
```bash
npm run test                 # Run Jest tests
npm run test:coverage        # Run tests with coverage
npm run analyze              # Analyze client bundle size
npm run lighthouse           # Run Lighthouse performance audit
```

## Architecture

### Monorepo Structure
This is a monorepo with client (React) and server (Express) as separate packages sharing a common root. The proxy is configured in `client/package.json` to route `/api` requests to `http://localhost:5000` during development.

### Authentication System
The application uses a **hybrid authentication system**:
- **Session-based auth** with Passport.js (primary method for admin/user sessions)
- **JWT tokens** (optional, for API endpoints requiring token auth)
- Middleware in `server/middleware/auth.js` checks both Passport sessions and JWT tokens
- Admin routes protected with `requireAdmin` middleware
- Optional auth routes use `optionalAuth` to attach user context when available

### Client Architecture (`/client`)

**State Management:**
- React hooks for local state (useState, useEffect)
- Session-based authentication state managed in App.js
- No Redux - authentication/user state passed via props and context

**Key Components:**
- `ImprovedNavbar.js` - Main navigation with auth state, theme toggle, pending comments badge
- `TipTapEditor.js` - Rich text editor with syntax highlighting, image uploads
- `CommentSection.js` - Nested comments with moderation workflow
- `ChatBot.js` - Interactive contact form with conversation persistence

**API Service (`Api.js`):**
- Axios instance with dynamic baseURL (production vs development)
- Automatic credentials inclusion for session cookies
- Interceptors for request logging and 401 error handling

**Routing:**
- React Router v6 with public and protected routes
- `ProtectedRoute` component checks authentication before rendering admin pages
- Main routes: `/`, `/blog`, `/goals`, `/visualizer/:storyId`, `/login`
- Admin routes: `/editor`, `/story-publisher/:id?`, `/manager`, `/moderate-comments`

### Server Architecture (`/server`)

**MVC Pattern:**
- `models/` - Mongoose schemas (User, Story, Comment, Newsletter, Goal, Conversation, Analytics)
- `controllers/` - Business logic handlers
- `routes/` - Express route definitions
- `middleware/` - Authentication, validation, rate limiting, caching

**Key Middleware:**
- `middleware/auth.js` - JWT + Passport hybrid authentication
- `middleware/rateLimiter.js` - Rate limiting for API and auth endpoints
- `middleware/cacheRoutes.js` - Response caching (RSS: 1hr, Stories: 10min, Analytics: 5min)
- `middleware/validation.js` - Input validation and sanitization

**Database Models:**
- **Story**: Blog posts with reactions (likes, hearts, shares), comment count, tags, slug
- **Comment**: Nested comments with moderation status (pending/approved/rejected/spam), reactions
- **User**: Admin/user accounts with bcrypt password hashing, role-based access
- **Newsletter**: Email subscriptions with confirmed status
- **Goal**: Personal goals/milestones with progress tracking
- **Conversation**: Chat bot conversations for contact form
- **Analytics**: Page views and engagement metrics

**Security Features:**
- Helmet.js for security headers
- express-mongo-sanitize for NoSQL injection prevention
- Rate limiting on API endpoints (15min window, 100 requests)
- Password hashing with bcrypt (12 rounds)
- Session storage with connect-mongo
- CORS configuration with allowed origins

### Deployment (Vercel)

Configuration in `vercel.json`:
- Backend: `@vercel/node` builds `server/server.js`
- Frontend: `@vercel/static-build` builds client React app
- Routes: `/api/*` → server, everything else → client static files
- Environment variables must be set in Vercel dashboard

**Required Environment Variables:**
```
MONGODB_URI             # MongoDB connection string
SESSION_SECRET          # Session secret for express-session
EMAIL_USER              # Gmail for nodemailer
EMAIL_PASS              # Gmail app-specific password
ADMIN_EMAIL             # Admin notification email
FRONTEND_URL            # Production frontend URL
API_URL                 # Production API URL
JWT_SECRET              # JWT signing secret (optional)
NODE_ENV                # Set to "production"
```

## Comment System Implementation Details

The comment system has a moderation workflow that requires understanding multiple components:

**Moderation Flow:**
1. Comments created with `status: 'pending'` by default
2. Admin views pending comments in `/moderate-comments` page (CommentModeration.js)
3. Admin approves/rejects from moderation panel
4. Approved comments visible to all users
5. Rejected comments hidden from public view

**Key Files:**
- `server/models/Comment.js` - Schema with `status`, `moderatedBy`, `moderatedAt` fields
- `server/controllers/commentController.js` - CRUD operations with moderation methods
- `server/routes/commentRoute.js` - Routes including admin-only moderation endpoints
- `client/src/Pages/CommentModeration.js` - Admin moderation interface
- `client/src/Components/CommentSection.js` - Public comment display and creation

**Delete Operations:**
- Regular delete: `DELETE /api/comments/:id` (owner only)
- Admin force delete: `DELETE /api/comments/:id/admin` (admin only, bypasses ownership check)

## Newsletter System

Newsletter controller uses environment-based URLs for email confirmations:
- Development: Uses `http://localhost:3000` for unsubscribe links
- Production: Uses `process.env.FRONTEND_URL` for unsubscribe links
- Fixed issue: Previously had hardcoded localhost URLs causing production errors

## Theme System

Two themes implemented with Tailwind + DaisyUI:
- **Cartoon Mode** (light) - Playful with bright colors, cartoon shadows
- **Night Mode** (dark) - Dark theme with high contrast
- Theme persisted in localStorage
- Custom Tailwind utilities: `.shadow-cartoon`, `.rounded-cartoon`
- Theme colors: purple (#A855F7), blue (#3B82F6), green (#10B981), pink (#EC4899)

## Performance Optimizations

**Server-side:**
- Compression middleware (level 6, 1KB threshold)
- Response caching via node-cache
- Redis/IORedis support for distributed caching
- Bull queues for background jobs
- MongoDB query optimization with lean() and select()

**Client-side:**
- Code splitting with React.lazy (disabled for Vercel, using direct imports)
- Image optimization with Sharp
- Lazy loading with Intersection Observer
- Framer Motion for optimized animations
- Bundle analysis available via `npm run analyze`

## Testing

**Client Tests:**
- Jest + React Testing Library configured
- Run from `/client` directory: `npm test`
- Coverage: `npm test -- --coverage`

**Server Tests:**
- Jest configuration expected but not yet implemented
- Test files should go in `server/__tests__/` directory

## Important Notes

- **Proxy Configuration:** In development, client proxies `/api` to `http://localhost:5000` (configured in `client/package.json`)
- **Authentication Check:** Always use `req.isAuthenticated()` or check `req.user` to verify auth status
- **Admin Middleware:** Always apply `requireAdmin` AFTER `requireAuth` in route chains
- **Moderation:** New comments default to `pending` status and require admin approval
- **Session Storage:** Uses MongoDB store (connect-mongo) for session persistence
- **RSS Feeds:** Available at `/api/rss/feed.xml`, `/api/rss/atom.xml`, `/api/rss/feed.json`
- **File Structure:** Never move files between client/server without updating imports and webpack configs

## Common Patterns

**Creating a New Route:**
1. Add controller method in `server/controllers/[name]Controller.js`
2. Add route in `server/routes/[name]Route.js` with appropriate middleware
3. Import and mount route in `server/server.js`
4. Create API call in `client/src/Api.js` or use axios directly
5. Add React component/page that consumes the endpoint

**Adding a New Model:**
1. Create schema in `server/models/[Name].js` with Mongoose
2. Add validation rules and indexes
3. Create corresponding controller in `server/controllers/`
4. Add CRUD routes in `server/routes/`
5. Update frontend components to interact with new endpoints

**Protected Admin Features:**
- Always wrap with `requireAuth` then `requireAdmin` middleware
- Frontend: Wrap component with `<ProtectedRoute>` in App.js
- Check `isAuthenticated` prop before rendering admin UI elements
