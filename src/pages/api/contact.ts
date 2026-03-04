import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Resend
    // const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    // const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;
    // await resend.emails.send({
    //   from: import.meta.env.RESEND_FROM_EMAIL,
    //   to: CONTACT_EMAIL,
    //   subject: `[FabRiBau Contact] ${subject}`,
    //   html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    // });

    return new Response(JSON.stringify({ success: true, message: 'Mensaje enviado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
