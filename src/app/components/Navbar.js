'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

function Navbar() {
    const { user, isLoaded } = useUser();
    const [userProgress, setUserProgress] = useState({
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        solvedProblems: [],
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (user) {
                const response = await fetch(`/api/users/${user.id}`);
                const data = await response.json();

                setUserProgress({
                    totalSolved:
                        data.problemsSolved.easy +
                        data.problemsSolved.medium +
                        data.problemsSolved.hard,
                    easySolved: data.problemsSolved.easy,
                    mediumSolved: data.problemsSolved.medium,
                    hardSolved: data.problemsSolved.hard,
                    solvedProblems: data.solvedProblems,
                });
            }
        };
        fetchUser();
    }, [user]);

    // Guard rendering until Clerk is loaded
    if (!isLoaded) {
        return (
            <nav className="bg-gradient-to-r from-blue-500 to-purple-700 p-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <span className="text-2xl font-bold text-white hover:text-gray-200 transition">
                        PseudoAI
                    </span>
                    <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-gradient-to-r from-blue-500 to-purple-700 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/PseudoAI-Logo.png"
                        alt="PseudoAI Logo"
                        width={50}
                        height={50}
                        className="rounded-full"
                    />
                    <span className="text-2xl font-bold text-white hover:text-gray-200 transition">
                        PseudoAI
                    </span>
                </Link>

                {/* Navigation Links */}
                <Suspense
                    fallback={
                        <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                    }
                >
                    <SignedIn>
                        <div className="space-x-6 flex items-center">
                            <Link href="/">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Dashboard
                                </span>
                            </Link>
                            <Link href="/problems">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Problems
                                </span>
                            </Link>
                            <Link href="/leaderboard">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Leaderboard
                                </span>
                            </Link>
                            <Link href={`/users/${user?.id}`}>
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Profile
                                </span>
                            </Link>
                            <UserButton />
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="space-x-6 flex items-center">
                            <Link href="/">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Home
                                </span>
                            </Link>
                            <Link href="/about">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    About
                                </span>
                            </Link>
                            <Link href="/pricing">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Pricing
                                </span>
                            </Link>
                            <Link href="/contact">
                                <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                    Contact
                                </span>
                            </Link>
                            <SignInButton
                                mode="modal"
                                forceRedirectUrl="/sign-in"
                                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                            >
                                Sign In
                            </SignInButton>
                        </div>
                    </SignedOut>
                </Suspense>
            </div>
        </nav>
    );
}

export default Navbar;
