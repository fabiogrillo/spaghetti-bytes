import React, { useState } from "react";
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
import Contacts from "./Pages/Contacts";
import Login from "./Pages/Login";
import StoryManager from "./Pages/StoryManager";
import StoryPublisher from "./Pages/StoryPublisher";
import TableManager from "./Pages/TableManager";
import StoryVisualizer from "./Pages/StoryVisualizer";
import GoalPublisher from "./Pages/GoalPublisher";
import TableGoals from "./Pages/TableGoals";
import ChatBot from "./Components/ChatBot";
import ConversationDashboard from "./Pages/ConversationDashboard";

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
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
        <Route path="/contacts" element={<Contacts />} />
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
      </Routes>
      <Footer />
      <ChatBot />
    </Router>
  );
};

export default App;
