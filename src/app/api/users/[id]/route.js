import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

function calculateRank(problemsSolved) {
    const total =
        problemsSolved.easy + problemsSolved.medium + problemsSolved.hard;

    if (total >= 100) return 'Grand Master';
    if (total >= 50) return 'Master';
    if (total >= 25) return 'Expert';
    if (total >= 10) return 'Intermediate';
    if (total >= 1) return 'Beginner';
    return 'Novice';
}

export async function PUT(request, context) {
    const { id } = await context.params;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');

    const user = await Users.findOne({ clerkId: id });
    const newRank = calculateRank(user.problemsSolved);

    await Users.updateOne({ clerkId: id }, { $set: { rank: newRank } });

    await client.close();

    return new Response(JSON.stringify({ rank: newRank }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}

export async function GET(request, context) {
    const { id } = await context.params;
    if (!id) {
        // This check is good practice, though for a dynamic route like [id],
        // 'id' should always be present.
        return NextResponse.json(
            { error: 'User ID is missing.' },
            { status: 400 }
        );
    }
    let client; // Declare client outside try-catch for finally block access
    try {
        client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI'); // Replace with your database name
        const Users = db.collection('Users'); // Replace with your collection name

        const userData = await Users.findOne({ clerkId: id });

        // Using NextResponse.json is the recommended way to return JSON from App Router API routes
        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/users/[id]:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
