# Forenzní audit landing page ukázkové lekce

**Stránka:** https://poznej.coachville.eu/workshop  
**Měřeno:** 21. 9. 2026, Chrome headless, viewporty iPhone 14 (390×844), iPhone SE (375×667), Android (360×800), desktop (1440×900).  
**Produkční HTML:** ISR cache Vercel (`x-vercel-cache: HIT`, `x-powered-by: Next.js`), věk HTML v řádu minut.  
**Aplikační kód:** žádná změna. Tento dokument je diagnóza.

Surová čísla: [`audit/measurements.json`](./measurements.json). Screenshoty: [`audit/screenshots/`](./screenshots/). Lighthouse: [`audit/lighthouse.report.json`](./lighthouse.report.json).

---

## 1. Verdikt na jednu stránku

**Platí Svět A. Jistota 85 %.**

Lidé z reklamy skutečně zůstávají na první obrazovce. Stránka technicky scrolluje na `window`/`document`. Clarity 5,9 % není rozbité měření vnitřního kontejneru.

**Hlavní důkaz (ověřeno měřením):**

| Zdroj | Číslo |
|---|---|
| Clarity, průměrná hloubka scrollu | **5,9 %** |
| iPhone 14: `innerHeight / scrollHeight` = 844 / 15 980 | **5,28 %** |
| iPhone SE | **4,13 %** |
| Android 360×800 | **4,84 %** |
| Desktop 1440×900 | **7,27 %** |

Kdyby návštěvník viděl jen první viewport a nehnul prstem, Clarity by nahlásila právě tento poměr. 5,9 % sedí na mobilní mix. Hypotéza B (vnitřní scroller, `window.scrollY` navždy 0) je **vyvrácená**: po `scrollTo(max)` je `window.scrollY === 15136` (iPhone 14), `overflow-y` u `html`/`body`/`main` je `visible`, vnitřní scroller s `overflow-y: auto|scroll` je **0**.

**Svět B: 5 %.** V kódu ani v živém DOM není Lenis, Locomotive, GSAP ScrollSmoother, `h-screen` layout ani `overflow: hidden` na `body`.

**Svět C: 10 % jako šum, ne jako vysvětlení 5,9 %.** Clarity API v Engine táhne **celý projekt za 3 dny bez filtru URL**. Nesrovnalost 1 831 lidí > 1 763 sezení je artefakt parseru Engine (`sumBy` unique users přes řádky Traffic), ne důkaz, že 5,9 % patří jiné stránce. Samotné 5,9 % odpovídá geometrii **této** stránky.

---

## 2. Přímá odpověď na ústřední otázku

> Proč Clarity hlásí průměrnou hloubku scrollu 5,9 %, když stránka prokazatelně scrolluje, a proč při 1 763 sezeních a průměrném čase 36 sekund prakticky nikdo neklikne na hlavní CTA?

Protože **měření je v pořádku a lidé nescrollují**. Stránka je ~19 obrazovek vysoká (iPhone 14). První obrazovka = 5,3 % dokumentu. To je to číslo z Clarity.

Stránka **prokazatelně scrolluje** — majitel na iPhonu i tento audit (`window.scrollY` dojde na konec, klik na `#hero-cta` odroluje na `#terminy` na Y=2865). Clarity to vidí jen u lidí, kteří se pohnou. Ti se skoro nepohnou.

Hlavní CTA **je vidět bez scrollu** na všech čtyřech viewportech (iPhone 14: top 527 px, výška 56 px, plně v 844 px). Cena **199 Kč je vidět**. Tlačítko je skutečný `<a href="#terminy">`, bez JS funguje. Žádná cookie lišta ho nepřekrývá. Hydratace neselže. LCP je 1,7 s (reálné Fast 3G) až 3,7 s (Lighthouse simulace) — **36 s není čekání na načtení**.

36 s bez scrollu sedí na **hero karusel 25 citací, interval 6,5 s** (`components/HeroReference.tsx`): za 36 s naskočí ~5 slideů. Člověk čte/kouká na první obrazovku, neklikne, odejde. Rage click 0 % a quickback 0 % tomu odpovídají: nikdo nebojuje s rozbitým tlačítkem, jen neodchází okamžitě a nepokračuje dolů.

