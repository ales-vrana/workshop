import { NextResponse } from "next/server";
import Stripe from "stripe";
import { emptyUtm, type UtmFields } from "@/lib/attribution";
import { canPersist, recordPurchase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function utmFromSession(session: Stripe.Checkout.Session): UtmFields {
  const u = emptyUtm();
  const raw = session as Stripe.Checkout.Session & {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
  };
  u.utm_source = raw.utm_source || "";
  u.utm_medium = raw.utm_medium || "";
  u.utm_campaign = raw.utm_campaign || "";
  u.utm_content = raw.utm_content || "";
  u.utm_term = raw.utm_term || "";
  return u;
}

function terminFromSuccessUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/\/dekujeme\/([^/?#]+)/);
  return match?.[1];
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ ok: false, error: "stripe_unconfigured" }, { status: 503 });
  }
  if (!canPersist()) {
    return NextResponse.json({ ok: false, error: "database_unconfigured" }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("stripe signature failed", err);
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await recordPurchase({
        stripeSessionId: session.id,
        visitorId: session.client_reference_id || undefined,
        email: session.customer_details?.email || session.customer_email || undefined,
        amountCents: session.amount_total ?? undefined,
        currency: session.currency || undefined,
        terminId: terminFromSuccessUrl(session.success_url),
        utm: utmFromSession(session),
        payload: {
          payment_status: session.payment_status,
          success_url: session.success_url,
        },
      });
    } catch (err) {
      console.error("purchase store failed", err);
      return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
