import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";

// Core components (always loaded)
import ImprovedNavbar from "./Components/ImprovedNavbar";
import Footer from "./Components/Footer";
import LoadingSpinner from "./Components/LoadingSpinner";
import ToastProvider from "./Components/ToastProvider";
import api from "./Api";

// Regular imports (no lazy loading for simplicity on Vercel)
import Home from "./Pages/Home";
import Blog from "./Pages/Blog";
import Goals from "./Pages/Goals";
import Login from "./Pages/Login";
import Manager from "./Pages/Manager";
import StoryPublisher from "./Pages/StoryPublisher";
import TableManager from "./Pages/TableManager";
import StoryVisualizer from "./Pages/StoryVisualizer";
import GoalPublisher from "./Pages/GoalPublisher";
import TableGoals from "./Pages/TableGoals";
import DonationButton from "./Components/DonationButton";
import CookieBanner from "./Components/CookieBanner";
import CookieSettings from "./Components/CookieSettings";
import Privacy from "./Pages/Privacy";
import Contacts from "./Pages/Contacts";
import Unsubscribe from "./Pages/Unsubscribe";

// Import analytics hook
import { useAnalytics } from "./hooks/useAnalytics";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated, checkingAuth }) => {
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// App Content Component
const AppContent = ({ isAuthenticated, setAuthenticated, username, setUsername, checkingAuth }) => {
  useAnalytics();

  return (
    <>
      <ImprovedNavbar
        authenticated={isAuthenticated}
        username={username}
        setAuthenticated={setAuthenticated}
        setUsername={setUsername}
      />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/visualizer/:storyId" element={<StoryVisualizer />} />
          <Route
            path="/login"
            element={
              <Login
                setAuthenticated={setAuthenticated}
                setUsername={setUsername}
              />
            }
          />

          {/* Protected Routes - Admin Only */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <StoryPublisher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/story-publisher/:id?"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <StoryPublisher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/storyTable"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <TableManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <Manager username={username} isAuthenticated={isAuthenticated} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-goal"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <GoalPublisher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-goal/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <GoalPublisher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goalsTable"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <TableGoals />
              </ProtectedRoute>
            }
          />
          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center max-w-lg"
                >
                  {/* Big 404 */}
                  <motion.h1
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                    className="text-[10rem] font-bold leading-none gradient-text"
                  >
                    404
                  </motion.h1>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block mb-6"
                  >
                    <span className="badge badge-lg bg-warning text-black shadow-soft px-6 py-3">
                      🍝 Looks like this byte got lost in the spaghetti!
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-base-content/70 mb-10"
                  >
                    The page you're looking for doesn't exist — or maybe it was
                    untangled and moved somewhere else.
                  </motion.p>

                  {/* Navigation suggestions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                  >
                    <Link to="/">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-lg bg-error text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover btn-pop w-full sm:w-auto"
                      >
                        🏠 Go Home
                      </motion.button>
                    </Link>
                    <Link to="/blog">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-lg btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-soft shadow-soft w-full sm:w-auto"
                      >
                        📖 Read the Blog
                      </motion.button>
                    </Link>
                    <Link to="/goals">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-lg btn-outline border-2 border-warning text-warning hover:bg-warning hover:text-black rounded-soft shadow-soft w-full sm:w-auto"
                      >
                        🎯 See Goals
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Fun code block */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mockup-code text-left text-sm"
                  >
                    <pre data-prefix="$"><code>find / -name "page-you-wanted"</code></pre>
                    <pre data-prefix=">" className="text-warning"><code>searching spaghetti... 🍝</code></pre>
                    <pre data-prefix=">" className="text-error"><code>Error: page not found in this universe</code></pre>
                    <pre data-prefix=">" className="text-success"><code>Suggestion: try /blog or /goals</code></pre>
                  </motion.div>
                </motion.div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
      <CookieSettings />
      <DonationButton variant="floating" />
      <Analytics />
      <SpeedInsights />
    </>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/check');
        if (response.data.authenticated) {
          setAuthenticated(true);
          setUsername(response.data.user?.username || response.data.username);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <HelmetProvider>
      <ToastProvider>
        <Router>
          <div className="App min-h-screen flex flex-col relative z-10">
            <AppContent
              isAuthenticated={isAuthenticated}
              setAuthenticated={setAuthenticated}
              username={username}
              setUsername={setUsername}
              checkingAuth={checkingAuth}
            />
          </div>
        </Router>
      </ToastProvider>
    </HelmetProvider>
  );
};

export default App;