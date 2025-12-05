// client/src/Components/ImprovedNavbar.js
// Complete navbar component with comment notifications

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiShield,
  BiBookmarkHeart,
  BiUser,
} from "react-icons/bi";
import {
  IoIosLogIn,
  IoIosLogOut,
  IoMdHome,
  IoMdBook,
  IoMdMenu,
  IoMdClose,
  IoMdSettings,
} from "react-icons/io";
import { FaComments, FaBullseye } from "react-icons/fa";
import { GrContact } from "react-icons/gr";
import { doLogout } from "../Api";
import Logo from "./Logo";
import api from "../Api";
import ThemeToggle from "./ThemeToggle";

// Improved Navbar Component
const ImprovedNavbar = ({
  authenticated,
  username,
  setAuthenticated,
  setUsername,
  theme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [isSidebarOpen]);

  // Fetch pending comments count for admin
  useEffect(() => {
    if (authenticated) {
      fetchPendingCommentsCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingCommentsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const fetchPendingCommentsCount = async () => {
    try {
      const response = await api.get("/comments/pending-count");
      setPendingCommentsCount(response.data.count);
    } catch (error) {
      console.error("Error fetching pending comments count:", error);
      setPendingCommentsCount(0);
    }
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

  // Base navigation items
  const baseNavItems = [
    { path: "/", label: "Home", icon: IoMdHome },
    { path: "/blog", label: "Blog", icon: IoMdBook },
    { path: "/goals", label: "Goals", icon: FaBullseye },
    { path: "/bookmarks", label: "Bookmarks", icon: BiBookmarkHeart },
    { path: "/contacts", label: "Contacts", icon: GrContact },
  ];

  // Add Comments with badge if authenticated
  const navItems = [
    ...baseNavItems,
    ...(authenticated
      ? [
          {
            path: "/moderate-comments",
            label: "Comments",
            icon: FaComments,
            hasBadge: pendingCommentsCount > 0,
            badgeCount: pendingCommentsCount,
          },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-base-100 ${
        scrolled ? "shadow-lg backdrop-blur-md" : ""
      }`}
    >
      <div className="navbar p-4 max-w-7xl mx-auto">
        <div className="flex-1">
          <Link to="/">
            <Logo size="normal" theme={theme} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <nav className="flex gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const colors = ["error", "primary", "warning"];
              const color = colors[index % colors.length];

              return (
                <Link key={item.path} to={item.path}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={
                      isActive(item.path)
                        ? `btn rounded-soft shadow-soft-lg btn-pop bg-${color} text-white relative`
                        : "btn rounded-soft shadow-soft btn-pop bg-white text-gray-700 hover:shadow-soft-lg hover:dark:text-white relative"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {item.hasBadge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {item.badgeCount > 9 ? "9+" : item.badgeCount}
                        </span>
                      )}
                    </div>
                  </motion.button>
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />

          {authenticated ? (
            <div className="dropdown dropdown-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                tabIndex={0}
                className="btn rounded-soft bg-secondary text-white shadow-soft hover:shadow-soft-lg btn-pop"
              >
                <BiUser className="text-2xl" />
                {username}
              </motion.button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-soft-lg bg-base-100 rounded-soft w-52 mt-3 border border-base-300"
              >
                <li>
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/manager")}
                    className="rounded-soft hover:bg-secondary hover:text-white flex items-center gap-2"
                  >
                    <IoMdSettings /> Manager
                  </motion.button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="rounded-soft hover:bg-error hover:text-white"
                  >
                    <IoIosLogOut /> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-circle btn-lg bg-gradient-to-br from-secondary to-error text-white shadow-soft-lg hover:shadow-soft-hover"
              >
                <IoIosLogIn size={28} />
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
              className="fixed top-0 right-0 bottom-0 w-80 h-screen bg-base-100 z-50 shadow-2xl border-l-2 border-black lg:hidden overflow-y-auto"
            >
              <div className="p-6 h-screen overflow-y-auto flex flex-col bg-base-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">
                    <span className="gradient-text">Menu</span>
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn btn-circle btn-ghost"
                  >
                    <IoMdClose size={24} />
                  </motion.button>
                </div>

                {/* Navigation */}
                <nav className="space-y-4">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const colors = [
                      "error",
                      "primary",
                      "warning",
                      "secondary",
                      "accent"
                    ];
                    const hoverColors = [
                      "hover:bg-error",
                      "hover:bg-primary", 
                      "hover:bg-warning",
                      "hover:bg-secondary",
                      "hover:bg-accent"
                    ];
                    const color = colors[index % colors.length];
                    const hoverColor = hoverColors[index % hoverColors.length];

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
                              ? `w-full btn justify-start rounded-soft shadow-soft-lg bg-${color} text-white relative`
                              : `w-full btn justify-start rounded-soft shadow-soft btn-ghost ${hoverColor} hover:text-white relative`
                          }
                        >
                          <Icon size={20} />
                          <span className="ml-3">{item.label}</span>
                          {item.hasBadge && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                              {item.badgeCount}
                            </span>
                          )}
                        </motion.button>
                      </Link>
                    );
                  })}

                  <Link
                    to="/privacy"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <motion.button
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full btn justify-start rounded-soft shadow-soft btn-ghost hover:bg-warning hover:text-black"
                    >
                      <BiShield size={20} />
                      <span className="ml-3">Privacy Policy</span>
                    </motion.button>
                  </Link>
                </nav>

                {/* Theme Toggle */}
                <div className="mt-8 flex justify-center">
                  <ThemeToggle />
                </div>

                {/* Auth Section */}
                <div className="mt-8">
                  {authenticated ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/20 rounded-soft">
                        <p className="text-sm text-gray-600">Logged in as</p>
                        <p className="font-bold">{username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/manager");
                          setIsSidebarOpen(false);
                        }}
                        className="w-full btn rounded-soft shadow-soft hover:shadow-soft-lg"
                      >
                        <IoMdSettings /> Manager
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsSidebarOpen(false);
                        }}
                        className="w-full btn btn-error rounded-soft shadow-soft hover:shadow-soft-lg"
                      >
                        <IoIosLogOut /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setIsSidebarOpen(false)}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full btn btn-lg bg-gradient-to-br from-secondary to-error text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover"
                      >
                        <IoIosLogIn className="mr-2" size={24} />
                        Login
                      </motion.button>
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
