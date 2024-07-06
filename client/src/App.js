import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Blog from "./Pages/Blog";
import Goals from "./Pages/Goals";
import Footer from "./Components/Footer";
import About from "./Pages/About";
import Login from "./Pages/Login";
import StoryManager from "./Pages/StoryManager";
import StoryEditor from "./Components/Editor";

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  return (
    <Router>
      <Navbar
        authenticated={isAuthenticated}
        username={username}
        setAuthenticated={setAuthenticated}
        setUsername={setUsername}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/editor" element={<StoryEditor />} />
        <Route
          path="/manager"
          element={
            isAuthenticated ? (
              <StoryManager username={username} />
            ) : (
              <Login
                setAuthenticated={setAuthenticated}
                setUsername={setUsername}
              />
            )
          }
        />
        <Route
          path="/login"
          element={
            <Login
              setAuthenticated={setAuthenticated}
              setUsername={setUsername}
            />
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
