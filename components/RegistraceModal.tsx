"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Calendar, Clock } from "lucide-react";
import { WORKSHOP, type TerminView } from "@/lib/config";
import { REGISTRACE_WEBHOOK_URL } from "@/lib/registrace";

/**
 * Registrace na ukázkovou lekci zdarma.
 *
 * Jeden formulář pro všechny termíny - termín se otevírá z karty v sekci
 * Termíny a posílá se jako pole. Data jdou na Zapier webhook
 * (lib/registrace.ts), po odeslání se člověk přesměruje na děkovací stránku
 * termínu, kde je odkaz na Zoom a tlačítka do kalendáře.
 *
 * Kromě údajů z formuláře posíláme i předpočítané časy připomínek, aby
 * je Zapier mohl rovnou použít v kroku „Delay Until" bez počítání:
 *   - pripominka_iso      24 h před začátkem; když už je pozdě, 2 h před;
 *                         když i to, okamžitě
 *   - pred_zacatkem_iso   30 min před začátkem
 */

const NBSP = / /g;
const HODINA = 60 * 60 * 1000;
const REZERVA = 5 * 60 * 1000; // připomínka musí být aspoň 5 min v budoucnu

function casPripominky(start: Date, ted: Date): Date {
  const den = new Date(start.getTime() - 24 * HODINA);
  if (den.getTime() > ted.getTime() + REZERVA) return den;
  const dveHodiny = new Date(start.getTime() - 2 * HODINA);
  if (dveHodiny.getTime() > ted.getTime() + REZERVA) return dveHodiny;
  return ted;
}

function utm(nazev: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(nazev) ?? "";
}

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-navy-100 bg-cream text-dark text-base focus-visible:border-teal-400 min-h-[48px]";

