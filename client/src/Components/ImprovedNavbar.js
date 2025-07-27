import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoIosLogIn, 
  IoIosLogOut, 
  IoMdHome,
  IoMdBook,
  IoMdRocket,
  IoMdMail,
  IoMdMenu,
  IoMdClose,
  IoMdSettings
} from "react-icons/io";
import { BiSun, BiMoon } from "react-icons/bi";
import { doLogout } from "../Api";

const ImprovedNavbar = ({ authenticated, username, setAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "cartoon");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    setTheme(theme === "cartoon" ? "night" : "cartoon");
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
    { path: "/", label: "Home", icon: IoMdHome, color: "text-cartoon-pink" },
    { path: "/blog", label: "Blog", icon: IoMdBook, color: "text-cartoon-blue" },
    { path: "/goals", label: "Goals", icon: IoMdRocket, color: "text-cartoon-yellow" },
    { path: "/contacts", label: "Contact", icon: IoMdMail, color: "text-cartoon-purple" },
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🍝</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cartoon-pink to-cartoon-blue bg-clip-text text-transparent">
                  Spaghetti Bytes
                </h1>
                <p className="text-xs text-gray-500">Untangling code, one byte at a time</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      btn rounded-cartoon shadow-cartoon-sm
                      ${isActive(item.path) 
                        ? 'bg-cartoon-pink text-white shadow-cartoon' 
                        : 'btn-ghost hover:shadow-cartoon'
                      }
                    `}
                  >
                    <Icon className={`text-xl ${item.color}`} />
                    <span className="ml-1">{item.label}</span>
                  </motion.button>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ rotate: 180 }}
            onClick={toggleTheme}
            className="btn btn-circle btn-ghost"
          >
            {theme === "cartoon" ? <BiMoon size={24} /> : <BiSun size={24} />}
          </motion.button>

          {/* Auth Section */}
          {authenticated ? (
            <div className="dropdown dropdown-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                tabIndex={0}
                className="btn rounded-cartoon bg-cartoon-purple text-white shadow-cartoon-sm hover:shadow-cartoon"
              >
                <span className="text-xl">👨‍🍳</span>
                {username}
              </motion.button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-cartoon bg-base-100 rounded-cartoon w-52 mt-3 border-2 border-black">
                <li>
                  <button onClick={() => navigate("/manager")} className="rounded-cartoon">
                    <IoMdSettings /> Manager
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="rounded-cartoon text-error">
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
                className="btn rounded-cartoon bg-cartoon-purple text-white shadow-cartoon-sm hover:shadow-cartoon"
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
                  <h2 className="text-2xl font-bold">Menu</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn btn-circle btn-ghost"
                  >
                    <IoMdClose size={24} />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <motion.button
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            w-full btn justify-start rounded-cartoon
                            ${isActive(item.path)
                              ? 'bg-cartoon-pink text-white shadow-cartoon'
                              : 'btn-ghost'
                            }
                          `}
                        >
                          <Icon className={`text-xl ${item.color}`} />
                          <span className="ml-3">{item.label}</span>
                        </motion.button>
                      </Link>
                    );
                  })}
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
                        className="w-full btn rounded-cartoon"
                      >
                        <IoMdSettings /> Manager
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsSidebarOpen(false);
                        }}
                        className="w-full btn btn-error rounded-cartoon"
                      >
                        <IoIosLogOut /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setIsSidebarOpen(false)}>
                      <button className="w-full btn bg-cartoon-purple text-white rounded-cartoon shadow-cartoon">
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