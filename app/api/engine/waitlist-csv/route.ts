import { getWaitlist } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getWaitlist();
  const header = ["jmeno", "email", "telefon", "utm_source", "utm_campaign", "utm_content", "created_at"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.jmeno,
        r.email,
        r.telefon || "",
        r.utm_source || "",
        r.utm_campaign || "",
        r.utm_content || "",
        r.created_at,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="waitlist.csv"',
      "Cache-Control": "no-store",
    },
  });
}
