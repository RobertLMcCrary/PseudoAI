import { MongoClient } from 'mongodb';

export async function GET(request, context) {
    const { userId, problemId } = context.params;

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI');
        const Users = db.collection('Users');

        const user = await Users.findOne({ clerkId: userId });
        const note =
            user?.notes?.find((note) => note.problemId === problemId)?.note ||
            '';

        await client.close();
        return new Response(JSON.stringify({ note }), { status: 200 });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch notes' }),
            { status: 500 }
        );
    }
}

export async function POST(req, context) {
    const { id, problemId } = context.params;
    const { notes: noteContent } = await req.json();

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI');
        const Users = db.collection('Users');

        // Single atomic operation to update notes
        const result = await Users.updateOne({ clerkId: id }, [
            {
                $set: {
                    notes: {
                        $cond: {
                            if: { $isArray: '$notes' },
                            then: {
                                $concatArrays: [
                                    {
                                        $filter: {
                                            input: '$notes',
                                            cond: {
                                                $ne: [
                                                    '$$this.problemId',
                                                    problemId,
                                                ],
                                            },
                                        },
                                    },
                                    [
                                        {
                                            problemId: problemId,
                                            note: noteContent,
                                        },
                                    ],
                                ],
                            },
                            else: [
                                {
                                    problemId: problemId,
                                    note: noteContent,
                                },
                            ],
                        },
                    },
                },
            },
        ]);

        await client.close();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error saving notes:', error);
        return new Response(JSON.stringify({ error: 'Failed to save notes' }), {
            status: 500,
        });
    }
}
