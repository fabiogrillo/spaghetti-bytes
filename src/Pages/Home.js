import React from "react";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import { IoIosContact } from "react-icons/io";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { GoGoal } from "react-icons/go";
import { FaProjectDiagram } from "react-icons/fa";
import illustrationBlog from "../Assets/Images/dazzle-man-programmer-writing-code-on-a-laptop.gif";
import illustrationHero from "../Assets/Images/bendy-man-developer-writing-programming-code.gif";
import illustrationDev from "../Assets/Images/florid-software-developer.gif";
const Home = () => {
  const { scrollYProgress } = useViewportScroll();

  // Hero animations
  const heroScale = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 0.8, 0.7]);
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.5],
    [1, 0.7, 0.4, 0.9]
  );

  // Card animations
  const cardScale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.9],
    [0.6, 0.7, 1, 0.8]
  );
  const cardOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.7],
    [0.3, 0.5, 1, 0.7]
  );

  // Other sections card animations
  const otherSectionsScale = useTransform(
    scrollYProgress,
    [0, 0.7, 0.9],
    [0.6, 0.7, 1]
  );
  const otherSectionsOpacity = useTransform(
    scrollYProgress,
    [0, 0.7, 0.9],
    [0.6, 0.7, 1]
  );

  return (
    <motion.div className="p-4">
      <motion.div
        className="hero h-auto rounded-xl flex flex-col justify-between"
        style={{ scale: heroScale, opacity: heroOpacity }}
      >
        <div className="hero-content text-center py-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold">The Italian Software Journey</h1>
            <p className="py-6 italic">
              "If at first you don’t succeed; call it version 1.0."
            </p>
            <p className="py-2">
              Welcome to The Italian Software Journey! Here, you'll find
              insights and discussions on software engineering, personal
              finance, data engineering, and other technical topics. Dive into
              my world of code, innovation, and growth. Happy reading!
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <img
            src={illustrationHero}
            alt="Illustration Hero"
            className="w-96 max-w-lg"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/lZpGtGw5182N">
              Elisabet Guba
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="card w-full bg-carolina-blue p-6 mb-6 flex flex-col md:flex-row mx-auto max-w-6xl"
        style={{ scale: cardScale, opacity: cardOpacity }}
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
            Why This Blog?
          </h2>
          <p>
            Started as a portfolio, evolved into a personal space for sharing
            projects, aspirations, and experiences.
          </p>
        </div>
        <div className="md:w-2/5 flex flex-col items-center">
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
      <div className="text-center space-x-8">
        <button className="btn btn-primary hover:btn-accent">Contact Me</button>
        <button className="btn btn-secondary hover:btn-accent">
          Read My Articles
        </button>
      </div>
      <motion.div
        className="card w-full bg-carolina-blue py-16 flex flex-col md:flex-row mx-auto max-w-6xl"
        style={{ scale: otherSectionsScale, opacity: otherSectionsOpacity }}
      >
        <div className="card-md:w-2/5 flex flex-col items-center">
          <img
            src={illustrationDev}
            alt="Illustration Dev"
            className="my-4 max-w-72 justify-center"
          />
          <p className="text-sm text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/TQQ1qAnr9rn5">
              Oleg Shcherba
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-2xl font-bold mt-4">
            <GoGoal />
            Goals
          </h2>
          <p className="mb-4">
            In this section, I share my long-term goals and the ones I've
            already achieved.
            <ul className="steps mt-4">
              <li className="step step-info">Become an astronaut</li>
              <li className="step step-info">Fly to moon</li>
              <li className="step">Take a good photo of Earth</li>
            </ul>
          </p>
          <h2 className="card-title text-2xl font-bold mt-4">
            <FaProjectDiagram />
            Projects
          </h2>
          <p>
            This section highlights some GitHub projects I've worked on or am
            currently working on.
            <div className="mockup-code bg- mt-4 w-2">
              <pre data-prefix="$">
                <code>npm i golden-bytes</code>
              </pre>
            </div>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
