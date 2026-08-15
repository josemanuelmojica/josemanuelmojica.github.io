CREATE TABLE IF NOT EXISTS leads (
  request_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  intent TEXT NOT NULL,
  location_query TEXT NOT NULL,
  locality TEXT NOT NULL,
  region TEXT NOT NULL,
  visual_id TEXT NOT NULL,
  needs TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  source TEXT NOT NULL,
  page_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status, created_at DESC);

CREATE TABLE IF NOT EXISTS lead_rate_limits (
  client_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (client_hash, window_start)
);

CREATE INDEX IF NOT EXISTS lead_rate_window_idx ON lead_rate_limits(window_start);