To není bug trackeru. Je to chování na první obrazovce (nabídka, kreativita, headline „Z korporátu k práci…“, CTA „Zobrazit termíny“ místo nákupu).

---

## 3. Tabulka nálezů (podle dopadu)

| # | Nález | Závažnost | Důkaz | Jistota | Odhadovaný dopad na konverzi |
|---|---|---|---|---|---|
| 1 | Průměrný scroll 5,9 % = první viewport. Lidé nescrollují, měření platí. | **Kritická** (interpretace všech dosavadních rozhodnutí) | 844/15980 = 5,28 %; Clarity 5,9 %; `window.scrollY` max 15136; 0 inner scrollerů. Screenshoty `*-first-viewport.png` | Ověřeno měřením | Pokud se dál „opravuje tracker“, ztratí se týdny. Páka je hero, ne Clarity. |
| 2 | Hero na mobilu je uzavřený tmavý rám (~1,17–1,48 vh). Sekce `#co-zazijete` **nevykukuje**. CTA viditelné, ale stránka vypadá jako hotová karta. | **Vysoká** | iPhone 14 header 984 px vs 844 vh, `nextPeeks: false`. `components/Hero.tsx:29` nemá `min-h-screen`, výška je obsahová. | Ověřeno měřením | Vysvětluje nulový scroll i při viditelném CTA. |
| 3 | Karusel 25 citací autoplay 6,5 s spotřebuje těch 36 s na první obrazovce. | **Vysoká** | `HeroReference.tsx:21-47, AUTO_MS = 6500`; screenshot `1/25`. | Ověřeno kódem + screenshot | Čas na stránce ≠ čtení nabídky. |
| 4 | Clarity Data Export v Engine je **project-wide**, `numOfDays=3`, **bez URL**. | **Vysoká** (kvalita cockpit čísel) | `lib/clarity.ts:64` | Ověřeno kódem | 5,9 % tady coincidenčně sedí na landing; příště nemusí. |
| 5 | 1 831 lidí > 1 763 sezení: Engine sčítá `distinctUserCount` / `distantUserCount` přes řádky Traffic. | **Střední** | `lib/clarity-analyze.ts:57-67, 95-97, 271` | Silná indicie | Rozbije důvěru v dashboard, ne samotný scroll. |
| 6 | `fbclid` se **neposílá** na Stripe Payment Link, jen `utm_*` + `client_reference_id`. | **Vysoká** (atribuce platby) | `lib/attribution.ts:28-34, 116-123`; naměřený Stripe URL bez `fbclid` | Ověřeno měřením | Platbu nelze spárovat s reklamou přes fbclid. |
| 7 | Žádné Meta CAPI. Purchase jen v prohlížeči na `/dekujeme`. Stripe `target="_blank"`. | **Vysoká** (FB in-app) | webhook `app/api/stripe/webhook/route.ts` jen DB; `Terminy.tsx:101-106`; `MetaPixelPurchase.tsx` | Ověřeno kódem | Ztráta konverzí v iOS/FB WebView + ITP. |
| 8 | `hero.jpg` `loading="lazy"`, 1586×992 JPEG 146 kB. LCP je odstavec v hero, ne obrázek. | **Střední** | `Hero.tsx:32-36`; Lighthouse LCP `p.mt-6` 3,7 s; reálné Fast 3G 1,66 s | Ověřeno | LCP 3,7 s v labu; 36 s to nevysvětluje. |
| 9 | CTA na mobilu `!text-white` na `#34A853` = kontrast **3,06:1** (AA fail). | **Střední** | `Hero.tsx:90`; naměřená barva `rgb(255,255,255)` na `rgb(52,168,83)` | Ověřeno | Slabší čitelnost, ne vysvětlení 0 kliků (rage 0 %). |
| 10 | Tap targety pod 44 px: šipky karuselu 36×36, odkaz „více informací“ výška 20 px, waitlist trigger 20 px. | **Nízká** | `measurements.json` clickablesSmall | Ověřeno | Dead click 1,8 % může jít odsud + z citace, která není odkaz. |
| 11 | `og-image.jpg` 404; `_vercel/insights/script.js` 404 + MIME text/plain. | **Nízká** | curl 404; Lighthouse network-requests | Ověřeno | OG sdílení; konzole error. Nekazí scroll. |
| 12 | Kořen `https://poznej.coachville.eu/` je **jiný Next.js web** (1,55 MB HTML, recenze koučů), ne tahle landing. `workshop.coachville.eu` má špatný TLS. | **Střední** (pokud sem míří část reklam) | curl root 200, title „CoachVille zkušenosti a recenze koučů“; workshop host SSL mismatch | Ověřeno | Pokud reklama míří na `/` místo `/workshop`, ten provoz v tomto Clarity projektu není. |
| 13 | První strana Engine funnelu (`page_view`, `hero_show_dates`) existuje v kódu, ale **bez časového okna** a v tomto běhu bez DB přístupu. | **Střední** | `lib/db.ts:567-577` `FROM events` bez `WHERE created_at` | Ověřeno kódem | Nelze porovnat 3 dny Clarity vs vlastní eventy. |
| 14 | H1 „Z KORPORÁTUK PRÁCI“ (chybějící mezera) se **nyní nereprodukuje**. Tři `display:block` spany, uppercase přes `.h-display`. | **Nízká** (uzavřeno) | `Hero.tsx:50-55`; screenshoty first-viewport | Ověřeno | — |

