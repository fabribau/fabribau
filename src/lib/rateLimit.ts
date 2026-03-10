interface RateLimitRow {
  count: number;
  window_start: number;
}

interface RateLimitOptions {
  db: D1Database;
  /** Clave única: ej. "views_1.2.3.4" o "likes_1.2.3.4" */
  key: string;
  /** Máximo de requests permitidos dentro de la ventana */
  limit: number;
  /** Duración de la ventana en milisegundos */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Requests restantes en la ventana actual */
  remaining: number;
}

/**
 * Rate limiting por clave con ventana deslizante en Cloudflare D1.
 * Usa 1 fila por clave — sin crecimiento indefinido de la tabla.
 */
export async function checkRateLimit({
  db,
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();

  const row = await db
    .prepare('SELECT count, window_start FROM rate_limits WHERE key = ?1')
    .bind(key)
    .first<RateLimitRow>();

  // Sin historial o ventana expirada → abrir nueva ventana
  if (!row || now - row.window_start > windowMs) {
    await db
      .prepare(
        `INSERT INTO rate_limits (key, count, window_start)
         VALUES (?1, 1, ?2)
         ON CONFLICT(key) DO UPDATE SET count = 1, window_start = ?2`
      )
      .bind(key, now)
      .run();

    return { allowed: true, remaining: limit - 1 };
  }

  // Ventana activa y límite superado → bloquear
  if (row.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Ventana activa con espacio → incrementar
  await db
    .prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?1')
    .bind(key)
    .run();

  return { allowed: true, remaining: limit - row.count - 1 };
}
