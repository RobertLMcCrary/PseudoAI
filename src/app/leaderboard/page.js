'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function LeaderboardPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 50;

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();

            const sortedUsers = data.sort((a, b) => {
                const totalA =
                    a.problemsSolved.easy +
                    a.problemsSolved.medium +
                    a.problemsSolved.hard;
                const totalB =
                    b.problemsSolved.easy +
                    b.problemsSolved.medium +
                    b.problemsSolved.hard;
                return totalB - totalA;
            });

            setUsers(sortedUsers);
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto py-16 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Global Rankings</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-xl">
                    <div className="grid grid-cols-12 text-sm font-semibold p-4 border-b border-gray-700">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-3">User</div>
                        <div className="col-span-2 text-center">
                            Total Solved
                        </div>
                        <div className="col-span-2 text-center text-green-400">
                            Easy
                        </div>
                        <div className="col-span-2 text-center text-yellow-400">
                            Medium
                        </div>
                        <div className="col-span-2 text-center text-red-400">
                            Hard
                        </div>
                    </div>

                    <div className="divide-y divide-gray-700">
                        {currentUsers.map((user, index) => {
                            const globalRank =
                                users.findIndex(
                                    (u) => u.clerkId === user.clerkId
                                ) + 1;
                            const totalSolved =
                                user.problemsSolved.easy +
                                user.problemsSolved.medium +
                                user.problemsSolved.hard;

                            return (
                                <div
                                    key={user.clerkId}
                                    className="grid grid-cols-12 items-center p-4 hover:bg-gray-700 transition"
                                >
                                    <div className="col-span-1">
                                        <span
                                            className={`text-xl font-bold ${globalRank === 1
                                                ? 'text-yellow-400'
                                                : globalRank === 2
                                                    ? 'text-gray-400'
                                                    : globalRank === 3
                                                        ? 'text-amber-700'
                                                        : ''
                                                }`}
                                        >
                                            #{globalRank}
                                        </span>
                                    </div>

                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                                            {user.imageUrl ? (
                                                <Image
                                                    src={user.imageUrl}
                                                    alt={user.username}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                user.username[0].toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                {user.username}
                                            </div>
                                            <div className="text-sm text-purple-400">
                                                {user.rank}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-center font-bold text-xl">
                                        {totalSolved}
                                    </div>
                                    <div className="col-span-2 text-center text-green-400">
                                        {user.problemsSolved.easy}
                                    </div>
                                    <div className="col-span-2 text-center text-yellow-400">
                                        {user.problemsSolved.medium}
                                    </div>
                                    <div className="col-span-2 text-center text-red-400">
                                        {user.problemsSolved.hard}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-4 items-center">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
                    >
                        Previous
                    </button>
                    <span className="text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LeaderboardPage;
