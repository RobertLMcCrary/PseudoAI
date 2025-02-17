'use client';
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function InterviewPage() {
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                "Hello! I'm your AI interviewer. Let's begin the technical interview. What programming languages are you comfortable with?",
        },
    ]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState('');
    const [pyodide, setPyodide] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [mounted, setMounted] = useState(false);
    //timer and grading for the interview
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [grade, setGrade] = useState(null);
    const [interviewMetrics, setInterviewMetrics] = useState({
        technicalAccuracy: 0,
        problemSolving: 0,
        communication: 0,
        codeQuality: 0,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const calculateGrade = () => {
        const totalScore =
            (interviewMetrics.technicalAccuracy +
                interviewMetrics.problemSolving +
                interviewMetrics.communication +
                interviewMetrics.codeQuality) /
            4;

        if (totalScore >= 90) return 'A';
        if (totalScore >= 80) return 'B';
        if (totalScore >= 70) return 'C';
        if (totalScore >= 60) return 'D';
        return 'F';
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    //pre prompting for the ai interviewer
    const [systemMessage, setSystemMessage] = useState({
        role: 'system',
        content: `You are an AI technical interviewer conducting a coding interview. 
        Your role is to:
        1. Ask relevant technical questions based on the candidate's experience level
        2. Provide constructive feedback on their responses
        3. Guide the candidate through problem-solving scenarios
        4. Evaluate their understanding of core concepts
        5. Keep responses concise and focused
        6. Maintain a professional but encouraging tone
        7. Ask follow-up questions to dig deeper into their knowledge
        8. Present coding challenges appropriate to their skill level
        9. Assess problem-solving approach and thought process
        10. Give specific feedback on code written in the editor
        11. If the user asks questions related to the challenge given, do not adjust the challenge, just answer the questions and to help them understand the task.
        12. DO NOT give code snippets that could give away the solution.

        Additionally, evaluate the candidate on:
        1. Technical Accuracy (0-100)
        2. Problem Solving Approach (0-100)
        3. Communication Skills (0-100)
        4. Code Quality (0-100)
        
        Update these metrics after each significant interaction.

        You are a an interviewer conducting a coding interview so treat it as serious as possible.
        Start off with questions getting to know the candidate's experience level. 
        Then flow into the coding portion of the interview after you get to know the candidate's experience level.

        Current code in editor: ${code}
        Selected language: ${selectedLanguage}
        Code output: ${output}`,
    });

    //loading the pyodide instance for python execution
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

    const languageMap = {
        javascript: javascript({ jsx: true }),
        python: python(),
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');

        if (selectedLanguage === 'javascript') {
            try {
                const output = [];
                const consoleLog = (...args) => output.push(args.join(' '));
                const sandbox = { console: { log: consoleLog } };

                const runCode = new Function(
                    'sandbox',
                    `with (sandbox) {
                        ${code}
                    }`
                );

                runCode(sandbox);
                setOutput(output.join('\n'));

                // Update system message with new output
                setSystemMessage((prev) => ({
                    ...prev,
                    content: `${
                        prev.content.split('Code output:')[0]
                    }Code output: ${output.join('\n')}`,
                }));
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        } else if (selectedLanguage === 'python' && pyodide) {
            try {
                pyodide.runPython(`
                    import sys
                    import io
                    sys.stdout = io.StringIO()
                `);

                await pyodide.runPythonAsync(code);
                const stdout = pyodide.runPython('sys.stdout.getvalue()');
                setOutput(stdout);

                // Update system message with new output
                setSystemMessage((prev) => ({
                    ...prev,
                    content: `${
                        prev.content.split('Code output:')[0]
                    }Code output: ${stdout}`,
                }));
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        }
        setIsRunning(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = { role: 'user', content: userInput };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setUserInput('');
        setLoading(true);

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

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const reader = res.body.getReader();
            let accumulatedContent = '';

            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

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
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: 'assistant',
                    content: 'An error occurred. Please try again.',
                },
            ]);
        }
        setLoading(false);
    };

    return mounted ? (
        <div className="bg-gray-900 min-h-screen text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Technical Interview
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-purple-400 text-lg">
                            Time: {formatTime(timeElapsed)}
                        </span>
                        {!isInterviewComplete && (
                            <button
                                onClick={() => {
                                    setIsInterviewComplete(true);
                                    setGrade(calculateGrade());
                                }}
                                className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-500 transition"
                            >
                                End Interview
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-gray-800 p-6 rounded-lg shadow-xl">
                    {/* Code Editor Section */}
                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-purple-400">
                                Code Editor
                            </h2>
                            <div className="flex gap-4">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) =>
                                        setSelectedLanguage(e.target.value)
                                    }
                                    className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded border border-gray-600 
                                         focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="javascript">
                                        JavaScript
                                    </option>
                                    <option value="python">Python</option>
                                </select>
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning}
                                    className="px-4 py-1.5 bg-purple-700 text-white rounded hover:bg-purple-600 transition disabled:opacity-50"
                                >
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </button>
                            </div>
                        </div>
                        <CodeMirror
                            value={code}
                            height="60vh"
                            theme={vscodeDark}
                            extensions={[languageMap[selectedLanguage]]}
                            onChange={(value) => {
                                setCode(value);
                                setSystemMessage((prev) => ({
                                    ...prev,
                                    content: `${
                                        prev.content.split(
                                            'Current code in editor:'
                                        )[0]
                                    }Current code in editor: ${value}`,
                                }));
                            }}
                            className="overflow-hidden rounded-lg border border-gray-700"
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                highlightSpecialChars: true,
                                history: true,
                                foldGutter: true,
                                drawSelection: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                syntaxHighlighting: true,
                                bracketMatching: true,
                                closeBrackets: true,
                                autocompletion: true,
                                rectangularSelection: true,
                                crosshairCursor: true,
                                highlightActiveLine: true,
                                highlightSelectionMatches: true,
                                closeBracketsKeymap: true,
                                defaultKeymap: true,
                                searchKeymap: true,
                                historyKeymap: true,
                                foldKeymap: true,
                                completionKeymap: true,
                                lintKeymap: true,
                            }}
                        />
                        {/* Output Section */}
                        {output && (
                            <div className="mt-4 bg-gray-800 p-4 rounded-lg max-h-[20vh] overflow-y-auto">
                                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                                    Output:
                                </h3>
                                <pre className="whitespace-pre-wrap break-words">
                                    {output}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Chat Section */}
                    <div className="bg-gray-900 rounded-lg p-4 flex flex-col max-h-[95vh]">
                        <h2 className="text-xl font-bold mb-4 text-purple-400">
                            AI Interviewer
                        </h2>
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-800 p-4 rounded-lg">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg ${
                                        message.role === 'user'
                                            ? 'bg-purple-900/50 ml-auto max-w-[80%]'
                                            : 'bg-gray-700 max-w-[80%]'
                                    }`}
                                >
                                    <ReactMarkdown
                                        className="prose prose-invert max-w-none"
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
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
                                            pre({ node, children, ...props }) {
                                                return (
                                                    <pre
                                                        className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </pre>
                                                );
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ))}
                        </div>
                        <form
                            onSubmit={handleSendMessage}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                                placeholder="Type your message..."
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Thinking...' : 'Send'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    ) : null;
}

export default InterviewPage;
