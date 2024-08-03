import React from "react";
import { motion, useTransform, useScroll } from "framer-motion";
import { IoIosContact } from "react-icons/io";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { GoGoal } from "react-icons/go";
import { FaProjectDiagram } from "react-icons/fa";
import { GrArticle } from "react-icons/gr";
import { LuContact2 } from "react-icons/lu";
import { MdContactMail } from "react-icons/md";
import { MdOutlineConnectWithoutContact } from "react-icons/md";
import illustrationBlog from "../Assets/Images/dazzle-man-programmer-writing-code-on-a-laptop.gif";
import illustrationHero from "../Assets/Images/bendy-man-developer-writing-programming-code.gif";
import illustrationDev from "../Assets/Images/taxi-rocket-delivering-parcels-to-aliens-in-space.gif";
import illustrationContact from "../Assets/Images/bendy-customer-service-man-answering-question.gif";
import { Link } from "react-router-dom";

const Home = () => {
  const { scrollYProgress } = useScroll();

  // Hero animations
  const heroScale = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 0.8, 0.7]);
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.4, 0.5],
    [1, 0.7, 0.5, 0.9]
  );

  // Card animations
  const cardScale = useTransform(
    scrollYProgress,
    [0.2, 0.3, 0.8],
    [0.7, 1, 0.7]
  );
  const cardOpacity = useTransform(
    scrollYProgress,
    [0.2, 0.3, 0.6, 0.7],
    [0.6, 1, 0.8, 0.7]
  );

  // Other sections card animations
  const otherSectionsScale = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.66, 0.85],
    [0.8, 0.9, 1, 0.9]
  );
  const otherSectionsOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.66, 0.9],
    [0.7, 1, 1, 0.7]
  );

  // Contact card animations
  const contactCardScale = useTransform(
    scrollYProgress,
    [0.8, 0.9, 1.0],
    [0.6, 0.7, 1]
  );
  const contactCardOpacity = useTransform(
    scrollYProgress,
    [0.8, 0.9, 1.0],
    [0.3, 0.5, 1]
  );

  return (
    <motion.div className="p-4 space-y-12 m-12">
      <motion.div
        className="hero rounded-xl flex flex-col justify-between mx-auto"
        style={{ scale: heroScale, opacity: heroOpacity }}
      >
        <div className="hero-content text-center py-10">
          <div className="mx-auto">
            <h1 className="text-4xl font-bold">
              Welcome to my software journey
            </h1>
            <p className="py-6 italic">
              "If at first you don’t succeed call it version 1.0.""
            </p>
            <p className="py-2 mx-36">
              Here, you'll find insights and discussions on software
              engineering, data engineering, and other technical topics. Dive
              into my world of code, innovation, and growth. Happy reading!
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="flex flex-col items-center justify-center md:w-2/5 space-y-4">
            <img
              src={illustrationHero}
              alt="Illustration Hero"
              className="w-full max-w-lg"
            />
            <p className="text-xs text-center mt-4 md:mt-0">
              Illustration by{" "}
              <a href="https://icons8.com/illustrations/author/lZpGtGw5182N">
                Elisabet Guba
              </a>{" "}
              from <a href="https://icons8.com/illustrations">Ouch!</a>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center md:w-2/5 space-y-4">
            <Link to={"/blog"}>
              <button className="btn btn-primary btn-outline btn-lg rounded-full">
                <GrArticle className="text-2xl" />
                Read My Stories
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card w-full bg-carolina-blue p-6 flex flex-col md:flex-row mx-auto max-w-6xl"
        style={{ scale: cardScale, opacity: cardOpacity }}
      >
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-4xl font-bold mb-4">
            <IoIosContact />
            About Me
          </h2>
          <p className="mb-4">
            I'm a software engineer with a passion for data engineering and
            self-growth. Musician, football player, and proud owner of Phoebe, a
            funny 4-years-old golden retriever 🐶
          </p>
          <h2 className="card-title text-4xl font-bold mb-4">
            <BsFillPatchQuestionFill />
            Why This Blog?
          </h2>
          <p>
            Started as a portfolio, evolved into a personal space for sharing
            projects, aspirations, and experiences. It arises from my exigence
            to tell about what I do and how I do it
          </p>
        </div>
        <div className="md:w-2/5 flex flex-col items-center justify-center">
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

      <motion.div
        className="card w-full bg-carolina-blue p-6 flex flex-col md:flex-row mx-auto max-w-6xl"
        style={{ scale: otherSectionsScale, opacity: otherSectionsOpacity }}
      >
        <div className="md:w-2/5 flex flex-col items-center justify-center">
          <div className="flex-col">
            <img
              src={illustrationDev}
              alt="Illustration Dev"
              className="my-4"
            />
            <p className="text-sm text-center">
              Illustration by{" "}
              <a href="https://icons8.com/illustrations/author/TQQ1qAnr9rn5">
                Oleg Shcherba
              </a>{" "}
              from <a href="https://icons8.com/illustrations">Ouch!</a>
            </p>
          </div>
          <div className="p-8">
            <Link to={"/goals"}>
              <button className="btn btn-warning btn-outline btn-lg rounded-full">
                <GoGoal className="text-2xl" /> Check my goals
              </button>
            </Link>
          </div>
        </div>
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-4xl font-bold mb-4">
            <GoGoal />
            Goals
          </h2>
          <p>
            This section may be strange at a frist glance, consider it as my
            personal achievement board: it contains what I'd like to learn in my career path.
            <ul className="steps mt-4 justify-center">
              <li className="step step-info">Become an astronaut</li>
              <li className="step step-info">Fly to moon</li>
              <li className="step">Take a good photo of Earth</li>
            </ul>
          </p>
          <h2 className="card-title text-4xl font-bold mt-8">
            <FaProjectDiagram />
            Projects (in progress)
          </h2>
          <p>
            This section highlights some GitHub projects I've worked on or am
            currently working on
            <div className="mockup-code bg- mt-4 w-full justify-center">
              <pre data-prefix="$">
                <code>npm i spaghetti-bytes</code>
              </pre>
            </div>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="card w-full bg-carolina-blue p-6 flex flex-col md:flex-row mx-auto max-w-6xl"
        style={{ scale: contactCardScale, opacity: contactCardOpacity }}
      >
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-4xl font-bold mb-4">
            <MdContactMail />
            Contact me
          </h2>
          <p className="mb-4">
            I’m excited to connect with new people and explore fresh ideas.
            Whether you’re interested in collaborating on a project or simply
            want to engage in a conversation, this space is open for you
          </p>
          <h2 className="card-title text-4xl font-bold mb-4">
            <MdOutlineConnectWithoutContact />
            Let's connect!
          </h2>
          <p>
            You can connect with me on social media or drop me an email, feel
            free to reach out
          </p>
          <div className="py-6 text-center">
            <Link to={"/contacts"}>
              <button className="btn btn-secondary btn-outline btn-lg rounded-full">
                <LuContact2 className="text-2xl" /> Reach me out
              </button>
            </Link>
          </div>
        </div>

        <div className="md:w-2/5 flex flex-col items-center justify-center">
          <div className="flex-col">
            <img
              src={illustrationContact}
              alt="Illustration Contact"
              className="my-4"
            />
            <p className="text-sm text-center">
              Illustration by{" "}
              <a href="https://icons8.com/illustrations/author/lZpGtGw5182N">
                Elisabet Guba
              </a>{" "}
              from <a href="https://icons8.com/illustrations">Ouch!</a>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