---

## 4. Naměřené hodnoty

### Inventarizace (stack)

| Položka | Hodnota | Důkaz |
|---|---|---|
| Stack | Next.js **14.2.5**, App Router, `app/page.tsx`, `revalidate = 3600` (ISR) | `package.json`, `app/page.tsx:23` |
| Hosting | Vercel (`server: Vercel`, `x-vercel-cache: HIT`) | response headers |
| `basePath` | `/workshop` | `next.config.mjs:3` |
| Soubor stránky | `app/page.tsx` (Hero → CoZazijete → Terminy → …) | |
| Další URL téhož projektu | `/workshop/dekujeme`, `/workshop/dekujeme/[slug]`, `/workshop/engine` | `app/**/page.tsx` |
| Stará ClickFunnels verze v tomto repu | Nenalezena | grep |
| Produkční URL reklamy (dokumentovaná) | `https://poznej.coachville.eu/workshop?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.name}}` | `docs/WORKSHOP-ENGINE.md:45-47` |
| Redirect z `/workshop` (bez lomítka) + UTM + fbclid | **0 skoků**, 200, ~40–110 ms, parametry beze změny | curl + `measurements.json` redirects |
| Redirect z `/workshop/?utm…&fbclid=` | **1× 308** na `/workshop?…`, query **přežije**, ~60 ms | curl |
| CSP | žádná hlavička `content-security-policy` | curl |
| GTM | není | HTML i runtime `dataLayer`/`gtag` = undefined |

### Rozměry a teoretický scroll

| Viewport | `innerHeight` | `scrollHeight` | Obrazovek | 1. obrazovka = | CTA top | CTA v 1. viewportu | Cena 199 Kč | Další sekce vykukuje | Hero / vh |
|---|---|---|---|---|---|---|---|---|---|
| 390×844 | 844 | 15 980 | 18,93 | **5,28 %** | 527 | ano, plně | ano (595–614) | ne | 1,17 |
| 375×667 | 667 | 16 151 | 24,21 | **4,13 %** | 527 | ano, plně | ano | ne | 1,48 |
| 360×800 | 800 | 16 537 | 20,67 | **4,84 %** | 527 | ano, plně | ano | ne | 1,26 |
| 1440×900 | 900 | 12 376 | 13,75 | **7,27 %** | 651 | ano, plně | ano | ne | 1,02 |

Clarity 5,9 % ≈ první sloupec „1. obrazovka“. Kdyby měření bylo rozbité (Svět B), tento poměr by byl náhoda v řádu desetin procenta napříč čtyřmi výškami dokumentu — není.

