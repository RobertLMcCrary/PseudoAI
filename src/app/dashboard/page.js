'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

function Dashboard() {
    const { id } = useParams();
    const { user } = useUser();
    const [userData, setUserData] = useState(null);
    const [problemCount, setProblemCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                const userResponse = await fetch(`/api/users/${user.id}`);
                const userData = await userResponse.json();
                setUserData(userData);

                const countResponse = await fetch('/api/problems/count');
                const countData = await countResponse.json();
                setProblemCount(countData.count);
            }
        };

        fetchData();
    }, [user?.id]);

    const totalSolved = userData
        ? (userData.problemsSolved?.easy || 0) +
          (userData.problemsSolved?.medium || 0) +
          (userData.problemsSolved?.hard || 0)
        : 0;

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <main className="container mx-auto px-4 py-12 md:px-8 lg:px-16">
                {/* Welcome Section */}
                <section className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Welcome Back, {user?.firstName || 'Coder'}!
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Ready to conquer new challenges and elevate your coding
                        skills? We&apos;re here to guide you every step of the
                        way.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/problems">
                            <span className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg">
                                Start Solving Problems
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Featured Problem */}
                    <section className="lg:col-span-2 bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3 md:mb-0">
                                Featured Problem: Two Sum
                            </h3>
                            <span className="bg-green-600 px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                                Easy
                            </span>
                        </div>
                        <p className="text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
                            Given an array of integers `nums` and a target
                            integer `target`, return indices of the two numbers
                            such that they add up to `target`. You may assume
                            that each input would have exactly one solution, and
                            you may not use the same element twice.
                        </p>
                        <Link href="/problems/two-sum">
                            <span className="inline-flex items-center text-green-400 hover:text-green-300 font-semibold text-lg md:text-xl group">
                                Solve Now
                                <svg
                                    className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    ></path>
                                </svg>
                            </span>
                        </Link>
                    </section>

                    {/* Your Progress */}
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-gray-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6">
                                Your Progress
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-300">
                                        Easy Problems
                                    </span>
                                    <span className="text-green-400 font-semibold">
                                        {userData?.problemsSolved?.easy || 0}{' '}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-300">
                                        Medium Problems
                                    </span>
                                    <span className="text-yellow-400 font-semibold">
                                        {userData?.problemsSolved?.medium || 0}{' '}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-300">
                                        Hard Problems
                                    </span>
                                    <span className="text-red-400 font-semibold">
                                        {userData?.problemsSolved?.hard || 0}{' '}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-between items-center text-xl font-bold mb-4">
                                <span className="text-gray-100">
                                    Total Solved:
                                </span>
                                <span className="text-purple-400">
                                    {totalSolved}
                                </span>
                            </div>
                            <Link href="/problems">
                                <span className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg">
                                    View All Problems
                                </span>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Call to Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {/* Connect with Users */}
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-gray-700 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold text-gray-100 mb-4">
                            Connect with Fellow Coders
                        </h3>
                        <p className="text-gray-300 mb-6 flex-grow">
                            Explore profiles, track progress, and see how you
                            rank against other developers in our vibrant
                            community.
                        </p>
                        <Link
                            href="/users"
                            className="mt-auto bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
                        >
                            Explore Users
                        </Link>
                    </section>

                    {/* Unlock Pro Features */}
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-gray-700 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold text-gray-100 mb-4">
                            Unlock PseudoAI Pro Features
                        </h3>
                        <p className="text-gray-300 mb-6 flex-grow">
                            Elevate your skills with unlimited access to all
                            problems, exclusive mock interview features, and
                            advanced AI-driven insights. Say goodbye to
                            limitations and unlock your full potential!
                        </p>
                        <Link href="/pricing">
                            <span className="mt-auto bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg">
                                Learn More
                            </span>
                        </Link>
                    </section>

                    {/* Check Out Our Blog */}
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-gray-700 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold text-gray-100 mb-4">
                            Check Out Our Blog
                        </h3>
                        <p className="text-gray-300 mb-6 flex-grow">
                            Dive into articles on coding interview strategies,
                            problem-solving techniques, and stay updated with
                            the latest tech trends.
                        </p>
                        <Link href="/community">
                            <span className="mt-auto bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg">
                                Read Our Blog
                            </span>
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    );
}

function QuickAccessCard({ title, description, href }) {
    return (
        <Link href={href}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:bg-gray-700 transition cursor-pointer">
                <h4 className="text-xl font-bold text-gray-100 mb-2">
                    {title}
                </h4>
                <p className="text-gray-400">{description}</p>
            </div>
        </Link>
    );
}

function StatCard({ title, value, description }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-4xl font-bold text-green-500 mb-2">{value}</p>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}

export default Dashboard;
