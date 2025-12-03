import { openai } from '../../../../lib/openaiClient';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const maxDuration = 30; //set max duration for Vercel serverless function
export const dynamic = 'force-dynamic';

//rate limiting
//fixed winow: 1 request per 60 seconds
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(1, '60s'),
});

export async function POST(req) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        ip
    );

    if (!success) {
        return new Response(
            JSON.stringify({
                error: 'Please wait 60 seconds before sending another message.',
            }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { messages } = await req.json();
    const encoder = new TextEncoder();
    const stream = new TransformStream(); const writer = stream.writable.getWriter();
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            max_tokens: 500,
            stream: true,
        });

        // Handle streaming in a try-catch to ensure writer is closed
        (async () => {
            try {
                for await (const chunk of response) {
                    if (chunk.choices && chunk.choices.length > 0) {
                        const newContent = chunk.choices[0].delta.content;
                        if (newContent) {
                            await writer.write(encoder.encode(newContent));
                        }
                    }
                }
            } catch (streamError) {
                console.error('Error during streaming:', streamError);
            } finally {
                await writer.close();
            }
        })();

        return new Response(stream.readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error) {
        console.error('OpenAI stream error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process OpenAI request' }),
            { status: 500 }
        );
    }
}
