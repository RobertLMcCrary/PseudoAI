'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

function Pricing() {
    return (
        <div className="flex flex-col  min-h-screen bg-gray-900 text-white h-[100vh]">
            <Navbar />
            <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-lg md:text-xl text-gray-200">
                    Get started for free or unlock the full experience with Pro.
                </p>
            </header>
            <main className="py-16 px-4 sm:px-8 md:px-16">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <PricingCard
                        title="Free Plan"
                        price="$0"
                        features={[
                            'Access to LeetCode hints',
                            'Pseudo Code Generation',
                            'Unlimited Access to Base Features',
                        ]}
                        buttonText="Start for Free"
                        buttonStyle="bg-gray-800 text-white hover:bg-gray-700"
                    />
                    <PricingCard
                        title="Pro Plan"
                        price="$1/month"
                        features={[
                            'Unlimited access to all features',
                            'Realistic Mock Interview Simulation',
                            'Live Code Editing With Friends',
                        ]}
                        buttonText="Coming Soon"
                        buttonStyle="bg-purple-600 text-white hover:bg-purple-500"
                        link="/checkout"
                    />
                </section>
            </main>
            <Footer />
        </div>
    );
}

function PricingCard({
    title,
    price,
    features,
    buttonText,
    buttonStyle,
    link,
}) {
    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-4xl font-extrabold mb-4">{price}</p>
            <ul className="text-gray-400 mb-8 space-y-2">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-center"
                    >
                        <span className="text-green-500 mr-2">✔</span>
                        {feature}
                    </li>
                ))}
            </ul>
            {buttonText === "Start for Free" ? (
        <SignInButton
            className={`px-6 py-3 rounded-full font-semibold transition ${buttonStyle}`}
        >
            {buttonText}
        </SignInButton>
    ) : (
        <a
            href={link}
            className={`inline-block px-6 py-3 rounded-full font-semibold transition ${buttonStyle}`}
        >
            {buttonText}
        </a>
    )}
        </div>
    );
}

export default Pricing;