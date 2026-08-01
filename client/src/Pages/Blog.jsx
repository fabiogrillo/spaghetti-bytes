import React, { useState, useEffect } from "react";
import Wall from "../Components/Wall";
import { useLocation } from "react-router-dom";
import SEO from "../Components/SEO";

const Blog = () => {
  const location = useLocation();
  const { state } = location;
  const [showAlert, setShowAlert] = useState(state?.success !== undefined);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <div className="p-4">
      <SEO
        title="Blog"
        description="Technical articles about software engineering, system design, machine learning, and practical coding solutions. Deep dives into real-world problems."
      />
      {showAlert && (
        <div
          role="alert"
          className={`p-4 alert ${
            state.success ? "alert-success" : "alert-error"
          }`}
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
              d={
                state.success
                  ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            />
          </svg>
          <span>
            {state.success
              ? "Your story has been published successfully!"
              : "Error! Task failed successfully."}
          </span>
        </div>
      )}
      <Wall />
    </div>
  );
};

export default Blog;
