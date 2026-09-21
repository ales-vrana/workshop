"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { WORKSHOP } from "@/lib/config";
import { getClientAttribution } from "@/lib/attribution";
import { apiUrl } from "@/lib/paths";

/**
 * Modal pro zájemce, kterému nevyhovuje žádný vypsaný termín.
 * Ukládá kontakt do Workshop Engine (/api/waitlist) a posílá Meta Lead.
 */

interface Props {
  triggerLabel?: string;
  variant?: "light" | "dark";
}

function fbqLead(eventId: string) {
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  fbq("track", "Lead", { content_name: "waitlist-termin" }, { eventID: eventId });
}

export function ZajemceModal({
  triggerLabel = "Nevyhovuje mi žádný termín",
  variant = "light",
}: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jmeno, setJmeno] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");

  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!jmeno.trim()) return setError("Vyplň prosím jméno.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setError("Zkontroluj prosím e-mail.");

    const attribution = getClientAttribution();
    const eventId = crypto.randomUUID();
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jmeno: jmeno.trim(),
          email: email.trim(),
          telefon: telefon.trim(),
          visitorId: attribution?.visitorId,
          attribution,
          eventId,
          stranka: window.location.href,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; ok?: boolean };
      if (!res.ok) {
        setError(json.message || "Odeslání se nepovedlo. Napiš mi prosím na " + WORKSHOP.contactEmail);
        return;
      }
      fbqLead(eventId);
      setDone(true);
    } catch {
      setError("Odeslání se nepovedlo. Napiš mi prosím na " + WORKSHOP.contactEmail);
    } finally {
      setSending(false);
    }
  }

  const triggerClass =
    variant === "dark"
      ? "text-sm sm:text-base font-semibold text-teal-300 underline underline-offset-4 hover:text-teal-200 transition-colors"
      : "text-sm sm:text-base font-semibold text-teal-600 underline underline-offset-4 hover:text-teal-700 transition-colors";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zajemce-titulek"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lifted p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zavřít"
              className="absolute top-4 right-4 p-2 rounded-lg text-dark/40 hover:text-dark hover:bg-cream transition-colors"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            {done ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-500 mb-4">
                  <Check className="h-7 w-7 text-white" strokeWidth={3} aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-navy-600 mb-2">Mám to, děkuji</h2>
                <p className="text-base text-dark/70 leading-relaxed">
                  Až vypíšu nový termín, dám ti vědět jako prvnímu.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary mt-6"
                >
                  Zavřít
                </button>
              </div>
            ) : (
              <>
                <p className="h-label mb-2">Chci na workshop</p>
                <h2 id="zajemce-titulek" className="text-xl sm:text-2xl font-bold text-navy-600 mb-2">
                  Nevyhovuje ti žádný termín?
                </h2>
                <p className="text-sm sm:text-base text-dark/70 leading-relaxed mb-6">
                  Nech mi jméno a e-mail. Jakmile vypíšu nový termín, ozvu se ti dřív, než ho dám na web.
                </p>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label htmlFor="z-jmeno" className="block text-sm font-semibold text-navy-700 mb-1.5">
                      Jméno a příjmení
                    </label>
                    <input
                      ref={firstInput}
                      id="z-jmeno"
                      type="text"
                      value={jmeno}
                      onChange={(e) => setJmeno(e.target.value)}
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-lg border border-navy-100 bg-cream text-dark focus-visible:border-teal-400 min-h-[48px]"
                      placeholder="Jan Novák"
                    />
                  </div>

                  <div>
                    <label htmlFor="z-email" className="block text-sm font-semibold text-navy-700 mb-1.5">
                      E-mail
                    </label>
                    <input
                      id="z-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-lg border border-navy-100 bg-cream text-dark focus-visible:border-teal-400 min-h-[48px]"
                      placeholder="jan@novak.cz"
                    />
                  </div>

                  <div>
                    <label htmlFor="z-telefon" className="block text-sm font-semibold text-navy-700 mb-1.5">
                      Telefon <span className="font-normal text-dark/50">(nepovinné)</span>
                    </label>
                    <input
                      id="z-telefon"
                      type="tel"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      autoComplete="tel"
                      className="w-full px-4 py-3 rounded-lg border border-navy-100 bg-cream text-dark focus-visible:border-teal-400 min-h-[48px]"
                    />
                  </div>

                  {error && (
                    <p className="text-sm font-medium text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={sending} className="btn-primary w-full">
                    {sending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Odesílám
                      </>
                    ) : (
                      "Dej mi vědět o novém termínu"
                    )}
                  </button>

                  <p className="text-xs text-dark/50 leading-relaxed">
                    Kontakt použiji jen k tomu, abych ti napsal o dalších termínech workshopu.
                    Kdykoli se můžeš odhlásit.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
