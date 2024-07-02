import React from "react";
import { motion } from "framer-motion";
import { IoIosContact } from "react-icons/io";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import illustrationBlog from "../Assets/Images/dazzle-man-programmer-writing-code-on-a-laptop.gif";
const Home = () => {
  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="card w-full bg-carolina-blue p-6 mb-6 flex flex-col md:flex-row"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-2xl font-bold mb-4">
            <IoIosContact />
            About Me
          </h2>
          <p className="mb-4">
            Software engineer with a passion for data engineering, personal
            finance, and self-growth. Musician, football player, and proud owner
            of Phoebe, a golden retriever.
          </p>
          <h2 className="card-title text-2xl font-bold mb-4">
            <BsFillPatchQuestionFill />
            Why This Blog
          </h2>
          <p>
            Started as a portfolio, evolved into a personal space for sharing
            projects, aspirations, and experiences.
          </p>
        </div>
        <div className="md:w-2/5 3flex flex-col items-center">
          <img
            src={illustrationBlog}
            alt="Illustration Blog"
            className="my-4"
          />
          <p className="text-sm text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/259416">
              Marina Green
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
