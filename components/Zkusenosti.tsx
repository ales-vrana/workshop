import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { WORKSHOP } from "@/lib/config";

/**
 * Zkušenosti účastníků - sekce s Vimeo video referencemi.
 *
 * ZVUK (iOS): jediný spolehlivý způsob, jak na iPhonu spustit video se
 * zvukem, je klepnutí přímo na tlačítko Play UVNITŘ přehrávače Vimeo.
 * Jakékoliv programové spuštění (autoplay, postMessage „play") iOS ztlumí.
 * Proto tu není vlastní náhled s tlačítkem - přehrávač je rovnou v kartě,
 * uživatel klepne jednou na jeho Play a video hraje nahlas. Přehrávače se
 * načítají líně (loading="lazy"), takže se stahují jen ty, které jsou
 * blízko obrazu.
 *
 * Jména účastníků se záměrně nezobrazují (zatím nejsou ověřená).
 */
type Video = {
  vimeoId: string;
  hash?: string; // privátní Vimeo hash, pokud má
};

const VIDEOS: Video[] = [
  { vimeoId: "1139977428", hash: "3d7f98bfbb" },
  { vimeoId: "1139977179", hash: "2e5a492d00" },
  { vimeoId: "1139977735", hash: "0153cc4844" },
  { vimeoId: "1144317177" },
  { vimeoId: "1144317475" },
  { vimeoId: "1144317762" },
  { vimeoId: "1139978057", hash: "aeb9369525" },
  { vimeoId: "1139978207", hash: "bcd27dbdd0" },
  { vimeoId: "1139978479", hash: "5714a17543" },
  { vimeoId: "1144317958" },
  { vimeoId: "1144318064" },
  { vimeoId: "1144318197" },
  { vimeoId: "1139978160", hash: "e3ca9bdd64" },
  { vimeoId: "1140004608", hash: "1539eaf4c2" },
  { vimeoId: "1139977878", hash: "6634b5c6ae" },
  { vimeoId: "1139978271", hash: "aaa69c29fb" },
];

function vimeoEmbedUrl(v: Video): string {
  const base = `https://player.vimeo.com/video/${v.vimeoId}`;
  const params = new URLSearchParams({
    badge: "0",
    autopause: "1", // při spuštění dalšího videa se předchozí zastaví
    player_id: "0",
    app_id: "58479",
    autoplay: "0",
    muted: "0",
    playsinline: "1", // iPhone: přehrát v kartě, ne přes celou obrazovku
    dnt: "1",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  if (v.hash) params.set("h", v.hash);
  return `${base}?${params.toString()}`;
}

function VideoCard({ video, index }: { video: Video; index: number }) {
  return (
    <article className="rounded-2xl overflow-hidden bg-navy-900 shadow-soft border border-navy-100/40">
      <div className="relative aspect-video bg-navy-900">
        <iframe
          src={vimeoEmbedUrl(video)}
          title={`Videoreference účastníka workshopu ${index + 1}`}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </article>
  );
}

export function Zkusenosti() {
  return (
    <Section id="reference" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">Reference</p>
        <h2 className="h-display text-h2 text-navy-600 mb-4">Zkušenosti účastníků</h2>
        <p className="text-base sm:text-lg text-dark/70">
          Krátké video-reference od lidí, kteří workshop prošli. Klikněte na libovolnou kartu
          a poslechněte si jejich příběh.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {VIDEOS.map((v, i) => (
          <VideoCard key={v.vimeoId} video={v} index={i} />
        ))}
      </div>

      <div className="flex justify-center mt-12 sm:mt-14">
        <CTAButton href="#terminy" variant="primary">
          Chci to zažít - {WORKSHOP.price}
        </CTAButton>
      </div>
    </Section>
  );
}
