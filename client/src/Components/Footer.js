import React from "react";
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer footer-center shadow-md mt-8">
      <aside>
        <p className="font-bold text-lg mt-4">Spaghetti Bytes</p>
        <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
        <p>
          Icons by{" "}
          <a href="https://icons8.com/" className="underline">
            Icons8
          </a>
        </p>
      </aside>
      <nav>
        <div className="flex justify-center space-x-6 pb-4">
          <a
            href="https://github.com/fabiogrillo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="text-4xl text-charcoal" />
          </a>
          <a
            href="https://www.linkedin.com/in/fabgrillo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-4xl text-charcoal" />
          </a>
          <a
            href="https://medium.com/@fgrillo123"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMedium className="text-4xl text-charcoal" />
          </a>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
