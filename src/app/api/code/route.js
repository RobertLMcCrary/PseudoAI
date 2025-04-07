import { MongoClient } from 'mongodb';

//function to run JavaScript locally
function runJavaScriptLocally(code, testCases, functionCall) {
    return testCases.map((testCase, index) => {
        try {
            const stdout = [];
            const sandbox = {
                console: {
                    log: (...args) => stdout.push(args.join(' ')),
                },
            };

            const fn = new Function(
                'input',
                'sandbox',
                `with (sandbox) {
                    ${code}
                    ${functionCall}
                }`
            );

            const result = fn(testCase.input, sandbox);

            return {
                testCase: index + 1,
                passed:
                    JSON.stringify(result) === JSON.stringify(testCase.output),
                input: testCase.input,
                expected: testCase.output,
                received: result,
                stdout: stdout.join('\n'),
            };
        } catch (error) {
            return {
                testCase: index + 1,
                passed: false,
                error: error.message,
                input: testCase.input,
                expected: testCase.output,
                received: null,
                stdout: '',
            };
        }
    });
}

// POST method
export async function POST(req) {
    const { code, language, problemId, userId, pythonResults } =
        await req.json();

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI');
        const problem = await db
            .collection('Problems')
            .findOne({ id: problemId });

        if (!problem) {
            throw new Error('Problem not found');
        }

        const functionCall = problem.functionCalls[language];
        if (!functionCall) {
            throw new Error(
                `Function call not found for language: ${language}`
            );
        }

        let results;
        if (language === 'javascript') {
            results = runJavaScriptLocally(
                code,
                problem.testCases,
                functionCall
            );
        } else if (language === 'python') {
            results = pythonResults;
        }

        const allTestsPassed = results.every((result) => result.passed);
        if (allTestsPassed && userId) {
            const Users = db.collection('Users');
            await Users.updateOne(
                {
                    clerkId: userId,
                    'solvedProblems.problemId': { $ne: problemId },
                },
                {
                    $inc: {
                        [`problemsSolved.${problem.difficulty.toLowerCase()}`]: 1,
                    },
                    $push: {
                        solvedProblems: {
                            problemId,
                            difficulty: problem.difficulty,
                            language,
                            solvedAt: new Date(),
                        },
                    },
                }
            );
        }

        await client.close();
        return new Response(JSON.stringify({ results }), { status: 200 });
    } catch (error) {
        console.error('Error in POST function:', error);
        return new Response(
            JSON.stringify({
                results: [
                    {
                        testCase: 1,
                        passed: false,
                        error: 'Failed to execute code: ' + error.message,
                    },
                ],
            }),
            { status: 200 }
        );
    }
}
