import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { Attribution, UtmFields } from "./attribution";
import { emptyUtm } from "./attribution";

export type EventType =
  | "page_view"
  | "cta_click"
  | "initiate_checkout"
  | "scroll_50"
  | "scroll_terminy"
  | "lead"
  | "purchase"
  | "view_content";

export type TrackPayload = {
  visitorId: string;
  eventType: EventType | string;
  eventId?: string;
  path?: string;
  meta?: Record<string, unknown>;
  attribution: Attribution;
  userAgent?: string;
};

export type WaitlistPayload = {
  visitorId?: string;
  jmeno: string;
  email: string;
  telefon?: string;
  stranka?: string;
  attribution?: Attribution | null;
};

export type PurchasePayload = {
  stripeSessionId: string;
  visitorId?: string;
  email?: string;
  amountCents?: number;
  currency?: string;
  terminId?: string;
  utm: UtmFields;
  payload?: unknown;
};

export type WaitlistRow = {
  id: number;
  visitor_id: string | null;
  jmeno: string;
  email: string;
  telefon: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  stranka: string | null;
  created_at: string;
};

export type HypothesisRow = {
  id: number;
  text: string;
  metric: string | null;
  status: string;
  created_at: string;
};

export type FunnelCounts = {
  visits: number;
  uniqueVisitors: number;
  viewContent: number;
  scroll50: number;
  scrollTerminy: number;
  ctaClick: number;
  initiateCheckout: number;
  waitlist: number;
  purchases: number;
};

export type CreativeRow = {
  key: string;
  utm_campaign: string;
  utm_content: string;
  visits: number;
  uniqueVisitors: number;
  cta: number;
  checkout: number;
  waitlist: number;
  purchases: number;
};

type FileStore = {
  visitors: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  waitlist: Array<Record<string, unknown>>;
  purchases: Array<Record<string, unknown>>;
  hypotheses: Array<Record<string, unknown>>;
  seq: { events: number; waitlist: number; purchases: number; hypotheses: number };
};

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS visitors (
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
  )`,
  `CREATE TABLE IF NOT EXISTS events (
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
  )`,
  `CREATE INDEX IF NOT EXISTS events_type_created_idx ON events (event_type, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS events_visitor_idx ON events (visitor_id)`,
  `CREATE INDEX IF NOT EXISTS events_utm_content_idx ON events (utm_content)`,
  `CREATE TABLE IF NOT EXISTS waitlist (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_norm_uidx ON waitlist (email_norm)`,
  `CREATE TABLE IF NOT EXISTS purchases (
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
  )`,
  `CREATE TABLE IF NOT EXISTS hypotheses (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    metric TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    undefined
  );
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl());
}

export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

/** Produkce na Vercel bez Neon = nelze ukládat. Lokálně fallback na soubor. */
export function canPersist(): boolean {
  return hasDatabaseUrl() || !isVercel();
}

export function persistMode(): "neon" | "file" | "none" {
  if (hasDatabaseUrl()) return "neon";
  if (!isVercel()) return "file";
  return "none";
}

function sqlClient() {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

type NeonFn = ((query: string, params: unknown[]) => Promise<unknown>) & {
  query?: (query: string, params: unknown[]) => Promise<unknown>;
};

async function neonQuery<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
  const sql = sqlClient() as unknown as NeonFn | null;
  if (!sql) throw new Error("DATABASE_URL is not set");
  const result = sql.query ? await sql.query(query, params) : await sql(query, params);
  return result as T[];
}

let schemaPromise: Promise<void> | null = null;

async function ensureNeonSchema(): Promise<void> {
  const sql = sqlClient();
  if (!sql) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        await neonQuery(statement, []);
      }
    })();
  }
  await schemaPromise;
}

function filePath(): string {
  return path.join(process.cwd(), ".data", "engine.json");
}

function emptyStore(): FileStore {
  return {
    visitors: [],
    events: [],
    waitlist: [],
    purchases: [],
    hypotheses: [],
    seq: { events: 0, waitlist: 0, purchases: 0, hypotheses: 0 },
  };
}

let fileQueue: Promise<unknown> = Promise.resolve();

function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = fileQueue.then(fn, fn);
  fileQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: FileStore): Promise<void> {
  await fs.mkdir(path.dirname(filePath()), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify(store), "utf8");
}

