import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa";
import { BiHeart } from "react-icons/bi";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: FaGithub,
      url: "https://github.com/fabiogrillo",
      label: "GitHub",
      color: "hover:text-gray-900 dark:hover:text-white"
    },
    {
      icon: FaLinkedin,
      url: "https://www.linkedin.com/in/fabgrillo",
      label: "LinkedIn",
      color: "hover:text-primary"
    },
    {
      icon: FaMedium,
      url: "https://medium.com/@fgrillo123",
      label: "Medium",
      color: "hover:text-black dark:hover:text-white"
    }
  ];

  return (
    <>
      <footer className="bg-base-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                <span className="gradient-text">Spaghetti Bytes</span> 🍝
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Untangling code, one byte at a time
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              <div className="flex gap-4 sm:gap-6">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        text-2xl sm:text-3xl text-gray-600 dark:text-gray-400
                        transition-colors duration-300
                        ${social.color}
                      `}
                    >
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-full max-w-xs">
              <div className="divider my-0"></div>
            </div>

            {/* Copyright & Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-3"
            >
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                Made with <BiHeart className="text-error animate-pulse" /> and lots of 🍝
              </p>

              {/* Policy Links */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs">
                <Link to="/privacy" className="hover:text-error transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => {
                    document.querySelector('[aria-label="Cookie settings"]')?.click();
                  }}
                  className="hover:text-error transition-colors cursor-pointer"
                >
                  Cookie Settings
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {currentYear} Spaghetti Bytes. All rights reserved.
              </p>
            </motion.div>

            {/* Fun Easter Egg */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="text-xs text-gray-400 dark:text-gray-600 italic text-center px-4"
            >
              {"// TODO: Fix all the spaghetti code... eventually 😅"}
            </motion.div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;