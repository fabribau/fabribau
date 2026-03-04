import type { APIRoute } from 'astro';

export const prerender = false;

// GET /api/likes?slug=my-post → { slug, count }
// POST /api/likes { slug } → { slug, count }
export const GET: APIRoute = async ({ url }) => {
    const slug = url.searchParams.get('slug');

    if (!slug) {
        return new Response(JSON.stringify({ error: 'slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // TODO: Connect to Neon database
    // const { rows } = await sql`SELECT count FROM post_likes WHERE slug = ${slug}`;
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
    // await sql`INSERT INTO post_likes (slug, count) VALUES (${slug}, 1) ON CONFLICT (slug) DO UPDATE SET count = post_likes.count + 1, updated_at = NOW()`;
    return new Response(JSON.stringify({ slug, count: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
