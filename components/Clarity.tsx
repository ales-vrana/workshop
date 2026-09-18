import Script from "next/script";

/**
 * Microsoft Clarity (heatmapy, nahrávky návštěv).
 * ID projektu se mění zde. Prázdné ID = skript se nevloží.
 *
 * Používá next/script se strategií afterInteractive - to je v Next.js
 * správný ekvivalent vložení do <head>: skript se načte hned po hydrataci,
 * na všech stránkách (landing i děkovací), a neblokuje vykreslení.
 */
const CLARITY_PROJECT_ID = "ykej9fbehc";

export function Clarity() {
  if (!CLARITY_PROJECT_ID) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
