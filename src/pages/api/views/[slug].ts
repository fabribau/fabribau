import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;

  if (!slug || slug.trim().length === 0) {
    return new Response(null, { status: 400 });
  }

  const db = (locals as App.Locals).runtime.env.blog_metrics;

  await db
    .prepare(
      `INSERT INTO metrics (slug, views, likes)
       VALUES (?1, 1, 0)
       ON CONFLICT(slug) DO UPDATE SET views = views + 1`
    )
    .bind(slug)
    .run();

  return new Response(null, { status: 200 });
};
