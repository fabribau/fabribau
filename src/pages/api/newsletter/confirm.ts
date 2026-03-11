import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Token ausente → link inválido
  if (!token || token.trim().length === 0) {
    return redirect('/newsletter/invalid', 302);
  }

  const db = (locals as App.Locals).runtime.env.fabribau_db;

  try {
    // Intentar confirmar — solo si el status es 'pending'
    const result = await db
      .prepare(
        `UPDATE subscribers
         SET status       = 'confirmed',
             confirmed_at = datetime('now'),
             updated_at   = datetime('now')
         WHERE token = ?1 AND status = 'pending'`
      )
      .bind(token)
      .run();

    // ✅ Confirmación exitosa
    if (result.meta.changes > 0) {
      return redirect('/newsletter/success', 302);
    }

    // 0 filas afectadas → el token existe con otro estado, o directamente no existe
    const row = await db
      .prepare('SELECT status FROM subscribers WHERE token = ?1')
      .bind(token)
      .first<{ status: string }>();

    // Token de un email ya confirmado → idempotente, todo bien
    if (row?.status === 'confirmed') {
      return redirect('/newsletter/success', 302);
    }

    // Token no encontrado o de un 'unsubscribed' → link inválido/expirado
    return redirect('/newsletter/invalid', 302);

  } catch (err) {
    console.error('[newsletter/confirm] Error en D1:', err);
    return redirect('/newsletter/invalid', 302);
  }
};
