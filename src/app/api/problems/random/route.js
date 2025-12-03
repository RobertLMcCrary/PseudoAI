import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

export async function GET() {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('Problems');

        const problems = await collection
            .aggregate([{ $sample: { size: 1 } }])
            .toArray();

        return new Response(JSON.stringify(problems[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Failed to fetch random problem' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
