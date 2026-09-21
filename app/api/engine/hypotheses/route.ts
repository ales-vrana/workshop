import { NextResponse } from "next/server";
import { addHypothesis, updateHypothesisStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    if (body.action === "status") {
      const id = Number(body.id);
      const status = String(body.status || "");
      if (!id || !status) return NextResponse.json({ ok: false }, { status: 400 });
      await updateHypothesisStatus(id, status);
      return NextResponse.json({ ok: true });
    }

    const text = String(body.text || "").trim();
    if (!text) return NextResponse.json({ ok: false, error: "missing_text" }, { status: 400 });
    await addHypothesis(text, String(body.metric || "").trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("hypothesis failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
