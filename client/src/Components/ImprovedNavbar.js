import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoIosLogIn, 
  IoIosLogOut, 
  IoMdHome,
  IoMdBook,
  IoMdRocket,
  IoMdMenu,
  IoMdClose,
  IoMdSettings,
  IoMdStats
} from "react-icons/io";
import { BiSun, BiMoon } from "react-icons/bi";
import { doLogout } from "../Api";
import Logo from "./Logo";

const ImprovedNavbar = ({ authenticated, username, setAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "cartoon");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto theme switching based on time
  useEffect(() => {
    const hour = new Date().getHours();
    const isNightTime = hour >= 19 || hour < 7;
    
    if (!localStorage.getItem("theme-manual")) {
      setTheme(isNightTime ? "night" : "cartoon");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "cartoon" ? "night" : "cartoon";
    setTheme(newTheme);
    localStorage.setItem("theme-manual", "true");
  };

  const handleLogout = async () => {
    try {
      await doLogout();
      setAuthenticated(false);
      setUsername("");
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: IoMdHome },
    { path: "/blog", label: "Blog", icon: IoMdBook },
    { path: "/goals", label: "Goals", icon: IoMdRocket },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`
        sticky top-0 z-40 transition-all duration-300
        ${scrolled ? 'shadow-lg backdrop-blur-md bg-base-100/90' : 'bg-base-100'}
      `}
    >
      <div className="navbar p-4 max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex-1">
          <Link to="/">
            <Logo size="normal" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <nav className="flex gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const colors = ['cartoon-pink', 'cartoon-blue', 'cartoon-yellow'];
              const color = colors[index % colors.length];
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={
                      isActive(item.path) 
                        ? `btn rounded-cartoon shadow-cartoon btn-pop bg-${color} text-white` 
                        : 'btn rounded-cartoon shadow-cartoon-sm btn-pop bg-white text-gray-700 hover:shadow-cartoon'
                    }
                  >
                    <Icon className={isActive(item.path) ? 'text-xl text-white' : 'text-xl'} />
                    <span className="ml-1">{item.label}</span>
                  </motion.button>
                </Link>
              );
            })}
          </nav>

          {/* Admin Stats Link */}
          {authenticated && (
            <Link to="/visualizations">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={
                  isActive('/visualizations')
                    ? 'btn rounded-cartoon shadow-cartoon btn-pop bg-cartoon-orange text-white'
                    : 'btn rounded-cartoon shadow-cartoon-sm btn-pop bg-white text-gray-700 hover:shadow-cartoon'
                }
              >
                <IoMdStats className={isActive('/visualizations') ? 'text-xl text-white' : 'text-xl'} />
                <span className="ml-1">Stats</span>
              </motion.button>
            </Link>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ rotate: 180 }}
            onClick={toggleTheme}
            className="btn btn-circle bg-white shadow-cartoon-sm hover:shadow-cartoon btn-pop"
          >
            {theme === "cartoon" ? <BiMoon size={24} /> : <BiSun size={24} className="text-yellow-500" />}
          </motion.button>

          {/* Auth Section */}
          {authenticated ? (
            <div className="dropdown dropdown-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                tabIndex={0}
                className="btn rounded-cartoon bg-cartoon-purple text-white shadow-cartoon-sm hover:shadow-cartoon btn-pop"
              >
                <span className="text-xl">👨‍🍳</span>
                {username}
              </motion.button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-cartoon bg-base-100 rounded-cartoon w-52 mt-3 border-2 border-black">
                <li>
                  <button onClick={() => navigate("/manager")} className="rounded-cartoon hover:bg-cartoon-purple hover:text-white">
                    <IoMdSettings /> Manager
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/conversations")} className="rounded-cartoon hover:bg-cartoon-blue hover:text-white">
                    <IoMdBook /> Conversations
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="rounded-cartoon hover:bg-error hover:text-white">
                    <IoIosLogOut /> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn rounded-cartoon bg-cartoon-purple text-white shadow-cartoon-sm hover:shadow-cartoon btn-pop"
              >
                <IoIosLogIn size={24} />
                Login
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(true)}
            className="btn btn-square btn-ghost"
          >
            <IoMdMenu size={28} />
          </motion.button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-base-100 z-50 shadow-2xl border-l-2 border-black lg:hidden"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <Logo size="small" />
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn btn-circle btn-ghost"
                  >
                    <IoMdClose size={24} />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const colors = ['cartoon-pink', 'cartoon-blue', 'cartoon-yellow'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <motion.button
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                          className={
                            isActive(item.path)
                              ? `w-full btn justify-start rounded-cartoon shadow-cartoon bg-${color} text-white`
                              : 'w-full btn justify-start rounded-cartoon shadow-cartoon-sm btn-ghost hover:bg-gray-100'
                          }
                        >
                          <Icon className="text-xl" />
                          <span className="ml-3">{item.label}</span>
                        </motion.button>
                      </Link>
                    );
                  })}
                  
                  {authenticated && (
                    <>
                      <Link to="/visualizations" onClick={() => setIsSidebarOpen(false)}>
                        <motion.button
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                          className={
                            isActive('/visualizations')
                              ? 'w-full btn justify-start rounded-cartoon shadow-cartoon bg-cartoon-orange text-white'
                              : 'w-full btn justify-start rounded-cartoon shadow-cartoon-sm btn-ghost hover:bg-gray-100'
                          }
                        >
                          <IoMdStats className="text-xl" />
                          <span className="ml-3">Stats</span>
                        </motion.button>
                      </Link>
                      <Link to="/conversations" onClick={() => setIsSidebarOpen(false)}>
                        <motion.button
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                          className={
                            isActive('/conversations')
                              ? 'w-full btn justify-start rounded-cartoon shadow-cartoon bg-cartoon-blue text-white'
                              : 'w-full btn justify-start rounded-cartoon shadow-cartoon-sm btn-ghost hover:bg-gray-100'
                          }
                        >
                          <IoMdBook className="text-xl" />
                          <span className="ml-3">Conversations</span>
                        </motion.button>
                      </Link>
                    </>
                  )}
                </nav>

                {/* Theme Toggle Mobile */}
                <div className="mt-6 p-4 bg-base-200 rounded-cartoon">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-medium">Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={theme === "night"}
                      onChange={toggleTheme}
                      className="toggle toggle-primary"
                    />
                  </label>
                </div>

                {/* Auth Section Mobile */}
                <div className="mt-6">
                  {authenticated ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-cartoon-purple/20 rounded-cartoon">
                        <p className="text-sm text-gray-600">Logged in as</p>
                        <p className="font-bold">{username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/manager");
                          setIsSidebarOpen(false);
                        }}
                        className="w-full btn rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
                      >
                        <IoMdSettings /> Manager
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsSidebarOpen(false);
                        }}
                        className="w-full btn btn-error rounded-cartoon shadow-cartoon-sm hover:shadow-cartoon"
                      >
                        <IoIosLogOut /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setIsSidebarOpen(false)}>
                      <button className="w-full btn bg-cartoon-purple text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon">
                        <IoIosLogIn /> Login
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ImprovedNavbar;