function utmFromAttr(attr: Attribution): UtmFields {
  return {
    utm_source: attr.last.utm_source || attr.first.utm_source,
    utm_medium: attr.last.utm_medium || attr.first.utm_medium,
    utm_campaign: attr.last.utm_campaign || attr.first.utm_campaign,
    utm_content: attr.last.utm_content || attr.first.utm_content,
    utm_term: attr.last.utm_term || attr.first.utm_term,
    fbclid: attr.last.fbclid || attr.first.fbclid,
  };
}

export async function recordEvent(payload: TrackPayload): Promise<void> {
  const mode = persistMode();
  if (mode === "none") throw new Error("DATABASE_URL is not set");
  const utm = utmFromAttr(payload.attribution);
  const attr = payload.attribution;

  if (mode === "neon") {
    await ensureNeonSchema();
    await neonQuery(
      `INSERT INTO visitors (
         id, first_seen, last_seen,
         first_utm_source, first_utm_medium, first_utm_campaign, first_utm_content, first_utm_term, first_fbclid,
         last_utm_source, last_utm_medium, last_utm_campaign, last_utm_content, last_utm_term, last_fbclid,
         landing_path, user_agent
       ) VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
         last_seen = NOW(),
         last_utm_source = COALESCE(EXCLUDED.last_utm_source, visitors.last_utm_source),
         last_utm_medium = COALESCE(EXCLUDED.last_utm_medium, visitors.last_utm_medium),
         last_utm_campaign = COALESCE(EXCLUDED.last_utm_campaign, visitors.last_utm_campaign),
         last_utm_content = COALESCE(EXCLUDED.last_utm_content, visitors.last_utm_content),
         last_utm_term = COALESCE(EXCLUDED.last_utm_term, visitors.last_utm_term),
         last_fbclid = COALESCE(EXCLUDED.last_fbclid, visitors.last_fbclid),
         user_agent = COALESCE(EXCLUDED.user_agent, visitors.user_agent)`,
      [
        payload.visitorId,
        attr.first.utm_source || null,
        attr.first.utm_medium || null,
        attr.first.utm_campaign || null,
        attr.first.utm_content || null,
        attr.first.utm_term || null,
        attr.first.fbclid || null,
        utm.utm_source || null,
        utm.utm_medium || null,
        utm.utm_campaign || null,
        utm.utm_content || null,
        utm.utm_term || null,
        utm.fbclid || null,
        payload.path || null,
        payload.userAgent || null,
      ],
    );

    await neonQuery(
      `INSERT INTO events (visitor_id, event_type, event_id, path, meta, utm_source, utm_medium, utm_campaign, utm_content, utm_term)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
       ON CONFLICT (event_id) DO NOTHING`,
      [
        payload.visitorId,
        payload.eventType,
        payload.eventId || null,
        payload.path || null,
        JSON.stringify(payload.meta || {}),
        utm.utm_source || null,
        utm.utm_medium || null,
        utm.utm_campaign || null,
        utm.utm_content || null,
        utm.utm_term || null,
      ],
    );
    return;
  }

  await withFileLock(async () => {
    const store = await readStore();
    const now = new Date().toISOString();
    const existing = store.visitors.find((v) => v.id === payload.visitorId);
    if (!existing) {
      store.visitors.push({
        id: payload.visitorId,
        first_seen: now,
        last_seen: now,
        first_utm_source: attr.first.utm_source,
        first_utm_medium: attr.first.utm_medium,
        first_utm_campaign: attr.first.utm_campaign,
        first_utm_content: attr.first.utm_content,
        first_utm_term: attr.first.utm_term,
        first_fbclid: attr.first.fbclid,
        last_utm_source: utm.utm_source,
        last_utm_medium: utm.utm_medium,
        last_utm_campaign: utm.utm_campaign,
        last_utm_content: utm.utm_content,
        last_utm_term: utm.utm_term,
        last_fbclid: utm.fbclid,
        landing_path: payload.path,
        user_agent: payload.userAgent,
      });
    } else {
      existing.last_seen = now;
      if (utm.utm_source) existing.last_utm_source = utm.utm_source;
      if (utm.utm_medium) existing.last_utm_medium = utm.utm_medium;
      if (utm.utm_campaign) existing.last_utm_campaign = utm.utm_campaign;
      if (utm.utm_content) existing.last_utm_content = utm.utm_content;
      if (utm.utm_term) existing.last_utm_term = utm.utm_term;
      if (utm.fbclid) existing.last_fbclid = utm.fbclid;
    }
    if (payload.eventId && store.events.some((e) => e.event_id === payload.eventId)) {
      await writeStore(store);
      return;
    }
    store.seq.events += 1;
    store.events.push({
      id: store.seq.events,
      visitor_id: payload.visitorId,
      event_type: payload.eventType,
      event_id: payload.eventId || null,
      path: payload.path || null,
      meta: payload.meta || {},
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      created_at: now,
    });
    await writeStore(store);
  });
}

