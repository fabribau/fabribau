import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
        return new Response(JSON.stringify({ error: 'email is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Resend or newsletter service
    // await resend.contacts.create({ email, firstName: name, audienceId: '...' });

    return new Response(JSON.stringify({ success: true, message: 'Suscripción exitosa' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
