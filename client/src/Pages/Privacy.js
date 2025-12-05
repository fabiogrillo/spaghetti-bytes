import React from 'react';
import { motion } from 'framer-motion';
import { BiShield, BiUser, BiTime, BiServer, BiWorld } from 'react-icons/bi';

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
                className="prose prose-lg max-w-none bg-base-100 dark:bg-base-200 p-8 rounded-soft shadow-soft-lg border border-base-300 text-base-content prose-headings:text-base-content prose-strong:text-base-content prose-li:text-base-content prose-p:text-base-content"
            >
                <p className="lead">
                    Last Updated: December 20, 2024
                </p>

                <h2 className="flex items-center gap-2">
                    <BiUser /> Data Controller
                </h2>
                <p>
                    The data controller responsible for your personal data is:
                </p>
                <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <p className="font-semibold mb-2 text-base-content">Fabio Grillo (Spaghetti Bytes)</p>
                    <p className="text-base-content">Email: <a href="mailto:spaghettibytes.blog@gmail.com" className="text-error hover:text-secondary">spaghettibytes.blog@gmail.com</a></p>
                    <p className="text-base-content">Website: <a href="https://spaghettibytes.blog" className="text-error hover:text-secondary">https://spaghettibytes.blog</a></p>
                </div>

                <h2>Legal Basis for Data Processing</h2>
                <p>Under GDPR Article 6, I process your data based on:</p>
                <ul>
                    <li><strong>Consent (Art. 6.1.a):</strong> Newsletter subscriptions, non-essential cookies</li>
                    <li><strong>Legitimate Interest (Art. 6.1.f):</strong> Analytics for improving user experience</li>
                </ul>

                <h2 className="flex items-center gap-2">
                    <BiTime /> Data Retention Policy
                </h2>
                <p>Your data is retained for the following periods:</p>
                <ul>
                    <li><strong>Analytics Data:</strong> 26 months (Google Analytics default)</li>
                    <li><strong>Comments:</strong> Indefinitely or until deletion request</li>
                    <li><strong>Session Cookies:</strong> 30 days</li>
                    <li><strong>Preferences:</strong> 1 year</li>
                </ul>

                <h2>Gathered Informations</h2>
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

                <h2 className="flex items-center gap-2">
                    <BiServer /> Third-party Data Processors
                </h2>
                <p>I use the following third-party services:</p>
                <div className="space-y-4">
                    <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                        <h3 className="font-semibold text-lg mb-2 text-base-content">Google Analytics</h3>
                        <p className="text-sm text-base-content">
                            <strong>Purpose:</strong> Website traffic analysis<br/>
                            <strong>Data:</strong> IP address (anonymized), pages visited<br/>
                            <strong>Privacy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-error hover:text-secondary">Google Privacy Policy</a>
                        </p>
                    </div>
                    <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                        <h3 className="font-semibold text-lg mb-2 text-base-content">Vercel</h3>
                        <p className="text-sm text-base-content">
                            <strong>Purpose:</strong> Website hosting<br/>
                            <strong>Data:</strong> Server logs, request metadata<br/>
                            <strong>Privacy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-error hover:text-secondary">Vercel Privacy Policy</a>
                        </p>
                    </div>
                </div>

                <h2 className="flex items-center gap-2">
                    <BiWorld /> International Data Transfers
                </h2>
                <p>
                    Your data may be transferred to countries outside the European Economic Area (EEA):
                </p>
                <ul>
                    <li><strong>United States:</strong> Google Analytics, Vercel (protected by EU-US Data Privacy Framework)</li>
                    <li>All transfers comply with GDPR requirements through Standard Contractual Clauses (SCCs)</li>
                </ul>

                <h2>How to Exercise Your Rights</h2>
                <p>
                    To exercise your GDPR rights (access, rectification, deletion, portability, restriction, objection),
                    please send an email to:
                </p>
                <div className="bg-error/10 border border-error/30 p-4 rounded-lg">
                    <p className="font-semibold text-error mb-2">Data Rights Request</p>
                    <p className="text-base-content">Email: <a href="mailto:spaghettibytes.blog@gmail.com?subject=GDPR%20Data%20Rights%20Request" className="text-error hover:text-secondary font-mono">spaghettibytes.blog@gmail.com</a></p>
                    <p className="text-sm mt-2 text-base-content">Subject: "GDPR Data Rights Request"</p>
                    <p className="text-sm mt-2 text-base-content"><strong>Response time:</strong> Within 30 days</p>
                </div>

                <h2>Contacts</h2>
                <p>
                    If you have any questions about privacy, write to:
                    <a href="mailto:spaghettibytes.blog@gmail.com" className="text-error hover:text-secondary ml-1">spaghettibytes.blog@gmail.com</a>
                </p>
            </motion.div>
        </div>
    );
};

export default Privacy;