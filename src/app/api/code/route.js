import { MongoClient } from 'mongodb';

//we not using judge0 api anymore because it is lowkey too expensive
//keep this code snippet just in case though
//const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
/*
const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
};
*/

function runJavaScriptLocally(code, testCases, functionCall) {
    return testCases.map((testCase, index) => {
        try {
            const stdout = [];
            //create sandbox with modified console.log
            const sandbox = {
                console: {
                    log: (...args) => stdout.push(args.join(' ')),
                },
            };

            //create a new function with the users code and the function call
            /*
            const fn = new Function(
                'input',
                `
                ${code}
                ${functionCall}
            `
            );
            */
            const fn = new Function(
                'input',
                'sandbox',
                `with (sandbox) {
                    ${code}
                    ${functionCall}
                }`
            );

            //executes the function with the users code in it
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

export async function POST(req) {
    //python execution is all on frontend and test results get sent to backend
    const { code, language, problemId, userId, pythonResults } =
        await req.json();

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI');
        const problem = await db
            .collection('Problems')
            .findOne({ id: problemId });

        let results;
        if (language === 'javascript') {
            results = runJavaScriptLocally(
                code,
                problem.testCases,
                problem.functionCalls[language]
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
