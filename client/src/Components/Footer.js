import React from "react";
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="footer footer-center shadow-md">
      <aside>
        <p className="font-bold">
          Spaghetti Bytes
        </p>
        <p>Copyright © ${new Date().getFullYear()} - All right reserved</p>
        <p>
          Icons by <a href="https://icons8.com/">Icons8</a>
        </p>
      </aside>
      <nav>
        <motion.div
          className="flex justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <motion.a
            href="https://github.com/fabiogrillo"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub className="text-4xl text-charcoal" />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/fabgrillo"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaLinkedin className="text-4xl text-charcoal" />
          </motion.a>
          <motion.a
            href="https://medium.com/@fgrillo123"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaMedium className="text-4xl text-charcoal" />
          </motion.a>
        </motion.div>
      </nav>
    </footer>
  );
};

export default Footer;
