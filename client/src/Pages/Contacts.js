// client/src/Pages/Contacts.js
import React from 'react';
import { motion } from 'framer-motion';
import { BiEnvelope, BiChat, BiTime } from 'react-icons/bi';
import { FaGithub, FaLinkedin, FaMedium } from 'react-icons/fa';

const Contacts = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold text-cartoon-purple mb-4">
                        Let's Connect!
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Have a question, suggestion, or just want to say hi? I'd love to hear from you!
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-8 h-full">
                            <h2 className="text-2xl font-bold text-cartoon-pink mb-6">
                                Get in Touch
                            </h2>

                            <div className="space-y-6">
                                {/* Chat Bot Info */}
                                <div className="flex items-start space-x-4">
                                    <BiChat className="text-3xl text-cartoon-blue mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Live Chat</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Use the chat bot in the bottom right corner for instant assistance.
                                            I'll get back to you as soon as possible!
                                        </p>
                                    </div>
                                </div>

                                {/* Response Time */}
                                <div className="flex items-start space-x-4">
                                    <BiTime className="text-3xl text-cartoon-yellow mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Response Time</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            I typically respond within 24-48 hours. For urgent matters,
                                            please mention it in your message.
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start space-x-4">
                                    <BiEnvelope className="text-3xl text-cartoon-purple mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Email</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            For formal inquiries or collaborations, feel free to email me directly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-lg mb-4">Connect on Social Media</h3>
                                <div className="flex space-x-4">
                                    <a
                                        href="https://github.com/fabiogrillo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle shadow-cartoon-sm hover:shadow-cartoon transition-all"
                                    >
                                        <FaGithub className="text-xl" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/fabgrillo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle shadow-cartoon-sm hover:shadow-cartoon transition-all"
                                    >
                                        <FaLinkedin className="text-xl text-cartoon-blue" />
                                    </a>
                                    <a
                                        href="https://medium.com/@fgrillo123"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle shadow-cartoon-sm hover:shadow-cartoon transition-all"
                                    >
                                        <FaMedium className="text-xl" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-8 h-full">
                            <h2 className="text-2xl font-bold text-cartoon-orange mb-6">
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-4">
                                <details className="collapse collapse-arrow bg-base-200 rounded-cartoon">
                                    <summary className="collapse-title text-lg font-medium">
                                        How can I contribute to the blog?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            I'm always open to guest posts and collaborations! Send me a message
                                            through the chat bot with your idea, and we can discuss the details.
                                        </p>
                                    </div>
                                </details>

                                <details className="collapse collapse-arrow bg-base-200 rounded-cartoon">
                                    <summary className="collapse-title text-lg font-medium">
                                        Can I use your code in my projects?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            Most of the code shared on this blog is open source and free to use.
                                            Please check the specific license mentioned in each article or repository.
                                        </p>
                                    </div>
                                </details>

                                <details className="collapse collapse-arrow bg-base-200 rounded-cartoon">
                                    <summary className="collapse-title text-lg font-medium">
                                        Do you offer consulting services?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            Yes, I'm available for consulting on web development projects.
                                            Feel free to reach out with your requirements, and we can discuss how I can help.
                                        </p>
                                    </div>
                                </details>

                                <details className="collapse collapse-arrow bg-base-200 rounded-cartoon">
                                    <summary className="collapse-title text-lg font-medium">
                                        How often do you publish new content?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            I aim to publish new articles at least once a week. Subscribe to the
                                            newsletter to get notified when new content is available!
                                        </p>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <div className="bg-gradient-to-r from-cartoon-pink to-cartoon-purple rounded-cartoon shadow-cartoon p-8 text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to Start a Conversation?</h2>
                        <p className="text-xl mb-6">
                            Click the chat button in the bottom right corner to send me a message!
                        </p>
                        <div className="text-6xl animate-bounce">
                            ↘️
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contacts;