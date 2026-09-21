import { NextResponse } from "next/server";
import {
  parseAttributionCookie,
  mergeAttribution,
  emptyUtm,
  ATTR_COOKIE,
  type Attribution,
} from "@/lib/attribution";
import { canPersist, recordEvent, type EventType } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED: Set<string> = new Set([
  "page_view",
  "cta_click",
  "initiate_checkout",
  "scroll_50",
  "scroll_terminy",
  "lead",
  "purchase",
  "view_content",
]);

export async function POST(req: Request) {
  if (!canPersist()) {
    return NextResponse.json({ ok: false, error: "database_unconfigured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const eventType = String(body.eventType || "");
  if (!ALLOWED.has(eventType)) {
    return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|; )${ATTR_COOKIE}=([^;]*)`));
  const fromCookie = cookieMatch
    ? parseAttributionCookie(decodeURIComponent(cookieMatch[1]))
    : null;
  const fromBody = (body.attribution as Attribution | undefined) || null;
  const visitorId = String(body.visitorId || fromBody?.visitorId || fromCookie?.visitorId || "");
  if (!visitorId) {
    return NextResponse.json({ ok: false, error: "missing_visitor" }, { status: 400 });
  }

  const attribution: Attribution = mergeAttribution(fromBody || fromCookie, emptyUtm());
  attribution.visitorId = visitorId;

  try {
    await recordEvent({
      visitorId,
      eventType: eventType as EventType,
      eventId: body.eventId ? String(body.eventId) : undefined,
      path: body.path ? String(body.path) : undefined,
      meta: (body.meta as Record<string, unknown>) || {},
      attribution,
      userAgent: req.headers.get("user-agent") || undefined,
    });
  } catch (err) {
    console.error("track failed", err);
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
