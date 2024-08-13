import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { RiMailSendLine } from "react-icons/ri";
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
    // Scroll to top when the component is mounted
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
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center">
        {/* Alert Section */}
        {showAlert && (
          <div className="alert alert-success p-4 z-50 mb-8">
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
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Want to reach out?
            </h1>
            <p className="py-2 md:text-base">
              If you ever find yourself in need of advice, or if you simply wish
              to ask me something—be it a small query or a more complex
              question—please don't hesitate to reach out. Feel free to contact
              me at any time that suits you, and I assure you, I will do my
              utmost to respond as swiftly as I can. Your inquiries are
              important to me, and I will prioritize getting back to you
              promptly
            </p>
          </div>
          <div className="mb-8">
            <img
              src={rocketImage}
              alt="Illustration Reading"
              className="w-full max-w-sm md:max-w-lg"
            />
            <p className="text-xs text-center ">
              Illustration by{" "}
              <a href="https://icons8.com/illustrations/author/mNCLibjicqSz">
                Julia K
              </a>{" "}
              from <a href="https://icons8.com/illustrations">Ouch!</a>
            </p>
          </div>
        </div>

        <div className="shadow-lg rounded-lg bg-primary bg-opacity-40 p-12">
          <h2 className="text-2xl font-bold text-center">Contact Me</h2>
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
                <RiMailSendLine className="mr-2" /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
