import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Blog from "./Pages/Blog";
import Goals from "./Pages/Goals";
import Footer from "./Components/Footer";
import About from "./Pages/About";
import Login from "./Pages/Login";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  return (
    <Router>
      <div className="App">
        <Navbar authenticated={isAuthenticated} username={username} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
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
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
