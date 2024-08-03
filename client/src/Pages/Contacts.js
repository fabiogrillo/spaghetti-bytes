import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { RiMailSendLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import rocketImage from "../Assets/Images/juicy-people-in-online-zoom-meeting.gif";

const Contacts = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    message: "",
    to_name: process.env.TO_NAME || "Admin",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        e.target,
        process.env.REACT_APP_EMAILJS_USER_ID
      )
      .then(
        (result) => {
          setShowAlert(true);
          setFormData({
            from_name: "",
            from_email: "",
            message: "",
            to_name: process.env.TO_NAME || "Admin",
          });
          setTimeout(() => {
            setShowAlert(false);
          }, 5000); // Nascondi l'alert dopo 5 secondi
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 mx-auto">
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="alert alert-success p-4 z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Your request has been correctly sent!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center my-12 mb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold">Want to reach out?</h1>
          <p className="py-6 italic">
            If you have any advices or you want to ask me anything please feel
            free to contact me whenever you want. I'll try to answer as soon as
            possible, I promise.
          </p>
        </div>
        <div className="w-2/5">
          <img
            src={rocketImage}
            alt="Illustration Reading"
            className="w-full h-auto"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/mNCLibjicqSz">
              Julia K
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="shadow-lg rounded-lg p-8 md:w-1/2 w-full bg-secondary bg-opacity-40 shadow-primary mb-16"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Me</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono">Name:</label>
            <input
              type="text"
              name="from_name"
              value={formData.from_name}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-mono">Email:</label>
            <input
              type="email"
              name="from_email"
              value={formData.from_email}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-mono">Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="btn btn-primary btn-md rounded-full"
            >
              <RiMailSendLine /> Send
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contacts;
