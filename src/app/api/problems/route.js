import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI; // Set this in your .env.local file
const dbName = process.env.MONGO_DB; // Set this in your .env.local file

let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(request) {
    try {
        const client = await (new MongoClient(uri)).connect();
        const db = client.db(dbName);
        const collection = db.collection('Problems');

        const problems = await collection.find({}).toArray();

        await client.close();
        return new Response(JSON.stringify(problems), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Failed to fetch problems:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch problems' }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
}

//json problems
/*
export async function GET(request) {
    return new Response(JSON.stringify(problems), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
*/
