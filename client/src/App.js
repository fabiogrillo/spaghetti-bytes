import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Core components (always loaded)
import ImprovedNavbar from "./Components/ImprovedNavbar";
import Footer from "./Components/Footer";
import LoadingSpinner from "./Components/LoadingSpinner";
import ToastProvider from "./Components/ToastProvider";
import ChristmasDecorations from "./Components/ChristmasDecorations";
import ChristmasBanner from "./Components/ChristmasBanner";
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
import CommentReaction from "./Pages/CommentReaction";
import Bookmarks from "./Pages/Bookmarks";

// Import analytics hook
import { useAnalytics } from "./hooks/useAnalytics";

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
const AppContent = ({ isAuthenticated, setAuthenticated, username, setUsername, checkingAuth, theme }) => {
  useAnalytics();

  return (
    <>
      <ImprovedNavbar
        authenticated={isAuthenticated}
        username={username}
        setAuthenticated={setAuthenticated}
        setUsername={setUsername}
        theme={theme}
      />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/privacy" element={<Privacy />} />
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
          <Route
            path="/moderate-comments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} checkingAuth={checkingAuth}>
                <CommentReaction />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-error">404</h1>
                  <p className="text-xl mt-4">Page not found</p>
                  <a href="/" className="btn bg-secondary text-white mt-8 shadow-soft-lg">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
      <CookieSettings />
      <DonationButton variant="floating" />
    </>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setThemeState] = useState(
    localStorage.getItem('theme') || 'modern'
  );

  // Theme setter function
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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

  // Set initial theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastProvider>
      <Router>
        <ChristmasDecorations />
        <div className="App min-h-screen flex flex-col relative z-10">
          <div className="container mx-auto px-4">
            <ChristmasBanner theme={theme} setTheme={setTheme} />
          </div>
          <AppContent
            isAuthenticated={isAuthenticated}
            setAuthenticated={setAuthenticated}
            username={username}
            setUsername={setUsername}
            checkingAuth={checkingAuth}
            theme={theme}
          />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;