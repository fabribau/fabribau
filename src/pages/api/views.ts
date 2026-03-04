import type { APIRoute } from 'astro';

export const prerender = false;

// GET /api/views?slug=my-post → { slug, count }
// POST /api/views { slug } → { slug, count }
export const GET: APIRoute = async ({ url }) => {
    const slug = url.searchParams.get('slug');

    if (!slug) {
        return new Response(JSON.stringify({ error: 'slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Neon database
    return new Response(JSON.stringify({ slug, count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
        return new Response(JSON.stringify({ error: 'slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Neon database
    return new Response(JSON.stringify({ slug, count: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
