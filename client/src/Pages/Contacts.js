import { useState, useEffect } from "react";
import rocketImage from "../Assets/Images/juicy-people-in-online-zoom-meeting.gif";
import ChatBot from "../Components/ChatBot";

const Contacts = () => {
  const [showAlert] = useState(false);

  useEffect(() => {
    // Scroll to top when the component is mounted
    window.scrollTo(0, 0);
  }, []);

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
            <p className="text-xs text-center">
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
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Let's Chat!</h2>
            <p className="mb-8">Click the chat button in the corner to start a conversation!</p>
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
