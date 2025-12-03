'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

//ui components
import CodeEditor from '../../components/CodeEditor';
import ProblemMetaData from '../../components/ProblemMetaData';
import NotePad from '../../components/NotePad';

//react markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

//resizable panels
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

//clerk user
import { useUser } from '@clerk/nextjs';

//toast for popup notifications
import { toast } from 'react-hot-toast';

export default function ProblemPage() {
    //fetching the problems
    const params = useParams();
    const [problem, setProblem] = useState(null);

    //user input state management for the ai chatbot
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const initialSystemMessage = (problem, selectedLanguage) => ({
        role: 'system',
        content: `
            You are a concise, helpful coding mentor. The user is solving a LeetCode-style problem and will provide their code and test results. Your job is to guide them step by step — never give a full solution or complete code.

            ### Rules:
            - Ask leading questions to help them think.
            - Suggest strategies (e.g., "Try using a hash map"), not solutions.
            - Explain relevant concepts clearly and briefly.
            - Help debug only what they show you.
            - Give syntax help if asked (code snippets OK).
            - Mention edge cases they might overlook.
            - Keep responses to 1 paragraph maximum.
            - Do not output more than 300 tokens.

            ### Context:
            Problem: ${problem?.title}
            Difficulty: ${problem?.difficulty}
            Language: ${selectedLanguage}
            Starter code provided. User has submitted a solution and test cases have been run.

            Begin mentoring.
            `,
    });

    //state management for code editor
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('python');

    //state management for the tabs
    const [activeTab, setActiveTab] = useState('code');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    //state management for pyodide
    const [pyodide, setPyodide] = useState(null);

    //user for update user progress
    const { user } = useUser();

    //initialize pyodide
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

    //load the start code templates for the problem
    useEffect(() => {
        if (problem && problem.starterCodes) {
            setCode(problem.starterCodes[selectedLanguage]);
        }
    }, [problem, selectedLanguage]);

    //fetch problems from mongodb
    useEffect(() => {
        if (params.id) {
            console.log('Fetching problem with ID:', params.id);
            fetch(`/api/problems/${params.id}`)
                .then((res) => {
                    console.log('Response status:', res.status);
                    return res.json();
                })
                .then((data) => {
                    console.log('Received data:', data);
                    setProblem(data);
                    // Initialize messages only once when problem data is available
                    if (messages.length === 0) {
                        setMessages([
                            initialSystemMessage(data, selectedLanguage),
                        ]);
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    }, [params.id, selectedLanguage]); // Add selectedLanguage to dependencies

    //fetch the notes for the current problem when the page loads
    useEffect(() => {
        if (user && problem) {
            fetch(`/api/users/${user.id}/notes/${problem.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setNotes(data.note || '');
                })
                .catch((error) =>
                    console.error('Error fetching notes:', error)
                );
        }
    }, [user, problem]);

    const saveNotes = async () => {
        if (user && problem) {
            setIsSaving(true);
            try {
                const response = await fetch(
                    `/api/users/${user.id}/notes/${problem.id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notes }),
                    }
                );

                if (response.ok) {
                    toast.success('Notes saved successfully!');
                } else {
                    toast.error('Failed to save notes');
                }
            } catch (error) {
                console.error('Error saving notes:', error);
                toast.error('Error saving notes');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleUserInput = async (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const userMessageContent = `
                User Query: ${userInput}

                ---
                Current Code:
                \`\`\`${selectedLanguage}
                ${code}
                \`\`\`

                ---
                Test Results:
                \`\`\`json
                ${JSON.stringify(results, null, 2)}
                \`\`\`
            `;

            const displayUserMessage = { role: 'user', content: userInput };
            const messageToSend = { role: 'user', content: userMessageContent };

            setMessages((prevMessages) => [
                ...prevMessages,
                displayUserMessage,
            ]);
            setUserInput('');
            setLoading(true);

            //create temporary message for streaming
            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        // Send all messages in state, including the initial system message if present
                        messages: [...messages, messageToSend],
                    }),
                });

                if (!res.ok) {
                    if (res.status === 429) {
                        const errorData = await res.json();
                        toast.error(errorData.error);
                        // Remove the temporary message if rate limited
                        setMessages((prevMessages) =>
                            prevMessages.slice(0, prevMessages.length - 1)
                        );
                        return; // Stop further processing
                    } else {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                }

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

    const runCode = async () => {
        setIsRunning(true);
        setResults(null);

        try {
            // Fetch the problem document to get functionCalls and testCases
            const res = await fetch(`/api/problems/${params.id}`);
            const problem = await res.json();

            if (!problem) {
                throw new Error('Problem not found');
            }

            const functionCall = problem.functionCalls[selectedLanguage];
            if (!functionCall) {
                throw new Error(
                    `Function call not found for language: ${selectedLanguage}`
                );
            }

            let results;

            // JavaScript Execution
            if (selectedLanguage === 'javascript') {
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        userId: user?.id,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                results = data.results;
            }

            // Python Execution (using Pyodide)
            else if (selectedLanguage === 'python' && pyodide) {
                results = problem.testCases.map((testCase, index) => {
                    try {
                        // Redirect stdout to capture console logs
                        pyodide.runPython(`
                            import sys
                            import io
                            sys.stdout = io.StringIO()
                        `);

                        // Set input and execute the code
                        pyodide.globals.set('input', testCase.input);
                        pyodide.runPython(code.trim() + '\n' + functionCall);

                        // Get the result and stdout
                        const result = pyodide.globals.get('result');
                        const stdout = pyodide.runPython(
                            'sys.stdout.getvalue()'
                        );

                        // Convert PyProxy to JavaScript if necessary
                        const jsResult =
                            result instanceof pyodide.ffi.PyProxy
                                ? result.toJs()
                                : result;

                        return {
                            testCase: index + 1,
                            passed:
                                JSON.stringify(jsResult) ===
                                JSON.stringify(testCase.output),
                            input: testCase.input,
                            expected: testCase.output,
                            received: jsResult,
                            stdout: stdout,
                        };
                    } catch (error) {
                        // Extract line number and error message
                        const lines = error.message.split('\n');
                        for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].includes('line')) {
                                const match = lines[i].match(/line (\d+)/);
                                if (match) {
                                    const lineNumber = parseInt(match[1]);
                                    const errorMessage = error.message
                                        .split(':')
                                        .pop()
                                        .trim();
                                    return {
                                        testCase: index + 1,
                                        passed: false,
                                        error: `Line ${lineNumber}: ${errorMessage}`,
                                        input: testCase.input,
                                        expected: testCase.output,
                                        received: null,
                                        stdout: '',
                                    };
                                }
                            }
                        }
                    }
                });

                // Send Python results to backend for user progress update
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        userId: user?.id,
                        pythonResults: results,
                    }),
                });

                const data = await res.json();
                results = data.results;
            }

            // Set the results in state
            setResults(results);
        } catch (error) {
            console.error('Error in runCode function:', error);
            setResults([
                {
                    testCase: 'Error',
                    passed: false,
                    error: 'Failed to run code. Please try again.',
                },
            ]);
        } finally {
            setIsRunning(false);
        }
    };

    //generating pseudo code in the editor
    const generatePseudoCode = async () => {
        setLoading(true);
        try {
            const systemMessage = {
                role: 'system',
                content: `Generate only pseudocode for the following problem. Do not include any introductory text - provide only the pseudocode steps.
                     
                     Problem: "${problem?.title}"
                     ${problem?.description}
                     Difficulty: ${problem?.difficulty}
                     Topics: ${problem?.topics}`,
            };

            const userMessage = {
                role: 'user',
                content: 'Generate pseudocode for this problem.',
            };

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [systemMessage, userMessage],
                }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            // Create temporary message for streaming
            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            const reader = res.body.getReader();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                accumulatedContent += text;

                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[
                        newMessages.length - 1
                    ].content = `Here's the pseudocode for ${problem?.title}:\n\n${accumulatedContent}`;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error generating pseudo code:', error);
        }
        setLoading(false);
    };

    return (
        <div className="h-[100vh] bg-gray-800">
            <PanelGroup
                direction="horizontal"
                className="flex bg-gray-800 h-[100vh]"
            >
                {/* Problem Section */}
                <Panel defaultSize={25} minSize={20}>
                    <ProblemMetaData problem={problem} />
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700 hover:w-1 cursor-col-resize" />

                {/* Code Editor Section */}
                <Panel
                    defaultSize={50}
                    minSize={30}
                    className="w-[50vw] bg-gray-800 p-6 flex flex-col h-full"
                >
                    {/* Tabbing System */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-2 rounded ${activeTab === 'code'
                                ? 'bg-purple-700 text-white'
                                : 'bg-gray-700 text-gray-200'
                                }`}
                        >
                            Code Editor
                        </button>

                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-2 rounded ${activeTab === 'notes'
                                ? 'bg-purple-700 text-white'
                                : 'bg-gray-700 text-gray-200'
                                }`}
                        >
                            Notes
                        </button>
                    </div>

                    {/* Render Active Tab */}
                    {activeTab === 'code' && (
                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                            runCode={runCode}
                            isRunning={isRunning}
                            problem={problem}
                            results={results}
                        />
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <NotePad
                            notes={notes}
                            setNotes={setNotes}
                            saveNotes={saveNotes}
                            isSaving={isSaving}
                        />
                    )}
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700 hover:w-1 cursor-col-resize" />

                {/* AI Chat Section */}
                <Panel
                    defaultSize={25}
                    minSize={20}
                    className="w-1/4 bg-gray-800 p-6 flex flex-col overflow-y-auto"
                >
                    <h2 className="text-xl font-bold text-purple-400">
                        AI Assistant
                    </h2>
                    <div className="flex-grow mt-4 overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700">
                        {messages.map((message, index) =>
                            message.role === 'user' ||
                                message.role === 'assistant' ? (
                                <div
                                    key={index}
                                    className={`mb-4 ${message.role === 'user'
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
                                                    <div>
                                                        <pre
                                                            className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                                                            {...props}
                                                        >
                                                            {children}
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
                                                                    Copy Pseudocode
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
                    <form onSubmit={handleUserInput} className="mt-4">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
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
                </Panel>
            </PanelGroup>
        </div>
    );
}
