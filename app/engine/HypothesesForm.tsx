"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/paths";

export function HypothesesForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [metric, setMetric] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/engine/hypotheses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, metric }),
      });
      if (!res.ok) throw new Error("save");
      setText("");
      setMetric("");
      router.refresh();
    } catch {
      setError("Uložení se nepovedlo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        placeholder="Hypotéza (např. H1 víc sedí na reklamu o korporátu)"
        className="px-3 py-2.5 rounded-lg border border-navy-100 bg-white text-sm min-h-[44px]"
      />
      <input
        value={metric}
        onChange={(e) => setMetric(e.target.value)}
        placeholder="Metr (checkout, waitlist…)"
        className="px-3 py-2.5 rounded-lg border border-navy-100 bg-white text-sm min-h-[44px]"
      />
      <button type="submit" disabled={sending} className="btn-primary !min-h-[44px] !py-2 !px-4 !text-xs">
        {sending ? "Ukládám" : "Přidat"}
      </button>
      {error && (
        <p className="sm:col-span-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function HypothesisStatus({ id, status }: { id: number; status: string }) {
  const router = useRouter();

  async function change(next: string) {
    await fetch(apiUrl("/api/engine/hypotheses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "status", id, status: next }),
    });
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => change(e.target.value)}
      className="text-xs font-semibold rounded-md border border-navy-100 bg-white px-2 py-1"
    >
      <option value="open">otevřená</option>
      <option value="running">běží</option>
      <option value="learned">poučení</option>
    </select>
  );
}
