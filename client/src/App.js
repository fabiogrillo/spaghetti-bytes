import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ImprovedNavbar from "./Components/ImprovedNavbar";
import Home from "./Pages/Home";
import Blog from "./Pages/Blog";
import Goals from "./Pages/Goals";
import Footer from "./Components/Footer";
import Login from "./Pages/Login";
import StoryManager from "./Pages/StoryManager";
import StoryPublisher from "./Pages/StoryPublisher";
import TableManager from "./Pages/TableManager";
import StoryVisualizer from "./Pages/StoryVisualizer";
import GoalPublisher from "./Pages/GoalPublisher";
import TableGoals from "./Pages/TableGoals";
import ChatBot from "./Components/ChatBot";
import ConversationDashboard from "./Pages/ConversationDashboard";
import CookieBanner from "./Components/CookieBanner";
import CookieSettings from "./Components/CookieSettings";
import Privacy from "./Pages/Privacy";
import { useAnalytics } from "./hooks/useAnalytics";
import CampaignManager from "./Pages/CampaignManager";
import NewsletterAnalytics from "./Components/NewsletterAnalytics";
import DonationButton from "./Components/DonationButton";
import api from "./Api";
import ToastProvider from "./Components/ToastProvider";

// Crea un componente wrapper per le routes
const AppContent = ({ isAuthenticated, setAuthenticated, username, setUsername, checkingAuth }) => {
  // Qui useAnalytics funziona perché siamo dentro il Router
  useAnalytics();

  const ProtectedRoute = ({ children }) => {
    if (checkingAuth) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <span className="loading loading-spinner loading-lg text-cartoon-pink"></span>
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <ImprovedNavbar
        authenticated={isAuthenticated}
        username={username}
        setAuthenticated={setAuthenticated}
        setUsername={setUsername}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/blog" element={<Blog />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <StoryPublisher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/storyTable"
          element={
            <ProtectedRoute>
              <TableManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <StoryManager username={username} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story-publisher/:id?"
          element={
            <ProtectedRoute>
              <StoryPublisher />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/create-goal"
          element={
            <ProtectedRoute>
              <GoalPublisher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goalsTable"
          element={
            <ProtectedRoute>
              <TableGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-goal/:id"
          element={
            <ProtectedRoute>
              <GoalPublisher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <ConversationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newsletter/campaigns"
          element={
            <ProtectedRoute>
              <CampaignManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newsletter/analytics"
          element={
            <ProtectedRoute>
              <NewsletterAnalytics />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <Footer />
      <ChatBot />
      <CookieBanner />
      <CookieSettings />
      <DonationButton variant="floating" />
    </>
  );
};

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
          setUsername(response.data.username);
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
    <ToastProvider>
      <Router>
        <AppContent
          isAuthenticated={isAuthenticated}
          setAuthenticated={setAuthenticated}
          username={username}
          setUsername={setUsername}
          checkingAuth={checkingAuth}
        />
      </Router>
    </ToastProvider>
  );
};

export default App;