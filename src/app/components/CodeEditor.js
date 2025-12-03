'use client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

export default function CodeEditor({
    code,
    setCode,
    selectedLanguage,
    setSelectedLanguage,
    runCode,
    isRunning,
    problem,
    results,
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-400">
                    Code Editor
                </h2>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded border border-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>
            </div>

            <CodeMirror
                value={code}
                height="50vh"
                theme={vscodeDark}
                extensions={[
                    selectedLanguage === 'javascript'
                        ? javascript({ jsx: true })
                        : python(),
                    EditorView.lineWrapping,
                    indentUnit.of('    '),
                ]}
                onChange={(value) => setCode(value)}
                className="overflow-hidden text-black rounded-lg border border-gray-700"
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
                style={{
                    fontSize: '14px',
                    backgroundColor: '#1e1e1e',
                }}
            />

            <div className="flex gap-2 mt-4">
                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex-1 bg-purple-700 text-white px-6 py-2.5 rounded shadow 
                    hover:bg-purple-600 transition disabled:opacity-50 font-medium text-sm"
                >
                    {isRunning ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Running...
                        </span>
                    ) : (
                        'Run Code'
                    )}
                </button>
                <button
                    onClick={() =>
                        setCode(problem?.starterCodes[selectedLanguage])
                    }
                    className="px-4 py-2.5 rounded border border-gray-600 text-gray-300 
                    hover:bg-gray-700 transition text-sm font-medium"
                >
                    Reset Code
                </button>
            </div>

            {/* Test Results */}
            {results && (
                <div className="mt-4 bg-gray-900 p-4 rounded-lg overflow-y-auto h-[23vh]">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                        Test Results
                    </h3>
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`p-2 mb-2 rounded ${result.passed
                                ? 'bg-green-900/50 text-green-200'
                                : 'bg-red-900/50 text-red-200'
                                }`}
                        >
                            <div className="font-semibold flex items-center gap-2">
                                <span>Test Case {result.testCase}:</span>
                                {result.passed ? (
                                    <span className="text-green-400">
                                        ✓ Passed
                                    </span>
                                ) : (
                                    <span className="text-red-400">
                                        ✗ Failed
                                    </span>
                                )}
                            </div>
                            {!result.passed && (
                                <div className="text-sm mt-1">
                                    {result.error ? (
                                        <div className="text-red-300">
                                            {result.error.split('\n').pop()}
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                Input:{' '}
                                                {JSON.stringify(result.input)}
                                            </div>
                                            <div>
                                                Expected:{' '}
                                                {JSON.stringify(
                                                    result.expected
                                                )}
                                            </div>
                                            <div>
                                                Received:{' '}
                                                {JSON.stringify(
                                                    result.received
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {result.stdout && (
                                <div className="text-sm mt-2">
                                    <div className="font-semibold">Stdout:</div>
                                    <pre className="bg-gray-800 p-2 rounded mt-1 whitespace-pre-wrap">
                                        {result.stdout}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
