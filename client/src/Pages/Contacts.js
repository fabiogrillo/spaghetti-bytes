// client/src/Pages/Contacts.js
import React from 'react';
import { motion } from 'framer-motion';
import { BiEnvelope, BiTime, BiCopy, BiCheck } from 'react-icons/bi';
import { FaGithub, FaLinkedin, FaMedium } from 'react-icons/fa';

const Contacts = () => {
    const [copied, setCopied] = React.useState(false);
    const email = 'spaghettibytes.blog@gmail.com';

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold text-secondary mb-4">
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
                        <div className="bg-white dark:bg-gray-800 rounded-soft shadow-soft-lg p-8 h-full">
                            <h2 className="text-2xl font-bold text-error mb-6">
                                Get in Touch
                            </h2>

                            <div className="space-y-6">
                                {/* Response Time */}
                                <div className="flex items-start space-x-4">
                                    <BiTime className="text-3xl text-warning mt-1" />
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
                                    <BiEnvelope className="text-3xl text-secondary mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <a
                                                href={`mailto:${email}`}
                                                className="text-error hover:text-secondary font-mono text-lg transition-colors"
                                            >
                                                {email}
                                            </a>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleCopyEmail}
                                                className="btn btn-ghost btn-xs"
                                                aria-label="Copy email"
                                            >
                                                {copied ? (
                                                    <BiCheck className="text-success text-lg" />
                                                ) : (
                                                    <BiCopy className="text-lg" />
                                                )}
                                            </motion.button>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            For formal inquiries, collaborations, or technical questions.
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
                                        className="btn btn-circle shadow-soft hover:shadow-soft-lg transition-all"
                                    >
                                        <FaGithub className="text-xl" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/fabgrillo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle shadow-soft hover:shadow-soft-lg transition-all"
                                    >
                                        <FaLinkedin className="text-xl text-primary" />
                                    </a>
                                    <a
                                        href="https://medium.com/@fgrillo123"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle shadow-soft hover:shadow-soft-lg transition-all"
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
                        <div className="bg-white dark:bg-gray-800 rounded-soft shadow-soft-lg p-8 h-full">
                            <h2 className="text-2xl font-bold text-accent mb-6">
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-4">
                                <details className="collapse collapse-arrow bg-base-200 rounded-soft">
                                    <summary className="collapse-title text-lg font-medium">
                                        How can I contribute to the blog?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            I'm always open to guest posts and collaborations! Send me a message
                                            via email with your idea, and I can discuss the details with you.
                                        </p>
                                    </div>
                                </details>

                                <details className="collapse collapse-arrow bg-base-200 rounded-soft">
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

                                <details className="collapse collapse-arrow bg-base-200 rounded-soft">
                                    <summary className="collapse-title text-lg font-medium">
                                        Do you offer consulting services?
                                    </summary>
                                    <div className="collapse-content">
                                        <p className="pt-2">
                                            Yes, I'm available for consulting on web development projects.
                                            Feel free to reach out with your requirements, and I can discuss how I can help you.
                                        </p>
                                    </div>
                                </details>

                                <details className="collapse collapse-arrow bg-base-200 rounded-soft">
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

            </div>
        </div>
    );
};

export default Contacts;