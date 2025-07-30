import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GrArticle } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { FaProjectDiagram, FaRocket } from "react-icons/fa";
import { BiCodeAlt, BiHeart } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import NewsletterWidget from "../Components/NewsletterWidget";

const Home = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
                  className="badge badge-lg bg-cartoon-yellow text-black shadow-cartoon-sm px-6 py-3 mb-4"
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
                <strong> finest technical content</strong>, seasoned with experience
                and garnished with <em>a touch of humor</em>.
              </p>

              <p className="text-md italic opacity-80">
                "If debugging is the process of removing bugs,
                then programming must be the process of putting them in."
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/blog">
                  <motion.button
                    className="btn btn-lg bg-cartoon-pink text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GrArticle className="text-2xl mr-2" />
                    Explore Stories
                  </motion.button>
                </Link>
                <Link to="/goals">
                  <motion.button
                    className="btn btn-lg btn-outline border-2 border-cartoon-blue text-cartoon-blue hover:bg-cartoon-blue hover:text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover btn-pop"
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
              className="relative flex justify-center items-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  className="text-[150px] md:text-[200px] select-none"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  👨‍💻
                </motion.div>

                {/* Floating elements around */}
                <motion.div
                  className="absolute top-0 -right-10 text-6xl"
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 10, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  💡
                </motion.div>

                <motion.div
                  className="absolute bottom-10 -left-10 text-5xl"
                  animate={{
                    y: [0, 20, 0],
                    rotate: [0, 360, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  ⚡
                </motion.div>

                <motion.div
                  className="absolute top-20 -left-20 text-4xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1.5
                  }}
                >
                  ✨
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* About Section - Reversed */}
      <motion.section
        className="py-20 px-6 md:px-12 bg-base-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Animated Emoji - Left */}
            <motion.div
              className="order-2 lg:order-1 flex justify-center items-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white dark:bg-gray-800 p-12 rounded-cartoon shadow-cartoon border-2 border-black relative overflow-hidden">
                <motion.div
                  className="text-[150px] md:text-[150px] select-none"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  👨‍🍳
                </motion.div>

                {/* Floating ingredients */}
                <motion.div
                  className="absolute top-5 right-5 text-4xl"
                  animate={{
                    rotate: [0, 360],
                    y: [0, 10, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity
                  }}
                >
                  🍝
                </motion.div>

                <motion.div
                  className="absolute bottom-5 left-5 text-3xl"
                  animate={{
                    x: [0, 20, 0],
                    rotate: [-20, 20, -20]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  🎸
                </motion.div>

                <motion.div
                  className="absolute top-10 left-10 text-3xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  ⚽
                </motion.div>
              </div>
            </motion.div>

            {/* Text Content - Right */}
            <motion.div
              className="order-1 lg:order-2 text-center lg:text-left space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold flex items-center justify-center lg:justify-start gap-3">
                <BiCodeAlt className="text-cartoon-pink" />
                The Chef Behind the Code
              </h2>

              <p className="text-lg leading-relaxed">
                I'm a <strong>software engineer</strong> with an insatiable appetite for
                <span className="text-cartoon-blue font-semibold"> data engineering</span> and
                a passion for turning complex problems into
                <span className="text-cartoon-pink font-semibold"> elegant solutions</span>.
              </p>

              <div className="bg-cartoon-yellow/20 p-6 rounded-cartoon border-2 border-cartoon-yellow">
                <h3 className="font-bold text-xl mb-3">Fun Facts About Me:</h3>
                <ul className="space-y-2 text-left">
                  <li>🎸 Musician who codes to the rhythm</li>
                  <li>⚽ Football player (the real kind, with feet!)</li>
                  <li>🐕 Proud parent of Phoebe, a golden retriever who debugs my code with tail wags</li>
                  <li>🍝 Obviously, pasta enthusiast</li>
                </ul>
              </div>

              <p className="text-lg">
                This blog started as a simple portfolio but evolved into my
                <span className="font-bold text-cartoon-purple"> digital playground</span> where
                I share insights, document my journey, and occasionally drop some
                tech wisdom wrapped in digestible, byte-sized pieces.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content - Left */}
            <motion.div
              className="text-center lg:text-left space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold flex items-center justify-center lg:justify-start gap-3">
                <FaRocket className="text-cartoon-yellow animate-float" />
                Mission Control
              </h2>

              <p className="text-lg leading-relaxed">
                Think of this section as my <strong>personal achievement tracker</strong> -
                a transparent look at where I'm headed and how I'm getting there.
                No corporate BS, just real goals and genuine progress.
              </p>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black">
                <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                  Current Mission Status:
                </h3>
                <div className="overflow-x-auto">
                  <ul className="steps steps-horizontal w-full justify-between">
                    <li className="step step-primary" data-content="📚">
                      <span className="text-gray-800 dark:text-gray-100 font-medium">Learn</span>
                    </li>
                    <li className="step step-primary" data-content="🔨">
                      <span className="text-gray-800 dark:text-gray-100 font-medium">Build</span>
                    </li>
                    <li className="step" data-content="🎯">
                      <span className="text-gray-800 dark:text-gray-100 font-medium">Master</span>
                    </li>
                    <li className="step" data-content="🎓">
                      <span className="text-gray-800 dark:text-gray-100 font-medium">Teach</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl">
                  <FaProjectDiagram className="inline mr-2 text-cartoon-purple" />
                  Projects Pipeline
                </h3>
                <p className="text-lg">
                  From experimental prototypes to production-ready applications,
                  I'm always cooking something new in my code kitchen.
                  Check out my GitHub for the latest recipes!
                </p>

                <div className="mockup-code bg-gray-900 text-left">
                  <pre data-prefix="$"><code>git clone happiness</code></pre>
                  <pre data-prefix=">" className="text-warning"><code>building future...</code></pre>
                  <pre data-prefix=">" className="text-success"><code>Success! 🚀</code></pre>
                </div>
              </div>

              {/* Button moved down with more spacing */}
              <div className="pt-6 flex justify-center lg:justify-start">
                <Link to="/goals">
                  <motion.button
                    className="btn btn-lg bg-cartoon-yellow text-black rounded-cartoon shadow-cartoon hover:bg-cartoon-purple btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GoGoal className="text-2xl mr-2" />
                    Track My Progress
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Animated Graphics - Right */}
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <motion.div
                  className="w-64 h-64 bg-gradient-to-br from-cartoon-pink to-cartoon-purple rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-48 h-48 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-6xl">🚀</span>
                  </div>
                </motion.div>

                {/* Orbiting elements */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-3xl">⭐</span>
                </motion.div>

                <motion.div
                  className="absolute bottom-0 right-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-3xl">💻</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-6 md:px-12 bg-gradient-to-br from-cartoon-pink to-cartoon-purple text-white"
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
              Whether you're here to learn, collaborate, or just enjoy some tech stories
              with a side of humor, you're in the right place. Let's make something
              amazing together!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/blog">
                <motion.button
                  className="btn btn-lg bg-white text-cartoon-pink rounded-cartoon shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Reading
                </motion.button>
              </Link>
              <motion.button
                onClick={() => {
                  const chatButton = document.querySelector('[aria-label="Open chat"]');
                  if (chatButton) chatButton.click();
                }}
                className="btn btn-lg btn-outline border-2 border-white text-white hover:bg-white hover:text-cartoon-purple rounded-cartoon"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Chat
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Newsletter Section */}
      <motion.section
        className="py-20 px-6 md:px-12 bg-base-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-2xl">
          <NewsletterWidget source="homepage" variant="default" />
        </div>
      </motion.section>
    </div>
  );
};

export default Home;