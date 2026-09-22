import { NextResponse } from "next/server";
import { addLaunchWave, deleteLaunchWave } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    if (body.action === "delete") {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
      await deleteLaunchWave(id);
      return NextResponse.json({ ok: true });
    }

    const name = String(body.name || "").trim();
    const startedAt = new Date(String(body.startedAt || ""));
    const notes = String(body.notes || "").trim();
    if (!name) return NextResponse.json({ ok: false, error: "missing_name" }, { status: 400 });
    if (Number.isNaN(startedAt.getTime())) {
      return NextResponse.json({ ok: false, error: "bad_date" }, { status: 400 });
    }
    const ahead = startedAt.getTime() - Date.now();
    if (ahead > 60 * 60 * 1000) {
      return NextResponse.json({ ok: false, error: "future" }, { status: 400 });
    }
    await addLaunchWave(name, startedAt, notes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("wave failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