export function RegistraceModal({
  termin,
  onClose,
}: {
  termin: TerminView | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [jmeno, setJmeno] = useState("");
  const [prijmeni, setPrijmeni] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [web, setWeb] = useState(""); // past na roboty - člověk pole nevidí
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mailtoOdeslano, setMailtoOdeslano] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  const open = termin !== null;

  useEffect(() => {
    if (!open) return;
    setError("");
    setMailtoOdeslano(false);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstInput.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!termin) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!termin) return;
    setError("");

    if (!jmeno.trim() || !prijmeni.trim()) return setError("Vyplňte prosím jméno i příjmení.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Zkontrolujte prosím e-mail.");
    if (telefon.replace(/\D/g, "").length < 9) return setError("Zkontrolujte prosím telefon.");

    // Robot vyplnil skryté pole - tváříme se, že je hotovo, nic neposíláme
    if (web) {
      router.push(`/dekujeme/${termin.id}`);
      return;
    }

    const ted = new Date();
    const start = new Date(termin.dateISO);
    const data = {
      termin_id: termin.id,
      termin_datum: termin.dateFull.replace(NBSP, " "),
      termin_cas: termin.timeRange.replace(NBSP, " "),
      termin_start_iso: termin.dateISO,
      pripominka_iso: casPripominky(start, ted).toISOString(),
      pred_zacatkem_iso: new Date(start.getTime() - 30 * 60 * 1000).toISOString(),
      zoom_url: termin.zoomUrl,
      jmeno: jmeno.trim(),
      prijmeni: prijmeni.trim(),
      email: email.trim(),
      telefon: telefon.trim(),
      registrovano_iso: ted.toISOString(),
      utm_source: utm("utm_source"),
      utm_medium: utm("utm_medium"),
      utm_campaign: utm("utm_campaign"),
      utm_content: utm("utm_content"),
      stranka: window.location.href,
    };

    // Bez webhooku nic neztratíme: otevře se e-mail s vyplněnými údaji
    if (!REGISTRACE_WEBHOOK_URL) {
      const telo = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      window.location.href = `mailto:${WORKSHOP.contactEmail}?subject=${encodeURIComponent(
        `Registrace na ukázkovou lekci ${data.termin_datum}`
      )}&body=${encodeURIComponent(telo)}`;
      setMailtoOdeslano(true);
      return;
    }

    setSending(true);
    try {
      // no-cors: Zapier data přijme vždy, i když nevrací CORS hlavičky.
      // Chyba sítě (offline) se přesto projeví výjimkou a uvidíme ji.
      await fetch(REGISTRACE_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });
      router.push(`/dekujeme/${termin.id}`);
    } catch {
      setSending(false);
      setError(
        "Registraci se nepodařilo odeslat. Zkuste to prosím znovu, nebo napište na " +
          WORKSHOP.contactEmail
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registrace-titulek"
    >
      <div
        className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lifted p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute top-4 right-4 p-2 rounded-lg text-dark/40 hover:text-dark hover:bg-cream transition-colors"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {mailtoOdeslano ? (
          <div className="text-center py-6">
            <h2 className="text-xl font-bold text-navy-600 mb-2">Ještě odeslat e-mail</h2>
            <p className="text-base text-dark/70 leading-relaxed">
              Otevřeli jsme vám e-mail s vyplněnými údaji. Odešlete ho prosím a místo vám
              potvrdíme.
            </p>
            <button type="button" onClick={onClose} className="btn-secondary mt-6">
              Zavřít
            </button>
          </div>
        ) : (
          <>
            <p className="h-label mb-2">Registrace zdarma</p>
            <h2
              id="registrace-titulek"
              className="text-xl sm:text-2xl font-bold text-navy-600 mb-3 pr-8"
            >
              Rezervovat místo na ukázkové lekci
            </h2>

            <div className="rounded-xl bg-cream border border-navy-100/60 px-4 py-3 mb-6 space-y-1.5">
              <p className="flex items-center gap-2 text-base font-semibold text-navy-700">
                <Calendar className="h-4 w-4 text-navy-400 shrink-0" aria-hidden />
                {termin.dateFull}
              </p>
              <p className="flex items-center gap-2 text-sm text-dark/70">
                <Clock className="h-4 w-4 text-navy-400 shrink-0" aria-hidden />
                {termin.timeRange} · online přes {WORKSHOP.platform}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-jmeno" className="block text-sm font-semibold text-navy-700 mb-1.5">
                    Jméno
                  </label>
                  <input
                    ref={firstInput}
                    id="r-jmeno"
                    type="text"
                    value={jmeno}
                    onChange={(e) => setJmeno(e.target.value)}
                    autoComplete="given-name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="r-prijmeni" className="block text-sm font-semibold text-navy-700 mb-1.5">
                    Příjmení
                  </label>
                  <input
                    id="r-prijmeni"
                    type="text"
                    value={prijmeni}
                    onChange={(e) => setPrijmeni(e.target.value)}
                    autoComplete="family-name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="r-email" className="block text-sm font-semibold text-navy-700 mb-1.5">
                  E-mail
                </label>
                <input
                  id="r-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                  placeholder="jan@novak.cz"
                />
                <p className="mt-1.5 text-xs text-dark/55">Sem vám pošleme odkaz na Zoom.</p>
              </div>

              <div>
                <label htmlFor="r-telefon" className="block text-sm font-semibold text-navy-700 mb-1.5">
                  Telefon
                </label>
                <input
                  id="r-telefon"
                  type="tel"
                  inputMode="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  autoComplete="tel"
                  className={inputClass}
                  placeholder="+420 777 123 456"
                />
              </div>

              {/* Past na roboty: lidé pole nevidí, roboti ho vyplní */}
              <div className="absolute -left-[9999px]" aria-hidden>
                <label htmlFor="r-web">Web</label>
                <input
                  id="r-web"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
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
                  "Rezervovat místo zdarma"
                )}
              </button>

              <p className="text-xs text-dark/50 leading-relaxed">
                Údaje použiji k organizaci lekce: pošlu vám odkaz na Zoom a připomínku před
                začátkem. Kapacita je {WORKSHOP.capacity} míst na termín.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
