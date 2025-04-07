'use client';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const subject = encodeURIComponent('Contact Form Submission');
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );
        const mailtoLink = `mailto:pseudoaidev@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink; // Redirect to mailto link
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Contact Us
                </h1>
                <p className="text-lg md:text-xl text-gray-200">
                    We would love to hear your feedback!
                </p>
            </header>
            <main className="py-16 px-4 sm:px-8 md:px-16">
                <section className="max-w-2xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg"
                    >
                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="block text-sm font-semibold mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="message"
                                className="block text-sm font-semibold mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows="4"
                                className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 transition"
                        >
                            Send Message
                        </button>
                    </form>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Contact;
