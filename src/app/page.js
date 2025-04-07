'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

//react markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

//components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './dashboard/page';
import CodeEditor from './components/CodeEditor';
import ProblemSection from './components/ProblemMetaData';

import { FaRobot, FaBrain, FaComments } from 'react-icons/fa';

//clerk
import { SignUpButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

//custom hook for viewport width
function useViewportWidth() {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

//demo problem object instead of fetching from the database
const demoTwoSum = {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: 'Arrays, Hashing',
    description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: [
        'Each input would have exactly one solution.',
        'You may not use the same element twice.',
    ],
    examples: [
        {
            input: 'nums = [2, 7, 11, 15] \ntarget = 9\n',
            output: '[0, 1]',
        },
    ],
    starterCodes: {
        python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
        javascript:
            'function twoSum(nums, target) {\n    // Write your code here\n    \n}',
    },
    testCases: [
        {
            input: { nums: [2, 7, 11, 15], target: 9 },
            output: [0, 1],
        },
        {
            input: { nums: [3, 2, 4], target: 6 },
            output: [1, 2],
        },
    ],
    functionCalls: {
        javascript:
            'const nums = input.nums;\nconst target = input.target;\nreturn twoSum(nums, target);',
        python: 'nums = input.nums\ntarget = input.target\nresult = twoSum(nums, target)',
    },
};

function Home() {
    //state management for screen width
    const viewportWidth = useViewportWidth();

    //state management for the demo code editor
    const [code, setCode] = useState(demoTwoSum.starterCodes.python);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [pyodide, setPyodide] = useState(null);

    //user input state management for the ai chatbot
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    //top users for the leaderboard section
    const [topUsers, setTopUsers] = useState([]);

    //get top 3 users for the leaderboard section
    useEffect(() => {
        const fetchTopUsers = async () => {
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

            setTopUsers(sortedUsers.slice(0, 3));
        };

        fetchTopUsers();
    }, []);

    // initialize pyodide to run python code in the demo editor (executes on the frontend only)
    useEffect(() => {
        if (selectedLanguage === 'python' && !pyodide) {
            const loadPyodide = async () => {
                const pyodideInstance = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                });
                setPyodide(pyodideInstance);
            };
            loadPyodide();
        }
    }, [selectedLanguage, pyodide]);

    // handle language change in the demo code editor
    useEffect(() => {
        setCode(demoTwoSum.starterCodes[selectedLanguage]);
    }, [selectedLanguage]);

    // function to handle messaging chatbot
    const handleUserInput = async (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const systemMessage = {
                role: 'system',
                content: `You are a coding mentor helping the user solve the LeetCode problem "${demoTwoSum.title}". Do not provide all the information at once—answer step by step based on the user's input and maintain brevity.
                         Your primary role is to guide the user step by step without directly providing a complete solution or code. NEVER provide the direct solution ever. 
                         Follow these guidelines but remember, be concise and uncluttered in your responses. 
                         1. Provide hints and ask leading questions: Help the user break the problem into smaller parts and think critically about their approach.
                         2. Explain relevant concepts: Focus on the key ideas and logic needed to understand and solve the problem.
                         3. Suggest strategies, not solutions: Offer general approaches, like using specific data structures or algorithms, without writing the code for them
                         4. Redirect solution requests: If asked for the solution, remind the user of your mentoring role and guide them back to problem-solving.
                         5. Motivate and affirm progress: Provide encouragement and acknowledge their efforts to keep them engaged.
                         6. Encourage incremental solutions: Suggest building and testing small chunks of code to validate progress.
                         7. Guide debugging efforts: Ask questions to help the user identify and resolve issues in their code.
                         8. Highlight edge cases: Encourage the user to consider and handle unusual scenarios, such as empty inputs or large datasets.
                         9. Dont give irrelevant information 
                         10. Again be concise there should never be more than a paragraph of text in all your responses.

                         IMPORTANT NOTE: If the user asks for syntax help give them code snippets and explain how to do what ever they are asking.
                         EXAMPLE: if a user forgets how to make an array in python with a specific length you can give them a code snippet on how to do it and explain it.

                         - If the user asks for pseudo code provide it, don't be specific with syntax and keep the pseudo code simple.
                         - If the user asks what the next step is on their solution and they are already on the right track, tell them what to do next.
                         
                         Problem Context:
                         ${demoTwoSum.description}
                         Difficulty: ${demoTwoSum.difficulty}
                         Topics: ${demoTwoSum.topics}
                         Starter Code: ${demoTwoSum.starterCodes[selectedLanguage]}
                         User Code: ${code}
                         Language: ${selectedLanguage}
                         Test Cases Results: ${results}}`,
            };

            const userMessage = { role: 'user', content: userInput };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setUserInput('');
            setLoading(true);

            // Create temporary message for streaming
            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [...messages, systemMessage, userMessage],
                    }),
                });

                if (!res.ok)
                    throw new Error(`HTTP error! status: ${res.status}`);

                const reader = res.body.getReader();
                let accumulatedContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = new TextDecoder().decode(value);
                    accumulatedContent += text;

                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1].content =
                            accumulatedContent;
                        return newMessages;
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                setResponse('Something went wrong. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <SignedIn>
                <Dashboard />
            </SignedIn>
            <SignedOut>
                <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Level Up Your Coding Interview Game
                    </h1>
                    <div className="max-w-3xl mx-auto px-4">
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                            Master Data Structures & Algorithms with AI-Powered
                            Guidance.
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-6">
                        <SignUpButton
                            mode="modal"
                            forceRedirectUrl="/signup"
                            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105"
                        >
                            Start Your Journey
                        </SignUpButton>
                        <Link href="/problems">
                            <span className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition transform hover:scale-105">
                                Explore Problems
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="py-20 px-4 sm:px-8 md:px-16">
                    <section className="max-w-6xl mx-auto mb-20">
                        <h2 className="text-4xl font-bold text-center mb-16">
                            How PseudoAI Transforms Your Practice
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <FeatureCard
                                title="AI-Powered Learning"
                                description="Get unstuck with intelligent hints and guidance tailored to your approach"
                                Icon={FaRobot}
                            />
                            <FeatureCard
                                title="Rank System"
                                description="Progress from Novice to Grand Master as you solve more problems"
                                Icon={FaBrain}
                            />
                            <FeatureCard
                                title="Pseudo Code Assistant"
                                description="Break down complex problems with AI-generated pseudo code explanations"
                                Icon={FaComments}
                            />
                        </div>
                    </section>
                    <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">
                            Ready to Excel in Technical Interviews?
                        </h2>
                        <p className="text-xl mb-8">
                            Join fellow developers who are mastering DSA with
                            PseudoAI&apos;s intelligent guidance.
                        </p>
                        <SignUpButton
                            mode="modal"
                            forceRedirectUrl="/signup"
                            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105"
                        >
                            Get Started Free
                        </SignUpButton>
                    </section>
                    <section className="pt-20 bg-gray-800 rounded mt-20 h-[110vh]">
                        <h2 className="text-4xl font-bold text-center mb-8">
                            Try It Now: Two Sum
                        </h2>
                        <p className="text-xl text-center text-gray-300 mb-12">
                            Experience our AI-powered coding assistant in action
                            with this classic interview problem
                        </p>

                        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-6 gap-6">
                            {/* Problem Description - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <ProblemSection problem={demoTwoSum} />
                            </div>

                            {/* Code Editor - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <CodeEditor
                                    code={code}
                                    setCode={setCode}
                                    selectedLanguage={selectedLanguage}
                                    setSelectedLanguage={setSelectedLanguage}
                                    runCode={() =>
                                        document
                                            .querySelector(
                                                'button[data-signup]'
                                            )
                                            .click()
                                    }
                                    isRunning={false}
                                    problem={demoTwoSum}
                                    results={null}
                                />
                                <SignUpButton
                                    mode="modal"
                                    forceRedirectUrl="/signup"
                                    className="hidden"
                                    data-signup
                                >
                                    Sign Up
                                </SignUpButton>
                            </div>

                            {/* AI Assistant - Takes 2 columns */}
                            <div className="lg:col-span-2 h-full">
                                <h2 className="text-xl font-bold text-purple-400">
                                    AI Assistant
                                </h2>
                                <div
                                    className="flex-grow mt-4 overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700"
                                    style={{ height: '50vh' }}
                                >
                                    {messages.map((message, index) =>
                                        message.role === 'user' ||
                                        message.role === 'assistant' ? (
                                            <div
                                                key={index}
                                                className={`mb-4 ${
                                                    message.role === 'user'
                                                        ? 'text-blue-400'
                                                        : 'text-gray-300'
                                                }`}
                                            >
                                                <div className="font-bold mb-1">
                                                    {message.role === 'user'
                                                        ? 'You:'
                                                        : 'AI Assistant:'}
                                                </div>
                                                <ReactMarkdown
                                                    className="prose prose-invert max-w-none"
                                                    remarkPlugins={[
                                                        remarkGfm,
                                                        remarkMath,
                                                    ]}
                                                    rehypePlugins={[
                                                        rehypeKatex,
                                                    ]}
                                                    components={{
                                                        code({
                                                            node,
                                                            inline,
                                                            className,
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <code
                                                                    className={`${className} bg-gray-800 rounded px-1`}
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        pre({
                                                            node,
                                                            children,
                                                            ...props
                                                        }) {
                                                            return (
                                                                <div>
                                                                    <pre
                                                                        className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </pre>
                                                                    {message.content.includes(
                                                                        "Here's the pseudocode"
                                                                    ) && (
                                                                        <button
                                                                            onClick={() =>
                                                                                navigator.clipboard.writeText(
                                                                                    message.content
                                                                                )
                                                                            }
                                                                            className="mt-2 px-3 py-1 bg-gray-700 text-sm text-gray-300 rounded hover:bg-gray-600"
                                                                        >
                                                                            Copy
                                                                            Pseudocode
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : null
                                    )}
                                    {messages.length === 0 && (
                                        <p className="text-gray-400">
                                            Ask for hints or pseudocode here.
                                        </p>
                                    )}
                                </div>
                                <form
                                    onSubmit={handleUserInput}
                                    className="mt-4"
                                >
                                    <textarea
                                        value={userInput}
                                        onChange={(e) =>
                                            setUserInput(e.target.value)
                                        }
                                        className="w-full p-2 rounded border border-gray-700 text-gray-200 bg-gray-800 resize-none"
                                        placeholder="Ask something..."
                                        rows="2"
                                    />
                                    <button
                                        type="submit"
                                        className="mt-2 w-full bg-purple-700 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition"
                                    >
                                        {loading ? 'Thinking...' : 'Send'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                    <section className="py-20 bg-gray-800 rounded-xl mt-20">
                        <h2 className="text-4xl font-bold text-center mb-8">
                            Top Problem Solvers
                        </h2>
                        <p className="text-xl text-center text-gray-300 mb-12">
                            Join our community of dedicated problem solvers and
                            climb the ranks
                        </p>

                        <div className="max-w-4xl mx-auto px-4">
                            <div className="bg-gray-900 rounded-xl p-6 mb-8">
                                <div className="grid grid-cols-1 divide-y divide-gray-700">
                                    {topUsers.map((user, index) => {
                                        const totalSolved =
                                            user.problemsSolved.easy +
                                            user.problemsSolved.medium +
                                            user.problemsSolved.hard;
                                        const medals = [
                                            'text-yellow-400',
                                            'text-gray-400',
                                            'text-amber-700',
                                        ];

                                        return (
                                            <div
                                                key={user.clerkId}
                                                className="flex items-center justify-between p-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span
                                                        className={`text-2xl font-bold ${medals[index]}`}
                                                    >
                                                        #{index + 1}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                                                        {user.imageUrl ? (
                                                            <Image
                                                                src={
                                                                    user.imageUrl
                                                                }
                                                                alt={
                                                                    user.username
                                                                }
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                            />
                                                        ) : (
                                                            user.username[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="font-semibold">
                                                        {user.username}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`font-bold ${medals[index]}`}
                                                    >
                                                        {user.rank}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {totalSolved} Problems
                                                        Solved
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/leaderboard"
                                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-700 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105"
                                >
                                    View Full Leaderboard
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </SignedOut>
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

export default Home;
