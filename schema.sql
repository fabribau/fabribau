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

-- Suscriptores al newsletter (Double Opt-In)
CREATE TABLE IF NOT EXISTS subscribers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  status       TEXT    NOT NULL DEFAULT 'pending',   -- 'pending' | 'confirmed' | 'unsubscribed'
  token        TEXT    NOT NULL UNIQUE,              -- UUID v4 para confirm/unsubscribe
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  source       TEXT    DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token  ON subscribers(token);
