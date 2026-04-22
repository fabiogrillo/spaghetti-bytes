import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "../Components/SEO";
import { GrArticle } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import {
  FaProjectDiagram,
  FaRocket,
  FaHammer,
  FaGraduationCap,
  FaDog,
  FaGithub,
  FaLinkedin,
  FaMedium,
} from "react-icons/fa";
import { BiCodeAlt, BiHeart, BiBook, BiTargetLock, BiTime } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { GiSoccerBall, GiMusicalNotes } from "react-icons/gi";
import ImprovedStoryCard from "../Components/ImprovedStoryCard";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [latestStories, setLatestStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/stories');
        const data = await res.json();
        const sorted = (data.stories || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setLatestStories(sorted);
      } catch (e) {
        console.error('Error fetching latest stories:', e);
      } finally {
        setStoriesLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="overflow-hidden">
      <SEO
        title="Home"
        description="A tech blog about software engineering, machine learning, and system design. Exploring complex problems and sharing practical solutions."
      />
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

              {/* Blog tagline — part of left column flow */}
              <p className="text-base text-gray-600 dark:text-gray-400 flex items-start gap-3 lg:text-left text-center justify-center lg:justify-start">
                <BiBook className="text-4xl text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Dive into my collection of carefully crafted stories where code meets creativity.
                  Each article is a byte-sized adventure waiting to be discovered!
                </span>
              </p>
            </motion.div>

            {/* Right column — Profile + Latest Story card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-base-100 rounded-soft border-2 border-primary shadow-soft-lg overflow-hidden">
                {/* Profile section */}
                <div className="p-6 flex flex-col items-center text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="text-5xl mb-3">👨‍💻</div>
                  <h3 className="font-bold text-xl">Fabio Grillo</h3>
                  <p className="text-sm opacity-60 mt-1">Software Engineer &amp; Pasta Enthusiast 🍝</p>
                  <div className="flex gap-3 mt-4">
                    <a
                      href="https://github.com/fabiogrillo"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="btn btn-ghost btn-sm btn-circle text-xl hover:text-secondary transition-colors"
                    >
                      <FaGithub />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/fabgrillo"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="btn btn-ghost btn-sm btn-circle text-xl hover:text-info transition-colors"
                    >
                      <FaLinkedin />
                    </a>
                    <a
                      href="https://medium.com/@fgrillo123"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Medium"
                      className="btn btn-ghost btn-sm btn-circle text-xl hover:text-primary transition-colors"
                    >
                      <FaMedium />
                    </a>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Latest story section */}
                {storiesLoading ? (
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-base-300 rounded animate-pulse w-2/5" />
                    <div className="h-5 bg-base-300 rounded animate-pulse" />
                    <div className="h-3 bg-base-300 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-base-300 rounded animate-pulse w-1/2" />
                  </div>
                ) : latestStories[0] ? (
                  <div className="p-6 flex flex-col gap-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                      🍝 Latest From the Kitchen
                    </p>
                    <h4 className="font-bold text-base line-clamp-2 leading-snug">
                      {latestStories[0].title}
                    </h4>
                    <p className="text-sm opacity-60 line-clamp-2">
                      {latestStories[0].summary}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {latestStories[0].tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="badge badge-sm bg-primary/10 text-primary border border-primary/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs opacity-40 flex items-center gap-1">
                        <BiTime />
                        {Math.max(1, Math.ceil((latestStories[0].content?.split(/\s+/).length || 200) / 200))} min read
                      </span>
                      <Link to={`/visualizer/${latestStories[0]._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm bg-error text-white rounded-soft shadow-soft btn-pop"
                        >
                          Read Now →
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Latest Posts Section */}
      <motion.section
        className="py-20 px-6 md:px-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-3">
              <GrArticle className="text-error" />
              Latest Posts
            </h2>
            <p className="text-lg mt-4 opacity-70">Fresh bytes from the kitchen</p>
          </motion.div>

          {storiesLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg text-error"></span>
            </div>
          ) : latestStories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {latestStories.map((story, index) => (
                  <ImprovedStoryCard key={story._id} story={story} index={index} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/blog">
                  <motion.button
                    className="btn btn-lg bg-error text-white rounded-soft shadow-soft-lg hover:shadow-soft-hover btn-pop"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GrArticle className="mr-2" /> View All Stories
                  </motion.button>
                </Link>
              </div>
            </>
          ) : null}
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

              <div className="bg-base-100 p-6 rounded-soft shadow-soft-lg border border-base-300">
                <h3 className="font-bold text-xl mb-6">
                  Current Mission Status:
                </h3>
                {/* Custom steps — reliable on all screen sizes */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                  {[
                    { icon: BiBook, label: "Learn", done: true },
                    { icon: FaHammer, label: "Build", done: true },
                    { icon: BiTargetLock, label: "Master", done: false },
                    { icon: FaGraduationCap, label: "Teach", done: false },
                  ].map((step, i, arr) => {
                    const Icon = step.icon;
                    return (
                      <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                              ${step.done
                                ? "bg-primary text-white shadow-soft"
                                : "border-2 border-base-300 text-base-content/30"
                              }`}
                          >
                            <Icon className="text-xl" />
                          </div>
                          <span
                            className={`text-sm font-semibold ${step.done ? "text-primary" : "opacity-30"}`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <div
                            className={`flex-none transition-all
                              w-0.5 h-6 md:h-0.5 md:w-10 lg:w-16
                              ${step.done ? "bg-primary" : "bg-base-300"}`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
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