`100vh` / `100dvh` na hero **není**. Na iOS Safari je `100vh` větší než viditelná plocha kvůli adresnímu řádku; tady je hero obsahově vyšší než viewport, takže se chová jako „o něco víc než obrazovka“. Chrome emulace použila 844 bez chrome UI. Reálný Safari innerHeight je menší → pod CTA zbude ještě méně, false-bottom zesílí. (Fyzický iPhone v tomto běhu nebyl.)

### Mapa sekcí (iPhone 14, 844 px)

| Sekce | id | Top px | Výška px | Začíná na obrazovce |
|---|---|---|---|---|
| Hero | — | 0 | 984 | 0,00 |
| Co tě čeká | `co-zazijete` | 984 | 1 881 | **1,17** |
| **Termíny** | `terminy` | **2 865** | 1 420 | **3,39** |
| Citace | `citace` | 4 867 | 961 | 5,77 |
| Reference / zkušenosti | `reference` | 5 828 | 1 767 | 6,90 |
| Pochybnosti | `situace` | 7 594 | 1 985 | 9,00 |
| Pro koho | `pro-koho` | 9 579 | 882 | 11,35 |
| Program | `program` | 10 461 | 786 | 12,39 |
| Nemůžeš pokazit | `nemuzes-pokazit` | 11 247 | 622 | 13,33 |
| Lektor | `lektor` | 11 869 | 902 | 14,06 |
| FAQ | `faq` | 12 771 | 1 196 | 15,13 |
| Closing CTA | `koupit` | 13 968 | 1 461 | 16,55 |
| Footer | — | 15 408 | 572 | 18,26 |

Termíny začínají na **4. obrazovce**. Bez kliku na CTA je to ~2 865 px scrollu.

### Co je nad ohybem

Screenshoty (první viewport, po korekci `scroll-behavior: auto`):

- [`iphone14-first-viewport.png`](./screenshots/iphone14-first-viewport.png)
- [`iphoneSE-first-viewport.png`](./screenshots/iphoneSE-first-viewport.png)
- [`android-first-viewport.png`](./screenshots/android-first-viewport.png)
- [`desktop-first-viewport.png`](./screenshots/desktop-first-viewport.png)

Na všech čtyřech: H1 „Z KORPORÁTU / K PRÁCI, KTERÁ / DÁVÁ SMYSL.“, podtitulek, karusel, odkaz „více informací“, zelené **ZOBRAZIT TERMÍNY**, **199 Kč**. Na SE je řez přes portrét lektora (scroll cue). Na 844 px je vidět i začátek úvodního odstavce, oříznutý u spodní hrany. Bílá sekce pod hero **není** v prvním viewportu.

### Výkon

| Metrika | Lighthouse mobile (simulated Fast 3G, 4× CPU) | Reálné CDP Fast 3G, cache off, iPhone 14 |
|---|---|---|
| Performance | **87** | — |
| LCP | **3,7 s** | **1,66 s** |
| LCP element | `<p class="mt-6 …">` úvod v hero, top 718–848 | tentýž `<p>` |
| CLS | **0** | — |
| TBT | **190 ms** | — |
| INP | Lighthouse 12 v tomto běhu INP nevrátil | — |
| TTI | **7,0 s** | DOM complete ~13,7 s wall (včetně 12 s čekání) |
| FCP | 1,0 s | — |
| Přenos | **893 KiB** / 32 requestů | ~859 KiB (uncached run dříve) |

LCP fáze v Lighthouse: TTFB 16 %, render delay **83 %** (fonty + JS), žádný load delay obrázku — LCP **není** `hero.jpg`, protože ten je `loading="lazy"` a LCP vyhrál textový blok u ohybu.

Hypotéza „36 s = čekání na načtení“: **slabá**. I lab LCP 3,7 s nechá ~32 s na čtení.

### Tracking (A1–A7)

**Verdikt A2: Scroll je nativní na `window`.**

