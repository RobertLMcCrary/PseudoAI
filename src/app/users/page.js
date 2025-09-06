'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function UsersPage() {
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();
            setAllUsers(data);
        };

        fetchUsers();
    }, []);

    const filteredUsers = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8 md:px-16">
                <h1 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                    User Directory
                </h1>

                {/* Search Bar */}
                <div className="mb-10 shadow-xl rounded-lg">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-5 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-purple-600 transition duration-300 ease-in-out"
                    />
                </div>

                {/* Users List */}
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-2">
                    {filteredUsers.map((user) => (
                        <Link
                            key={user.clerkId}
                            href={`/users/${user.clerkId}`}
                            className="block"
                        >
                            <div className="bg-gray-800 p-7 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-700 transition duration-300 ease-in-out border border-transparent hover:border-purple-500 transform hover:-translate-y-1">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
                                        {user.imageUrl ? (
                                            <Image
                                                src={user.imageUrl}
                                                alt={user.username}
                                                width={20}
                                                height={20}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {user.username}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {`Total Solved: ${
                                                user.problemsSolved.easy +
                                                user.problemsSolved.medium +
                                                user.problemsSolved.hard
                                            }`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
