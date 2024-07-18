import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosLogIn, IoIosLogOut } from "react-icons/io";
import { MdManageAccounts } from "react-icons/md";
import { doLogout } from "../Api";

const Navbar = ({ authenticated, username, setAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "synthwave" : "light");
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

  return (
    <header>
      <div className="navbar p-4 bg-base-100 shadow-xl">
        <div className="flex-1">
          <Link className="text-2xl font-bold" to="/">
            Spaghetti Bytes
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link to="/" className="text-lapis-lazuli">
                Home
              </Link>
            </li>
            <li>
              <Link to="/goals" className="text-lapis-lazuli">
                Goals
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-lapis-lazuli">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-lapis-lazuli">
                About
              </Link>
            </li>
            <li>
              <label className="grid cursor-pointer place-items-center">
                <input
                  type="checkbox"
                  checked={theme === "synthwave"}
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
      </div>
    </header>
  );
};

export default Navbar;
