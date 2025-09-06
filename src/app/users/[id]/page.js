'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const UserProfilePage = () => {
    const { id } = useParams(); // Extract user ID from URL
    const [userData, setUserData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            setUserData(data);
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);

    if (!userData) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 animate-spin"></div>
            </div>
        );
    }

    const totalSolved =
        userData.problemsSolved.easy +
        userData.problemsSolved.medium +
        userData.problemsSolved.hard;

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8 md:px-16">
                <Link
                    href="/users"
                    className="flex items-center mb-10 text-purple-400 hover:text-purple-300 transition duration-300 ease-in-out transform hover:-translate-x-1 group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-2 group-hover:animate-pulse"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                    </svg>
                    <span className="text-lg">Back to Users</span>
                </Link>

                {/* User Profile Info */}
                <div className="text-center mb-12 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                    <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                        {userData.username}
                    </h1>
                    <h1 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                        {userData.rank}
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">
                        See what {userData.username} has been up to!
                    </p>
                    <div className="flex items-center justify-center mt-6">
                        {userData.imageUrl ? (
                            <Image
                                src={userData.imageUrl}
                                alt={userData.username}
                                width={96}
                                height={96}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold">
                                {userData.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Statistics */}
                <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg font-bold">
                                Total Problems Solved
                            </h3>
                            <p className="text-2xl">{totalSolved}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-green-400 font-bold">
                                Easy Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.easy}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-yellow-400 font-bold">
                                Medium Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.medium}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-red-400 font-bold">
                                Hard Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.hard}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Solved Problems List */}
                <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        Solved Problems
                    </h2>
                    {userData.solvedProblems.length > 0 ? (
                        <ul className="space-y-3">
                            {userData.solvedProblems.map((problem) => (
                                <li
                                    key={problem.problemId + problem.solvedAt}
                                    className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="text-lg font-bold">
                                            {problem.problemId}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            Difficulty: {problem.difficulty}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Solved On:{' '}
                                        {new Date(
                                            problem.solvedAt
                                        ).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No problems solved yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