export async function recordWaitlist(payload: WaitlistPayload): Promise<void> {
  const mode = persistMode();
  if (mode === "none") throw new Error("DATABASE_URL is not set");
  const emailNorm = payload.email.trim().toLowerCase();
  const attr = payload.attribution;
  const utm = attr ? utmFromAttr(attr) : emptyUtm();

  if (mode === "neon") {
    await ensureNeonSchema();
    await neonQuery(
      `INSERT INTO waitlist (
         visitor_id, jmeno, email, email_norm, telefon,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term, stranka
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email_norm) DO UPDATE SET
         jmeno = EXCLUDED.jmeno,
         telefon = COALESCE(EXCLUDED.telefon, waitlist.telefon),
         visitor_id = COALESCE(EXCLUDED.visitor_id, waitlist.visitor_id),
         utm_source = COALESCE(EXCLUDED.utm_source, waitlist.utm_source),
         utm_medium = COALESCE(EXCLUDED.utm_medium, waitlist.utm_medium),
         utm_campaign = COALESCE(EXCLUDED.utm_campaign, waitlist.utm_campaign),
         utm_content = COALESCE(EXCLUDED.utm_content, waitlist.utm_content),
         utm_term = COALESCE(EXCLUDED.utm_term, waitlist.utm_term),
         stranka = COALESCE(EXCLUDED.stranka, waitlist.stranka),
         updated_at = NOW()`,
      [
        payload.visitorId || null,
        payload.jmeno.trim(),
        payload.email.trim(),
        emailNorm,
        payload.telefon?.trim() || null,
        utm.utm_source || null,
        utm.utm_medium || null,
        utm.utm_campaign || null,
        utm.utm_content || null,
        utm.utm_term || null,
        payload.stranka || null,
      ],
    );
    return;
  }

  await withFileLock(async () => {
    const store = await readStore();
    const now = new Date().toISOString();
    const existing = store.waitlist.find((w) => w.email_norm === emailNorm);
    if (existing) {
      existing.jmeno = payload.jmeno.trim();
      existing.telefon = payload.telefon?.trim() || existing.telefon;
      existing.updated_at = now;
      existing.visitor_id = payload.visitorId || existing.visitor_id;
    } else {
      store.seq.waitlist += 1;
      store.waitlist.push({
        id: store.seq.waitlist,
        visitor_id: payload.visitorId || null,
        jmeno: payload.jmeno.trim(),
        email: payload.email.trim(),
        email_norm: emailNorm,
        telefon: payload.telefon?.trim() || null,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
        stranka: payload.stranka || null,
        created_at: now,
        updated_at: now,
      });
    }
    await writeStore(store);
  });
}