- `html`/`body`/`main`: `overflow: visible`, `position: static`, žádný `h-screen`/`100dvh` na obalu stránky. `globals.css:14-26`.
- `overflow-hidden` je jen clip obsahu sekcí (`Section.tsx:21`, `Hero.tsx:29`), ne scrollport.
- Sticky CTA je `position: fixed` overlay (`globals.css:124-136`), na loadu `translateY(69px)` mimo obraz.
- Reveal používá `translateY(20px)` jen na fade (`globals.css:184-193`), default viditelný.
- Lenis/Locomotive/GSAP ScrollSmoother/react-scroll: nejsou v `package.json` ani na `window`.
- `window` scroll eventy se spouští. S `scroll-behavior: auto` `scrollTo(max)` → `scrollY === max`. (Při default `smooth` v CSS první měření dojelo jen na 4435/15136 za 300 ms — to je artefakt animace, ne vnitřní kontejner.)
- Klik `#hero-cta` → `location.hash === "#terminy"`, `scrollY === 2865`, sekce termínů `top ≈ 0`.

**Clarity**

- Inline v `<head>` layoutu, project **`ykej9fbehc`**, `async=1`. `app/layout.tsx:75-85`.
- Na živé stránce jeden tag `https://www.clarity.ms/tag/ykej9fbehc` + runtime `scripts.clarity.ms/…/clarity.js`. To je jedna instalace, ne dvě.
- `components/Clarity.tsx` existuje (afterInteractive), **nikde se neimportuje**.
- GTM není. Duplicita GTM+inline: ne.
- Skript je v head před interakcí, není consent-gated.
- Layout platí pro **celý** app router včetně `/dekujeme` a `/engine`.

**Consent:** žádná CMP (Cookiebot/CookieYes/OneTrust/vlastní lišta). `cmpHits: []`. Clarity ani Pixel se neblokují. Žádný výběr 30 % souhlasících. Překryv CTA lištou: 0 px.

**Pixel:** ID `884397061610419` (`lib/workshop-params.ts:72`). `afterInteractive` PageView (`MetaPixel.tsx:18-29`). Navíc `ViewContent` z `Attribution.tsx:117-124`, `InitiateCheckout` při kliku na Stripe, `Lead` z waitlistu, `Purchase` jen na děkovací stránce. CAPI: není. fbq i clarity funkce na stránce přítomné.

**Konzole:** žádný hydration mismatch. 404 `og-image.jpg`, 404 `_vercel/insights/script.js`. Občas `NaN` z interního logu (font-size 0, transparent) — ne hydration.

**První strana eventy:** `scroll_50` počítá `(scrollY + innerHeight) / scrollHeight` na `window` (`Attribution.tsx:152-161`). Při Světě A (nativní window) by `scroll_50` v DB mělo být ~0, pokud lidé opravdu nescrollují. To je křížová kontrola, kterou tento běh nemohl spočítat (žádný `DATABASE_URL` v prostředí).

---

## 5. Funnel tabulka + chybějící měřicí body

Stejné 3denní okno jako Clarity **nejde dnes sestavit** z dostupných zdrojů. Engine SQL je all-time (`FROM events` bez data). Facebook token v tomto prostředí chybí. Stripe čísla nejsou v API tohoto auditu.

| Krok | Zdroj dat | Počet | Poměr k předchozímu |
|---|---|---|---|
| Zobrazení reklamy | Meta | **nelze** | |
| Kliknutí na odkaz | Meta | **nelze** | |
| Zobrazení landing page (Meta) | Meta Landing page views | **nelze** | |
| Sezení | Clarity (Engine API, 3 dny, celý projekt) | 1 763 | |
| Lidé | Engine parser Traffic rows | 1 831 (nepoužitelné, viz nález 5) | n/a |
| Kliknutí na CTA | Clarity heatmap / vlastní `hero_show_dates` za 3 dny | **nelze** | |
| Zobrazení sekce termínů | `scroll_terminy` za 3 dny | **nelze** | |
| Zahájení checkoutu | Pixel InitiateCheckout / `initiate_checkout` | **nelze** | |
| Zaplaceno | Stripe webhook / Purchase pixel | **nelze** | |

### Chybějící měřicí body (hlavní praktický výstup)

