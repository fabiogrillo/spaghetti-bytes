import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GrArticle } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import {
  FaProjectDiagram,
  FaRocket,
  FaHammer,
  FaGraduationCap,
  FaDog,
} from "react-icons/fa";
import { BiCodeAlt, BiHeart, BiBook, BiTargetLock } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { GiSoccerBall, GiMusicalNotes } from "react-icons/gi";
import StatsDisplay from "../Components/StatsDisplay";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <motion.section
        className="min-h-[90vh] flex items-center py-12 px-6 md:px-12"
        {...fadeInUp}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content - Left */}
            <motion.div
              className="text-center lg:text-left space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block">
                <motion.span
                  className="badge badge-lg bg-warning text-black shadow-soft px-6 py-3 mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  <BsStars className="mr-2" /> Welcome to my digital kitchen!
                </motion.span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Where <span className="gradient-text">Code</span> Meets
                <br />
                <span className="gradient-text">Creativity</span>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed">
                Like a master chef in the kitchen, I'm here to serve you the
                <strong> finest technical content</strong>, seasoned with
                experience and garnished with <em>a touch of humor</em>.
              </p>

              <p className="text-md italic opacity-80">
                "If debugging is the process of removing bugs, then programming
                must be the process of putting them in."
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/blog">
                  <motion.button
                    className="btn btn-lg bg-error text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GrArticle className="text-2xl mr-2" />
                    Explore Stories
                  </motion.button>
                </Link>
                <Link to="/goals">
                  <motion.button
                    className="btn btn-lg btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GoGoal className="text-2xl mr-2" />
                    See My Journey
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Animated Emoji - Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-12"
            >
              <StatsDisplay variant="horizontal" showAnimation={true} />
            </motion.div>

            {/* Blog Stats Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8"
            >
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
                <BiBook className="text-2xl text-primary" /> Dive into my
                collection of carefully crafted stories where code meets
                creativity. Each article is a byte-sized adventure waiting to be
                discovered!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/blog")}
                className="px-8 py-4 bg-gradient-to-r from-error to-secondary text-white 
                       font-bold rounded-soft shadow-soft-lg hover:shadow-soft-hover
                       transition-all duration-300"
              >
                Explore the Blog
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="py-20 px-6 md:px-12 bg-base-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-3">
                <BiCodeAlt className="text-error" />
                The Chef Behind the Code
              </h2>

              <p className="text-lg leading-relaxed">
                I'm a <strong>software engineer</strong> with an insatiable
                appetite for
                <span className="text-primary font-semibold">
                  {" "}
                  data engineering
                </span>{" "}
                and a passion for turning complex problems into
                <span className="text-error font-semibold">
                  {" "}
                  elegant solutions
                </span>
                .
              </p>

              <div className="bg-warning/20 p-6 rounded-soft border-2 border-warning">
                <h3 className="font-bold text-xl mb-3">Fun Facts About Me:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <GiMusicalNotes className="text-xl text-warning" /> Musician
                    who codes to the rhythm
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <GiSoccerBall className="text-xl text-warning" /> Football
                    player (the real kind, with feet!)
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <FaDog className="text-xl text-warning" /> Proud parent of
                    Phoebe, a golden retriever who debugs my code with tail wags
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <BiCodeAlt className="text-xl text-warning" /> Obviously,
                    pasta enthusiast
                  </li>
                </ul>
              </div>

              <p className="text-lg">
                This blog started as a simple portfolio but evolved into my
                <span className="font-bold text-secondary">
                  {" "}
                  digital playground
                </span>{" "}
                where I share insights, document my journey, and occasionally
                drop some tech wisdom wrapped in digestible, byte-sized pieces.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Goals & Projects Section */}
      <motion.section
        className="py-20 px-6 md:px-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-3">
                <FaRocket className="text-warning animate-float" />
                Mission Control
              </h2>

              <p className="text-lg leading-relaxed">
                Think of this section as my{" "}
                <strong>personal achievement tracker</strong> - a transparent
                look at where I'm headed and how I'm getting there. No corporate
                BS, just real goals and genuine progress.
              </p>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-soft shadow-soft-lg border border-base-300">
                <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                  Current Mission Status:
                </h3>
                <ul className="steps steps-vertical md:steps-horizontal w-full">
                  <li className="step step-primary">
                    <span className="text-gray-800 dark:text-gray-100 font-medium flex items-center gap-2 text-sm md:text-base">
                      <BiBook className="text-lg md:text-xl" /> Learn
                    </span>
                  </li>
                  <li className="step step-primary">
                    <span className="text-gray-800 dark:text-gray-100 font-medium flex items-center gap-2 text-sm md:text-base">
                      <FaHammer className="text-lg md:text-xl" /> Build
                    </span>
                  </li>
                  <li className="step">
                    <span className="text-gray-800 dark:text-gray-100 font-medium flex items-center gap-2 text-sm md:text-base">
                      <BiTargetLock className="text-lg md:text-xl" /> Master
                    </span>
                  </li>
                  <li className="step">
                    <span className="text-gray-800 dark:text-gray-100 font-medium flex items-center gap-2 text-sm md:text-base">
                      <FaGraduationCap className="text-lg md:text-xl" /> Teach
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl">
                  <FaProjectDiagram className="inline mr-2 text-secondary" />
                  Projects Pipeline
                </h3>
                <p className="text-lg">
                  From experimental prototypes to production-ready applications,
                  I'm always cooking something new in my code kitchen. Check out
                  my GitHub for the latest recipes!
                </p>

                <div className="mockup-code bg-neutral text-neutral-content text-left">
                  <pre data-prefix="$">
                    <code>git clone happiness</code>
                  </pre>
                  <pre data-prefix=">" className="text-warning">
                    <code>building future...</code>
                  </pre>
                  <pre data-prefix=">" className="text-success">
                    <code>Success! 🚀</code>
                  </pre>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <Link to="/goals">
                  <motion.button
                    className="btn btn-lg bg-warning text-black rounded-soft shadow-soft-lg hover:bg-secondary btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GoGoal className="text-2xl mr-2" />
                    Track My Progress
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-6 md:px-12 bg-gradient-to-br from-error to-secondary text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BiHeart className="text-6xl mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Join the Adventure?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're here to learn, collaborate, or just enjoy some tech
              stories with a side of humor, you're in the right place. Let's
              make something amazing together!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/blog">
                <motion.button
                  className="btn btn-lg bg-white text-error rounded-soft shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Reading
                </motion.button>
              </Link>
              <motion.button
                onClick={() => navigate('/contacts')}
                className="btn btn-lg btn-outline border-2 border-white text-white hover:bg-white hover:text-secondary rounded-soft"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
