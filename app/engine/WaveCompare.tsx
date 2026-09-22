import type { FunnelCounts, LaunchWaveRow } from "@/lib/db";
import {
  MIN_SAMPLE,
  deltaTone,
  formatDurationCs,
  formatPctPoints,
  formatRate,
  formatRelPct,
  formatWhenPrague,
  funnelCompareRows,
  type ExposurePair,
} from "@/lib/waves";
import { DeleteWaveButton } from "./WavesForm";

function toneClass(tone: "up" | "down" | "flat") {
  if (tone === "up") return "text-cta font-bold";
  if (tone === "down") return "text-red-700 font-bold";
  return "text-dark/70";
}

export function WaveCompare({
  waves,
  pair,
  current,
  previous,
}: {
  waves: LaunchWaveRow[];
  pair: ExposurePair | null;
  current: FunnelCounts | null;
  previous: FunnelCounts | null;
}) {
  const rows = current && previous ? funnelCompareRows(current, previous) : [];
  const sample = Math.min(current?.uniqueVisitors || 0, previous?.uniqueVisitors || 0);
  const tooSoon = sample > 0 && sample < MIN_SAMPLE;

  return (
    <div className="space-y-4">
      {pair && current && previous ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-dark/70">
              Stejné okno <strong>{formatDurationCs(pair.exposureMs)}</strong> od startu každé vlny.
              Nová: <strong>{pair.current.wave.name}</strong>
              {" · "}
              předchozí: <strong>{pair.previous.wave.name}</strong>.
            </p>
            {tooSoon && (
              <p className="text-xs font-bold uppercase tracking-wider text-gold-700">
                Ještě brzy · {sample} návštěv (chce ~{MIN_SAMPLE})
              </p>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-navy-100/70 bg-white shadow-soft">
            <table className="min-w-full text-sm">
              <thead className="bg-cream text-left text-[11px] uppercase tracking-wider text-navy-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Metr</th>
                  <th className="px-4 py-3 font-bold">Nová vlna</th>
                  <th className="px-4 py-3 font-bold">Předchozí</th>
                  <th className="px-4 py-3 font-bold">Změna</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const tone = deltaTone(row);
                  const delta =
                    row.kind === "rate"
                      ? `${formatPctPoints(row.currentRate, row.previousRate)} · ${formatRelPct(row.currentAbs, row.previousAbs)}`
                      : `${row.currentAbs - row.previousAbs > 0 ? "+" : ""}${row.currentAbs - row.previousAbs} · ${formatRelPct(row.currentAbs, row.previousAbs)}`;
                  return (
                    <tr key={row.id} className="border-t border-navy-50">
                      <td className="px-4 py-3 font-semibold text-navy-800">{row.label}</td>
                      <td className="px-4 py-3">
                        {row.kind === "rate" ? (
                          <>
                            {formatRate(row.currentRate)}
                            <span className="text-dark/40"> · {row.currentAbs}</span>
                          </>
                        ) : (
                          row.currentAbs
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.kind === "rate" ? (
                          <>
                            {formatRate(row.previousRate)}
                            <span className="text-dark/40"> · {row.previousAbs}</span>
                          </>
                        ) : (
                          row.previousAbs
                        )}
                      </td>
                      <td className={`px-4 py-3 ${toneClass(tone)}`}>{delta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-dark/60 rounded-2xl border border-navy-100/70 bg-white p-4 shadow-soft">
          Až poběží aspoň dvě vlny, tady uvidíš novou proti předchozí ve stejném čase od startu.
        </p>
      )}

      <ul className="space-y-2">
        {waves.map((w, i) => {
          const isCurrent = i === waves.length - 1;
          return (
            <li
              key={w.id}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 justify-between rounded-xl border border-navy-50 bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold text-navy-800">
                  {w.name}
                  {isCurrent && (
                    <span className="ml-2 text-[11px] uppercase tracking-wider text-cta font-bold">běží</span>
                  )}
                </p>
                <p className="text-xs text-dark/50 mt-0.5">
                  od {formatWhenPrague(w.started_at)}
                  {w.notes ? ` · ${w.notes}` : ""}
                </p>
              </div>
              {isCurrent && waves.length > 1 && <DeleteWaveButton id={w.id} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