1. Meta impressions, link clicks, landing page views, **stejné 3 dny**, kampaň s „workshop“ v názvu.
2. Clarity **filtrované na URL** `/workshop` (ne project total) — scroll, time, clicks na `#hero-cta`.
3. First-party `page_view`, `hero_show_dates`, `scroll_50`, `scroll_terminy`, `initiate_checkout` **s `created_at` v tomtéž okně** (`lib/db.ts` dnes filtr nemá).
4. Stripe Checkout sessions started vs paid, stejné okno.
5. CAPI eventy (neexistují).
6. FB in-app vs Safari split (Clarity device/browser, nebo UA v `page_view` — UA se do track payloadu neukládá).
7. Porovnání Ads „link clicks“ vs Clarity sessions (ztráta >20 % je v zadání nález; tady nespočítatelné).

---

## 6. Co jsem nemohl ověřit a proč

| Co | Proč | Co by to chtělo |
|---|---|---|
| Fyzický iPhone Safari + Facebook in-app (WKWebView) | Jen Chrome emulace + UA `FBAN`/`Instagram`. UA nemění scroll engine ani chrome výšku. | 10 nahrávek z reálného FB kola, innerHeight se zapnutým adresním řádkem. |
| Jestli se náš testovací klik objevil v Clarity session | Nemáme přihlášení do Clarity UI | 1 session replay po kliku na #hero-cta |
| Heatmapa vs aktuální DOM (po redesignu) | API live-insights nemá heatmapu | Screenshot heatmapy z Clarity na `/workshop` |
| Engine funnel a FB spend | V podu není `DATABASE_URL` / `FB_ACCESS_TOKEN` / `CLARITY_API_TOKEN` | Read-only dotaz na Neon za 3 dny + Ads insights |
| Testovací platba Stripe | Live Payment Link, 199 Kč, skeleton screenshot po 171 ms | Stripe test mode link, nebo 1 testovací nákup |
| Návrat ze Stripe v FB in-app | `_blank` + reálný WebView | Ruční nákup z Instagram/Facebook app |
| Systémové písmo iOS Dynamic Type | Emulace `html { font-size: 24px }` není Dynamic Type | iPhone Accessibility |
| Kam přesně míří živé reklamy | Dokumentovaná šablona je `/workshop?utm_…`; live Ads UI neotevřena | Ads Manager destination URL u každé kreativy |
| Podíl botů / Quickback 0,0 % z Clarity UI vs náš parser | Máme jen čísla ze zadání | Raw JSON z `project-live-insights` |
| INP v terénu | Lighthouse 12 v tomto běhu INP nevrátil | CrUX / field INP |

---

## 7. Návrhy oprav (bez implementace), podle páky / námahy

1. **Neopravovat Clarity scroll.** (0 h) Data sedí. Další práce je obsah první obrazovky.
2. **Zkrátit hero na mobilu tak, aby pod ohybem koukala bílá sekce „Co zažiješ“** (~2–4 h). Teď `nextPeeks: false`. To je nejlevnější test Světa A: když vykoukne další sekce a scroll v Clarity stoupne, hypotéza drží.
3. **Vypnout autoplay karuselu** nebo ho dát pod fold (~1 h). 36 s teď žerou citace.
4. **CTA nad ohybem změnit z „Zobrazit termíny“ na nákupní slib + cenu v tlačítku** (~1 h) a měřit `hero_show_dates` po dnech. Viditelné tlačítko, které nikdo nemačká, je copy, ne hit area (56×350 px).
5. **Do Clarity API přidat filtr URL / dimension** a v Engine **přestat sčítat unique users přes dimenzní řádky**; brát 1 total řádek nebo `max()`, ne `sumBy`. (~2–3 h.) Opraví 1831 > 1763 a Svět C.
6. **`getFunnel()` omezit na stejné 3 dny** jako Clarity. (~1 h.)
7. **`withAttribution` posílat i `fbclid`** (Stripe client_reference stačí interně; pro Meta matching je fbclid). (~0,5 h.)
8. **CAPI ze Stripe webhooku** `checkout.session.completed` + eventID sladit s pixelem. (~4–8 h.)
9. **Stripe `target="_blank"` na mobilu/FB vypnout** (stejné okno). (~0,5 h.) In-app prohlížeče `_blank` často zabijí návrat.
10. **`hero.jpg`:** `fetchPriority="high"`, zrušit `loading="lazy"`, WebP/AVIF, width podle DPR. (~1 h.) LCP v labu 3,7 s.
11. **Kontrast CTA** na mobilu: ne `!text-white` na `#34A853`. (~15 min.)
12. **404 `og-image.jpg`** a Vercel Analytics script. (~15 min.)
13. **Ověřit destination URL v Ads Manageru** vs kořen `poznej.coachville.eu/` (jiný web). (~30 min člověka.)

