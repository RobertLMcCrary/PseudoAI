'use client';
import React from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaLightbulb, FaEyeSlash, FaStar } from 'react-icons/fa';
import Link from 'next/link';

function About() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    {/* Add a subtle pattern or graphic here for modern feel */}
                    {/*
                    <div
                        className="absolute inset-0 bg-repeat"
                        style={{
                            backgroundImage: "url('/globe.svg')",
                            backgroundSize: '200px',
                        }}
                    ></div>
                    */}
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                        About PseudoAI
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        Your dedicated partner in mastering coding interviews
                        through intelligent, guided practice.
                    </p>
                    <Link href="/pricing">
                        <span className="inline-block bg-white text-purple-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105 shadow-lg">
                            Learn More About Our Mission
                        </span>
                    </Link>
                </div>
            </header>
            <main className="py-16 px-4 sm:px-8 md:px-16">
                <section className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">
                        A Smarter Way to Prepare
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        At PseudoAI, we believe that true mastery comes from
                        understanding the journey to the solution. Our tools are
                        designed to guide you step-by-step, helping you uncover
                        insights and build confidence without giving away the
                        answer.
                    </p>
                </section>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <FeatureCard
                        title="Guided Problem Solving"
                        description="Receive intelligent, tailored hints that gently nudge you towards the right path, fostering deeper understanding."
                        Icon={FaLightbulb}
                    />
                    <FeatureCard
                        title="Zero Spoilers, Max Learning"
                        description="Instead of just revealing solutions, we provide strategic pseudo-code and detailed explanations to empower your learning process."
                        Icon={FaEyeSlash}
                    />
                    <FeatureCard
                        title="Build Interview Confidence"
                        description="Practice under realistic conditions with our intuitive tools designed to mimic the pressure and environment of actual technical interviews."
                        Icon={FaStar}
                    />
                </section>
                <section className="bg-gray-800 py-12 px-8 rounded-3xl shadow-xl text-center mt-16 border border-gray-700 max-w-4xl mx-auto transform transition duration-500 hover:scale-[1.02] hover:shadow-2xl">
                    <h3 className="text-3xl font-bold mb-4 text-gray-100">
                        Our Unique Approach: Why PseudoAI Stands Out
                    </h3>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Unlike traditional platforms that often just provide
                        solutions, PseudoAI focuses on fostering genuine
                        understanding and incremental progress. By intelligently
                        addressing your roadblocks and offering strategic,
                        hint-based guidance, we ensure you remain engaged, build
                        confidence, and truly master complex concepts
                        effectively.
                    </p>
                    <Link href="/community">
                        <span className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg">
                            Join Our Community
                        </span>
                    </Link>
                </section>
            </main>
            <Footer />
        </div>
    );
}

function FeatureCard({ title, description, Icon }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Icon className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h4 className="text-xl font-semibold">{title}</h4>
            <p className="text-gray-400 mt-2">{description}</p>
        </div>
    );
}

export default About;
