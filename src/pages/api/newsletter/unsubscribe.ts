import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Token ausente → redirigir igualmente
  if (!token || token.trim().length === 0) {
    return redirect('/newsletter/goodbye', 302);
  }

  const db = (locals as App.Locals).runtime.env.fabribau_db;

  try {
    await db
      .prepare(
        `UPDATE subscribers
         SET status     = 'unsubscribed',
             updated_at = datetime('now')
         WHERE token = ?1`
      )
      .bind(token)
      .run();
  } catch (err) {
    console.error('[newsletter/unsubscribe] Error en D1:', err);
  }

  return redirect('/newsletter/goodbye', 302);
};
