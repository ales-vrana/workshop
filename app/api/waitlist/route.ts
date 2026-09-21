import { NextResponse } from "next/server";
import { canPersist, recordEvent, recordWaitlist } from "@/lib/db";
import { WORKSHOP } from "@/lib/config";
import type { Attribution } from "@/lib/attribution";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!canPersist()) {
    return NextResponse.json(
      {
        ok: false,
        error: "database_unconfigured",
        message: `Teď to neuložím — chybí databáze. Napiš prosím na ${WORKSHOP.contactEmail}.`,
      },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const jmeno = String(body.jmeno || "").trim();
  const email = String(body.email || "").trim();
  const telefon = String(body.telefon || "").trim();
  if (!jmeno) {
    return NextResponse.json({ ok: false, error: "missing_name", message: "Vyplň prosím jméno." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email", message: "Zkontroluj prosím e-mail." },
      { status: 400 },
    );
  }

  const attribution = (body.attribution as Attribution | null) || null;
  const visitorId = String(body.visitorId || attribution?.visitorId || "");

  try {
    await recordWaitlist({
      visitorId: visitorId || undefined,
      jmeno,
      email,
      telefon,
      stranka: body.stranka ? String(body.stranka) : undefined,
      attribution,
    });
    if (visitorId && attribution) {
      await recordEvent({
        visitorId,
        eventType: "lead",
        eventId: body.eventId ? String(body.eventId) : undefined,
        path: body.stranka ? String(body.stranka) : undefined,
        meta: { source: "waitlist" },
        attribution,
      });
    }
  } catch (err) {
    console.error("waitlist failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: "store_failed",
        message: `Odeslání se nepovedlo. Napiš mi prosím na ${WORKSHOP.contactEmail}`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
