-- Workshop Engine — Neon / Postgres
-- Aplikace spouští tyto příkazy sama při prvním připojení (idempotentní).

CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,
  first_fbclid TEXT,
  last_utm_source TEXT,
  last_utm_medium TEXT,
  last_utm_campaign TEXT,
  last_utm_content TEXT,
  last_utm_term TEXT,
  last_fbclid TEXT,
  landing_path TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT UNIQUE,
  path TEXT,
  meta JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_type_created_idx ON events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS events_visitor_idx ON events (visitor_id);
CREATE INDEX IF NOT EXISTS events_utm_content_idx ON events (utm_content);

CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT,
  jmeno TEXT NOT NULL,
  email TEXT NOT NULL,
  email_norm TEXT NOT NULL,
  telefon TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  stranka TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_norm_uidx ON waitlist (email_norm);

CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT,
  email TEXT,
  amount_cents INTEGER,
  currency TEXT,
  termin_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hypotheses (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  metric TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS launch_waves (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS launch_waves_started_idx ON launch_waves (started_at DESC);
