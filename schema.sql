CREATE TABLE IF NOT EXISTS metrics (
  slug TEXT PRIMARY KEY,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Rate limiting: una fila por clave (acción + IP).
-- La ventana se auto-resetea: no crece indefinidamente.
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT    PRIMARY KEY,  -- ej: "views_1.2.3.4" | "likes_1.2.3.4"
  count        INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL      -- Unix timestamp en ms
);
