import React from 'react';
import { motion } from 'framer-motion';
import { BiShield } from 'react-icons/bi';

const Privacy = () => {
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <motion.div
                    className="inline-block mb-6"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="badge badge-lg bg-primary text-white shadow-soft px-6 py-3">
                        <BiShield className="mr-2" size={20} />
                        Privacy Policy
                    </span>
                </motion.div>

                <h1 className="text-4xl font-bold mb-4">
                    Your Privacy is <span className="gradient-text">Important</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="prose prose-lg max-w-none bg-white dark:bg-gray-800 p-8 rounded-soft shadow-soft-lg border border-base-300 text-gray-900 dark:text-gray-100 prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-li:text-gray-900 dark:prose-li:text-gray-100"
            >
                <p className="lead">
                    Last Update: {new Date().toLocaleDateString('it-IT')}
                </p>

                <h2>1. Gathered informations</h2>
                <p>
                    I only collect the information necessary to provide and improve the service:
                </p>
                <ul>
                    <li><strong>Navigation information:</strong> Pages visited, time spent on site</li>
                    <li><strong>Technical information:</strong> Browser type, operating system</li>
                    <li><strong>Cookies:</strong> To save your preferences (theme, language)</li>
                    <li><strong>Contact details:</strong> Only if you use the chatbot (name, email)</li>
                </ul>

                <h2>2. How I Use Information</h2>
                <ul>
                    <li>To improve blog content</li>
                    <li>To understand which items are most popular</li>
                    <li>To answer your questions via chat</li>
                    <li>To maintain your display preferences</li>
                </ul>

                <h2>3. Cookies</h2>
                <p>I use three types of cookies:</p>
                <ul>
                    <li><strong>Essentials:</strong> For basic website functionality</li>
                    <li><strong>Analytics:</strong> To understand how you use the site (Google Analytics)</li>
                    <li><strong>Preferences:</strong> To save theme and other settings</li>
                </ul>

                <h2>4. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access your data</li>
                    <li>Correct your data</li>
                    <li>Delete your data</li>
                    <li>Object to processing</li>
                    <li>Withdraw consent at any time</li>
                </ul>

                <h2>5. Contacts</h2>
                <p>
                    If you have any questions about privacy, use the chat bot or write to:
                    spaghettibytes.blog@gmail.com
                </p>
            </motion.div>
        </div>
    );
};

export default Privacy;