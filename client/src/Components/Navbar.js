import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosLogIn, IoIosLogOut } from "react-icons/io";
import { MdManageAccounts } from "react-icons/md";
import { doLogout } from "../Api";
import { FaHome } from "react-icons/fa";
import { CiLaptop } from "react-icons/ci";
import { GoGoal } from "react-icons/go";
import { GrContact } from "react-icons/gr";

const Navbar = ({ authenticated, username, setAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "cupcake");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Stato per gestire la sidebar

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "cupcake" ? "night" : "cupcake");
  };

  const handleLogout = async () => {
    try {
      await doLogout();
      setAuthenticated(false);
      setUsername("");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <header>
      <div className="navbar p-4 shadow-md">
        <div className="flex-1">
          <Link className="text-2xl font-bold flex" to="/">
            Spaghetti Bytes
          </Link>
        </div>

        {/* Toggle button for mobile sidebar */}
        <div className="flex-none lg:hidden">
          <button
            className="btn btn-square btn-ghost"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Menu for large screens */}
        <div className="flex-none hidden lg:flex">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link to="/" className="text-lapis-lazuli">
                Home
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-lapis-lazuli">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/goals" className="text-lapis-lazuli">
                Goals
              </Link>
            </li>
            <li>
              <Link to="/contacts" className="text-lapis-lazuli">
                Contacts
              </Link>
            </li>
            <li>
              <label className="grid cursor-pointer place-items-center">
                <input
                  type="checkbox"
                  checked={theme === "night"}
                  onChange={toggleTheme}
                  className="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1"
                />
                <svg
                  className="stroke-base-100 fill-base-100 col-start-1 row-start-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
                <svg
                  className="stroke-base-100 fill-base-100 col-start-2 row-start-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </label>
            </li>
            <li>
              {authenticated ? (
                <span>
                  <span className="mr-2">{username}</span>
                  <IoIosLogOut className="text-2xl" onClick={handleLogout} />
                  <MdManageAccounts
                    className="text-2xl"
                    onClick={() => navigate("/manager")}
                  />
                </span>
              ) : (
                <Link to="/login">
                  <IoIosLogIn className="text-2xl" />
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Sidebar for small screens */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden " onClick={closeSidebar}>
            <div
              className="fixed left-0 top-0 h-full w-64 bg-neutral shadow-md z-50 p-4 flex flex-col text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h1 className="text-3xl font-bold mb-8 flex">Spaghetti Bytes</h1>

              {/* Navigation links */}
              <ul className="menu menu-vertical space-y-4 text-lg">
                <li>
                  <Link
                    to="/"
                    className="text-lapis-lazuli"
                    onClick={closeSidebar}
                  >
                    <FaHome /> Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-lapis-lazuli"
                    onClick={closeSidebar}
                  >
                    <CiLaptop /> Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/goals"
                    className="text-lapis-lazuli"
                    onClick={closeSidebar}
                  >
                    <GoGoal /> Goals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacts"
                    className="text-lapis-lazuli"
                    onClick={closeSidebar}
                  >
                    <GrContact /> Contacts
                  </Link>
                </li>

                {/* Theme toggle */}
                <li>
                  <label className="grid cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme === "night"}
                      onChange={toggleTheme}
                      className="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1"
                    />
                    <svg
                      className={`absolute inset-0 m-auto h-5 w-5 ${
                        theme === "night" ? "hidden" : "block"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                    <svg
                      className={`absolute inset-0 m-auto h-5 w-5 ${
                        theme === "night" ? "block" : "hidden"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </label>
                </li>
                <li>
                  <div className="flex items-center justify-start">
                    {authenticated ? (
                      <span className="flex items-center">
                        <details open>
                          <summary>{username}</summary>
                          <ul>
                            <li>
                              {/* Modifica: Sostituire <a> con <button> */}
                              <button
                                className="flex items-center"
                                onClick={() => {
                                  handleLogout();
                                  closeSidebar();
                                }}
                              >
                                <IoIosLogOut /> Logout
                              </button>
                            </li>
                            <li>
                              {/* Modifica: Sostituire <a> con <button> */}
                              <button
                                className="flex items-center"
                                onClick={() => {
                                  navigate("/manager");
                                  closeSidebar();
                                }}
                              >
                                <MdManageAccounts /> Manager
                              </button>
                            </li>
                          </ul>
                        </details>
                      </span>
                    ) : (
                      <Link
                        to="/login"
                        onClick={closeSidebar}
                        className="flex items-center"
                      >
                        <IoIosLogIn className="text-2xl mr-2" /> Login
                      </Link>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
