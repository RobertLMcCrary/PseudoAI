import { HfInference } from '@huggingface/inference';

export const maxDuration = 30; //set max duration for Vercel serverless function
export const dynamic = 'force-dynamic';

//updated post
//ai output will be printed out piece by piece
export async function POST(req) {
    const { messages } = await req.json();
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

    try {
        const llmStream = client.chatCompletionStream({
            model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
            messages,
            max_tokens: 500,
        });

        // Handle streaming in a try-catch to ensure writer is closed
        (async () => {
            try {
                for await (const chunk of llmStream) {
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
        console.error('Error during API call:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500 }
        );
    }
}
