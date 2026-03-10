import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../../lib/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, request }) => {
  const slug = params.slug;

  if (!slug || slug.trim().length === 0) {
    return new Response(null, { status: 400 });
  }

  const db = (locals as App.Locals).runtime.env.blog_metrics;

  // ── Rate limiting: 5 views por IP por minuto ───────────────────────────────
  const ip =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
    'unknown';

  const { allowed } = await checkRateLimit({
    db,
    key: `views_${ip}`,
    limit: 5,
    windowMs: 60_000, // 1 minuto
  });

  if (!allowed) {
    return new Response(null, { status: 429 });
  }

  // ── Upsert de views ────────────────────────────────────────────────────────
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
