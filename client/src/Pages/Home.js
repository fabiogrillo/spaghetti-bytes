import React from "react";
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
import illustrationContact from "../Assets/Images/bendy-customer-service-man-answering-question.gif";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="md:m-12">
      <div className="hero rounded-xl flex flex-col justify-between mx-auto">
        <div className="hero-content text-center py-10">
          <div className="mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome to my software journey
            </h1>
            <p className="py-4 md:py-6 italic md:text-base">
              "If at first you don’t succeed call it version 1.0."
            </p>
            <p className="py-2 mx-4 md:mx-36 md:text-base">
              Here, you'll find insights and discussions on software
              engineering, data engineering, and other technical topics. Dive
              into my world of code, innovation, and growth. Happy reading!
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center justify-center md:w-2/5 space-y-4">
            <img
              src={illustrationHero}
              alt="Illustration Hero"
              className="w-full max-w-sm md:max-w-lg uniform-img"
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
              <button className="btn btn-primary btn-outline btn-lg rounded-full mt-4">
                <GrArticle className="text-2xl" />
                Read Stories
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="card w-full bg-carolina-blue p-4 md:p-6 flex flex-col md:flex-row mx-auto max-w-6xl">
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-3xl md:text-4xl font-bold mb-4">
            <IoIosContact />
            About Me
          </h2>
          <p className="mb-4 md:text-base">
            I'm a software engineer with a passion for data engineering and
            self-growth. Musician, football player, and proud owner of Phoebe, a
            funny 4-years-old golden retriever 🐶
          </p>
          <h2 className="card-title text-3xl md:text-4xl font-bold mb-4">
            <BsFillPatchQuestionFill />
            Why This Blog?
          </h2>
          <p className="md:text-base">
            Started as a portfolio, evolved into a personal space for sharing
            projects, aspirations, and experiences. It arises from my exigence
            to tell about what I do and how I do it.
          </p>
        </div>
        <div className="md:w-2/5 flex flex-col items-center justify-center">
          <img
            src={illustrationBlog}
            alt="Illustration Blog"
            className="w-full max-w-sm md:max-w-lg uniform-img"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/259416">
              Marina Green
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>

      <div className="card w-full bg-carolina-blue p-4 md:p-6 flex flex-col md:flex-row mx-auto max-w-6xl">
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-3xl md:text-4xl font-bold mb-4">
            <GoGoal />
            Goals
          </h2>
          <div className="mb-4 md:text-base">
            <p>
              At first glance, this section might appear somewhat peculiar or
              unusual. However, I encourage you to view it as a sort of personal
              achievement board of sorts. Essentially, it serves as a detailed
              reflection of the various skills and areas of knowledge that I
              aspire to acquire and master throughout the course of my
              professional career.
            </p>
            <ul className="steps mt-8 justify-center">
              <li className="step step-info">Become an astronaut</li>
              <li className="step step-info">Fly to moon</li>
              <li className="step">Take a good photo of Earth</li>
            </ul>
          </div>
          <h2 className="card-title text-3xl md:text-4xl font-bold mt-8">
            <FaProjectDiagram />
            Projects (in progress)
          </h2>
          <div className="md:text-base my-4">
            <p>
              This section is dedicated to showcasing a selection of GitHub
              projects that I have either previously worked on or am actively
              engaged with at the present moment. It provides an overview of the
              various initiatives and endeavors I have undertaken within the
              GitHub platform.
            </p>
            <div className="mockup-code mt-8 w-full mx-auto rounded-lg py-2">
              <pre data-prefix="$">
                <code>npm i spaghetti-bytes</code>
              </pre>
              <pre data-prefix=">" className="text-warning">
                <code>installing...</code>
              </pre>
              <pre data-prefix=">" className="text-success">
                <code>Done!</code>
              </pre>
            </div>
          </div>

          <div className="text-center">
            <Link to={"/goals"}>
              <button className="btn btn-warning btn-outline btn-lg rounded-full">
                <GoGoal className="text-2xl" /> Check Goals
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="card w-full bg-carolina-blue p-4 md:p-6 flex flex-col md:flex-row mx-auto max-w-6xl">
        <div className="card-body md:w-3/5">
          <h2 className="card-title text-3xl md:text-4xl font-bold mb-4">
            <MdContactMail />
            Contact me
          </h2>
          <p className="mb-4 md:text-base">
            I am genuinely enthusiastic about the prospect of connecting with
            new individuals and delving into innovative and fresh ideas. This
            space is designed to be a welcoming environment for anyone who is
            interested in collaborating on exciting projects or who simply
            wishes to engage in meaningful and stimulating conversations. This
            space is open and available for all who wish to engage.
          </p>
          <h2 className="card-title text-3xl md:text-4xl font-bold mb-4">
            <MdOutlineConnectWithoutContact />
            Let's connect
          </h2>
          <p className="md:text-base">
            If you would like to get in touch with me, you can connect through
            various social media platforms or, alternatively, feel free to send
            me an email. I welcome and encourage you to reach out, as I am
            always open to new connections and interactions. Don’t hesitate to
            contact me—whether it's for a professional inquiry, a collaborative
            opportunity, or just a friendly chat.
          </p>
          <div className="my-4 text-center">
            <Link to={"/contact"}>
              <button className="btn btn-error btn-outline btn-lg rounded-full">
                <LuContact2 className="text-2xl" /> Contact Me
              </button>
            </Link>
          </div>
        </div>
        <div className="md:w-2/5 flex flex-col items-center justify-center">
          <img
            src={illustrationContact}
            alt="Illustration Contact"
            className="w-full max-w-sm md:max-w-lg uniform-img"
          />
          <p className="text-xs text-center">
            Illustration by{" "}
            <a href="https://icons8.com/illustrations/author/zD2oqC8lLBBA">
              Olga Ryabtsova
            </a>{" "}
            from <a href="https://icons8.com/illustrations">Ouch!</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