---

## 8. Tři věci, které by ověřil člověk chytřejší než já

1. **Quickback 0,0 % při placeném Facebooku je podezřelé.** Běžný cold traffic z Feed/Reels má vysoký instant bounce. Buď Clarity „quickback“ počítá jinak, než si myslíme (např. jen back-button do 1 s), nebo do projektu teče teplý provoz (remarketing, existující zákazníci), nebo filtr v dashboardu není ten, který si myslíme. Bez raw JSON to neuzavřu.

2. **Proč LCP vyhrál odstavec u ohybu, ne H1 ani hero fotka.** H1 je větší vizuálně (28 px extra-bold, 3 řádky). Lighthouse vybral `p.mt-6` (130×350). Buď je H1 split do spanů a „element size“ je malý, nebo lazy fotka vypadla z kandidátů. Na konverzi to nemá vliv, ale na optimalizaci LCP by se dalo šlápnout vedle.

3. **Jestli 5,9 % není průměr z „0 % scrollerů + hrstky lidí, co dojedou na konec“.** Průměr 5,9 % při 19 obrazovkách může být i: 95 % lidí na 5 % a 5 % lidí na 100 % → průměr ~9 %, ne 5,9. Blíž je „skoro všichni viděli jen první screen“. Histogram scroll depth v Clarity UI (ne průměr) by to rozsekl. Pokud je medián taky ~6 %, je to hotové. Pokud je medián 0 a průměr 5,9, je to totéž. Pokud je bimodální, část lidí stránku dojezdí a my se díváme na průměr, který to schovává.

---

## Příloha: průchod nákupem (D4) a in-app (E1)

**Kroky (mobil, emulace):**

1. Klik `#hero-cta` → 1 tap, hash `#terminy`, 0 dalších obrazovek ručního scrollu (native smooth jump na Y=2865). Funguje i bez JS (`<a href="#terminy">`).
2. Sekce termínů: 3 karty, tlačítko „Koupit vstupenku“ → `buy.stripe.com/…` **`target="_blank"`**.
3. Formulář lekce na stránce není (checkout je Stripe). Waitlist modal existuje; `body.overflow=hidden` jen když je otevřený (`ZajemceModal.tsx:47`).
4. Stripe URL z ad query: UTM + `client_reference_id` ano, **fbclid ne**. Hosted Checkout 200, title „Stripe Checkout“. Screenshot po `domcontentloaded` je skeleton (171 ms) — UI se nestihlo vykreslit. Platba neproběhla.
5. Návrat: kód počítá s `/workshop/dekujeme/<id>` + pixel Purchase. Neověřeno live.

**Cesta k platbě:** 2 kliky (CTA → Koupit) + Stripe pole. Termíny = 4. obrazovka, pokud někdo nescrolluje ručně.

**FB/IG UA:** layout stejný, `localStorage` i cookie `cv_attr` fungují v Chrome s FB UA. Scroll stejně nativní. Žádná extra lišta v emulaci. Reálný FB chrome (nativní lišta „Otevřít v Safari“) **neemulovatelný**.

**Hydratace (D3):** žádný mismatch v konzoli. CTA je odkaz, stránka není mrtvá bez JS. Interaktivita karuselu potřebuje JS; bez JS zůstane první citace.

**H1 mezery:** aktuální produkce má tři block spany, mezery v `innerText` jsou. Screenshoty to potvrzují. Tvrzení „Z KORPORÁTUK PRÁCI“ na dnešním HTML neplatí.

**Písmo:** tělo 16 px; cena pod CTA 13 px (nález); štítky 11 px. Kontrast H1 bílá na navy overlay ~12,9:1. `gold-500` `#BF933A` na bílé ~2,82:1 (fail AA, štítky používají `gold-700` `#825a22` — v CSS komentáři 6,6:1).

---

*Konec reportu. Kód aplikace beze změny.*