export async function recordPurchase(payload: PurchasePayload): Promise<void> {
  const mode = persistMode();
  if (mode === "none") throw new Error("DATABASE_URL is not set");

  if (mode === "neon") {
    await ensureNeonSchema();
    await neonQuery(
      `INSERT INTO purchases (
         stripe_session_id, visitor_id, email, amount_cents, currency, termin_id,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term, payload
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [
        payload.stripeSessionId,
        payload.visitorId || null,
        payload.email || null,
        payload.amountCents ?? null,
        payload.currency || null,
        payload.terminId || null,
        payload.utm.utm_source || null,
        payload.utm.utm_medium || null,
        payload.utm.utm_campaign || null,
        payload.utm.utm_content || null,
        payload.utm.utm_term || null,
        JSON.stringify(payload.payload ?? {}),
      ],
    );
    return;
  }

  await withFileLock(async () => {
    const store = await readStore();
    if (store.purchases.some((p) => p.stripe_session_id === payload.stripeSessionId)) return;
    store.seq.purchases += 1;
    store.purchases.push({
      id: store.seq.purchases,
      stripe_session_id: payload.stripeSessionId,
      visitor_id: payload.visitorId || null,
      email: payload.email || null,
      amount_cents: payload.amountCents ?? null,
      currency: payload.currency || null,
      termin_id: payload.terminId || null,
      utm_source: payload.utm.utm_source,
      utm_medium: payload.utm.utm_medium,
      utm_campaign: payload.utm.utm_campaign,
      utm_content: payload.utm.utm_content,
      utm_term: payload.utm.utm_term,
      payload: payload.payload ?? {},
      created_at: new Date().toISOString(),
    });
    await writeStore(store);
  });
}

function uniqueCount(rows: Array<Record<string, unknown>>, key: string): number {
  return new Set(rows.map((r) => String(r[key] || ""))).size;
}

export async function getFunnel(): Promise<FunnelCounts> {
  const mode = persistMode();
  if (mode === "none") {
    return {
      visits: 0,
      uniqueVisitors: 0,
      viewContent: 0,
      scroll50: 0,
      scrollTerminy: 0,
      ctaClick: 0,
      initiateCheckout: 0,
      waitlist: 0,
      purchases: 0,
    };
  }

  if (mode === "neon") {
    await ensureNeonSchema();
    const rows = (await neonQuery(
      `SELECT
         COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS visits,
         COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'page_view')::int AS unique_visitors,
         COUNT(*) FILTER (WHERE event_type = 'view_content')::int AS view_content,
         COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'scroll_50')::int AS scroll_50,
         COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'scroll_terminy')::int AS scroll_terminy,
         COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'cta_click')::int AS cta_click,
         COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'initiate_checkout')::int AS initiate_checkout
       FROM events`,
      [],
    )) as Array<Record<string, number>>;
    const wait = (await neonQuery(`SELECT COUNT(*)::int AS n FROM waitlist`, [])) as Array<{ n: number }>;
    const purch = (await neonQuery(`SELECT COUNT(*)::int AS n FROM purchases`, [])) as Array<{ n: number }>;
    const r = rows[0] || {};
    return {
      visits: r.visits || 0,
      uniqueVisitors: r.unique_visitors || 0,
      viewContent: r.view_content || 0,
      scroll50: r.scroll_50 || 0,
      scrollTerminy: r.scroll_terminy || 0,
      ctaClick: r.cta_click || 0,
      initiateCheckout: r.initiate_checkout || 0,
      waitlist: wait[0]?.n || 0,
      purchases: purch[0]?.n || 0,
    };
  }

  const store = await readStore();
  const pageViews = store.events.filter((e) => e.event_type === "page_view");
  return {
    visits: pageViews.length,
    uniqueVisitors: uniqueCount(pageViews, "visitor_id"),
    viewContent: store.events.filter((e) => e.event_type === "view_content").length,
    scroll50: uniqueCount(
      store.events.filter((e) => e.event_type === "scroll_50"),
      "visitor_id",
    ),
    scrollTerminy: uniqueCount(
      store.events.filter((e) => e.event_type === "scroll_terminy"),
      "visitor_id",
    ),
    ctaClick: uniqueCount(
      store.events.filter((e) => e.event_type === "cta_click"),
      "visitor_id",
    ),
    initiateCheckout: uniqueCount(
      store.events.filter((e) => e.event_type === "initiate_checkout"),
      "visitor_id",
    ),
    waitlist: store.waitlist.length,
    purchases: store.purchases.length,
  };
}

export async function getCreatives(): Promise<CreativeRow[]> {
  const mode = persistMode();
  if (mode === "none") return [];

  const creativeKey = (row: Record<string, unknown>) => {
    const content = String(row.utm_content || "").trim() || "(bez UTM)";
    const campaign = String(row.utm_campaign || "").trim() || "—";
    return `${campaign}|||${content}`;
  };

  const events: Array<Record<string, unknown>> =
    mode === "neon"
      ? await (async () => {
          await ensureNeonSchema();
          return neonQuery(`SELECT * FROM events`, []);
        })()
      : (await readStore()).events;

  const waitlist =
    mode === "neon"
      ? await neonQuery(`SELECT * FROM waitlist`, [])
      : (await readStore()).waitlist;

  const purchases =
    mode === "neon"
      ? await neonQuery(`SELECT * FROM purchases`, [])
      : (await readStore()).purchases;

  const map = new Map<string, CreativeRow>();
  const ensure = (row: Record<string, unknown>) => {
    const key = creativeKey(row);
    if (!map.has(key)) {
      const [campaign, content] = key.split("|||");
      map.set(key, {
        key,
        utm_campaign: campaign,
        utm_content: content,
        visits: 0,
        uniqueVisitors: 0,
        cta: 0,
        checkout: 0,
        waitlist: 0,
        purchases: 0,
      });
    }
    return map.get(key)!;
  };

  const visitorsByKey = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.event_type !== "page_view") continue;
    const row = ensure(e);
    row.visits += 1;
    const k = creativeKey(e);
    if (!visitorsByKey.has(k)) visitorsByKey.set(k, new Set());
    visitorsByKey.get(k)!.add(String(e.visitor_id));
  }
  for (const [k, set] of visitorsByKey) {
    const row = map.get(k);
    if (row) row.uniqueVisitors = set.size;
  }

  const countUnique = (type: string, field: "cta" | "checkout") => {
    const seen = new Map<string, Set<string>>();
    for (const e of events) {
      if (e.event_type !== type) continue;
      const k = creativeKey(e);
      ensure(e);
      if (!seen.has(k)) seen.set(k, new Set());
      seen.get(k)!.add(String(e.visitor_id));
    }
    for (const [k, set] of seen) {
      const row = map.get(k);
      if (row) row[field] = set.size;
    }
  };
  countUnique("cta_click", "cta");
  countUnique("initiate_checkout", "checkout");

  for (const w of waitlist) ensure(w).waitlist += 1;
  for (const p of purchases) ensure(p).purchases += 1;

  const rows = [...map.values()];
  rows.sort((a, b) => {
    const score = (r: CreativeRow) => r.purchases * 1000 + r.checkout * 10 + r.waitlist * 5 + r.cta;
    return score(b) - score(a) || b.visits - a.visits;
  });
  return rows;
}

export async function getWaitlist(): Promise<WaitlistRow[]> {
  const mode = persistMode();
  if (mode === "none") return [];
  if (mode === "neon") {
    await ensureNeonSchema();
    return neonQuery(
      `SELECT id, visitor_id, jmeno, email, telefon, utm_source, utm_medium, utm_campaign, utm_content, utm_term, stranka, created_at::text
       FROM waitlist ORDER BY created_at DESC`,
      [],
    ) as Promise<WaitlistRow[]>;
  }
  const store = await readStore();
  return [...store.waitlist]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map((w) => ({
      id: Number(w.id),
      visitor_id: (w.visitor_id as string) || null,
      jmeno: String(w.jmeno),
      email: String(w.email),
      telefon: (w.telefon as string) || null,
      utm_source: (w.utm_source as string) || null,
      utm_medium: (w.utm_medium as string) || null,
      utm_campaign: (w.utm_campaign as string) || null,
      utm_content: (w.utm_content as string) || null,
      utm_term: (w.utm_term as string) || null,
      stranka: (w.stranka as string) || null,
      created_at: String(w.created_at),
    }));
}

export async function getHypotheses(): Promise<HypothesisRow[]> {
  const mode = persistMode();
  if (mode === "none") return [];
  if (mode === "neon") {
    await ensureNeonSchema();
    return neonQuery(
      `SELECT id, text, metric, status, created_at::text FROM hypotheses ORDER BY created_at DESC`,
      [],
    ) as Promise<HypothesisRow[]>;
  }
  const store = await readStore();
  return [...store.hypotheses]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map((h) => ({
      id: Number(h.id),
      text: String(h.text),
      metric: (h.metric as string) || null,
      status: String(h.status),
      created_at: String(h.created_at),
    }));
}

export async function addHypothesis(text: string, metric: string): Promise<void> {
  const mode = persistMode();
  if (mode === "none") throw new Error("DATABASE_URL is not set");
  if (mode === "neon") {
    await ensureNeonSchema();
    await neonQuery(`INSERT INTO hypotheses (text, metric, status) VALUES ($1, $2, 'open')`, [
      text,
      metric || null,
    ]);
    return;
  }
  await withFileLock(async () => {
    const store = await readStore();
    store.seq.hypotheses += 1;
    store.hypotheses.push({
      id: store.seq.hypotheses,
      text,
      metric: metric || null,
      status: "open",
      created_at: new Date().toISOString(),
    });
    await writeStore(store);
  });
}

export async function updateHypothesisStatus(id: number, status: string): Promise<void> {
  const mode = persistMode();
  if (mode === "none") throw new Error("DATABASE_URL is not set");
  const allowed = new Set(["open", "running", "learned"]);
  if (!allowed.has(status)) throw new Error("Invalid status");
  if (mode === "neon") {
    await ensureNeonSchema();
    await neonQuery(`UPDATE hypotheses SET status = $1 WHERE id = $2`, [status, id]);
    return;
  }
  await withFileLock(async () => {
    const store = await readStore();
    const row = store.hypotheses.find((h) => Number(h.id) === id);
    if (row) row.status = status;
    await writeStore(store);
  });
}
