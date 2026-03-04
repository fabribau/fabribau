import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { question, history } = body;

    if (!question) {
        return new Response(JSON.stringify({ error: 'question is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Vercel AI SDK
    // const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
    // const systemPrompt = `Eres un asistente que conoce a Fabrizio Riera Bauer...`;
    // const result = await streamText({
    //   model: openai('gpt-4o-mini'),
    //   system: systemPrompt,
    //   messages: [...history, { role: 'user', content: question }],
    // });

    // Placeholder response
    const answer = `Gracias por tu pregunta sobre "${question}". Esta es una respuesta placeholder. Para habilitar respuestas reales, configurá las variables de entorno OPENAI_API_KEY o ANTHROPIC_API_KEY en tu deploy de Vercel.`;

    return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
