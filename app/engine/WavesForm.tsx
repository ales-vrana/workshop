"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/paths";

function toLocalInput(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WavesForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [when, setWhen] = useState(toLocalInput);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const startedAt = new Date(when);
      if (Number.isNaN(startedAt.getTime())) throw new Error("bad_date");
      const res = await fetch(apiUrl("/api/engine/waves"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, startedAt: startedAt.toISOString(), notes }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || "save");
      setName("");
      setNotes("");
      setWhen(toLocalInput());
      router.refresh();
    } catch {
      setError("Uložení se nepovedlo. Zkontroluj název a datum.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_1fr_auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={120}
        placeholder="Název změny (např. Nový H1)"
        className="px-3 py-2.5 rounded-lg border border-navy-100 bg-white text-sm min-h-[44px]"
      />
      <input
        type="datetime-local"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        required
        className="px-3 py-2.5 rounded-lg border border-navy-100 bg-white text-sm min-h-[44px]"
      />
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={240}
        placeholder="Co se změnilo (volitelné)"
        className="px-3 py-2.5 rounded-lg border border-navy-100 bg-white text-sm min-h-[44px]"
      />
      <button type="submit" disabled={sending} className="btn-primary !min-h-[44px] !py-2 !px-4 !text-xs">
        {sending ? "Ukládám" : "Zahájit vlnu"}
      </button>
      {error && (
        <p className="lg:col-span-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function DeleteWaveButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Smazat tuhle vlnu? Data zůstanou, jen se znovu přiřadí sousední vlně.")) return;
    setBusy(true);
    try {
      await fetch(apiUrl("/api/engine/waves"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "delete", id }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-xs font-semibold text-dark/50 hover:text-red-700"
    >
      smazat
    </button>
  );
}
