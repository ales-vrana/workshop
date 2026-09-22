# Workshop Engine — jak to číst a co vyplnit

Interní cockpit: **https://poznej.coachville.eu/workshop/engine**

Přihlášení HTTP Basic: `ENGINE_USER` (výchozí `engine`) + `ENGINE_PASSWORD`.

Landing se nemění. Engine jen měří a doporučuje.

---

## Proč to existuje

Reklamy teď umí přivést klik, ne nákup. Bez nákupů nemá smysl vybírat „vítěznou kreativu“. Engine má:

1. ukázat, kde v trychtýři lidé mizí,
2. párovat návštěvu s konkretní reklamou (UTM),
3. uložit waitlist, když termín nesedí,
4. zapsat skutečnou platbu ze Stripe,
5. navrhnout **jeden další krok** k první konverzi.

A/B headlineů je fáze 2. LTV studentů z výcviku je ještě později. Změny landing page měř přes **vlny** (sekvenční srovnání nové vs předchozí), ne mícháním celého funnelu.

---

## Env, které musíš doplnit

| Proměnná | Kdy | K čemu |
|---|---|---|
| `ENGINE_PASSWORD` | hned | vstup do cockpitu |
| `DATABASE_URL` | před produkcí | Neon Postgres (na Vercel povinné) |
| `STRIPE_SECRET_KEY` | před ostrými nákupy | ověření webhooku |
| `STRIPE_WEBHOOK_SECRET` | před ostrými nákupy | `checkout.session.completed` |
| `FB_ACCESS_TOKEN` | až bude appka | spend / CTR / frequency |
| `FB_AD_ACCOUNT_ID` | s tokenem | `act_…` |
| `CLARITY_API_TOKEN` | teď | zjištění z rage/scroll/odchodů v Engine, ne ruční nahrávky |

Šablona: `.env.example`.

Lokálně bez Neon Engine ukládá do `.data/engine.json`. Na Vercel soubor nepřežije.

---

## UTM šablona do každé Facebook reklamy

```
https://poznej.coachville.eu/workshop?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.name}}
```

- `utm_content` = id reklamy. Bez toho nejde sloučit Ads API a landing.
- První i poslední UTM drží cookie `cv_attr` 90 dní.
- Stejné UTM se přidají na Stripe Payment Link (`client_reference_id` = visitor id).

---

## Stripe webhook

Endpoint (pozor na `basePath` `/workshop`):

```
https://poznej.coachville.eu/workshop/api/stripe/webhook
```

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.  
2. Event: `checkout.session.completed`.  
3. Signing secret → `STRIPE_WEBHOOK_SECRET`.  
4. `STRIPE_SECRET_KEY` (secret, ne publishable).

Po zaplacení Stripe redirect na `/workshop/dekujeme/<id-terminu>` pořád posílá pixel Purchase. **Pravda pro Engine je webhook**, ne pixel.

Test: Stripe CLI `stripe listen --forward-to localhost:3000/workshop/api/stripe/webhook` nebo klik v Dashboardu.

---

## Waitlist

Tlačítko **Nevyhovuje mi žádný termín** ukládá jméno + e-mail do Engine.  
Potvrzení je na stránce. Hromadný e-mail o novém termínu posíláš ručně (kopírovat e-maily / CSV).

Meta dostane event **Lead**.

---

## Jak číst karty

**Funnel** — unique visitors na kroku. **Zobrazit termíny** = klik na hero CTA (bez konkrétního data). Když je nízko, problém je textace hero, ne nabídka termínů.

**Kreativy** — dokud purchases = 0, řadí se podle checkoutu a waitlistu. Řádek `(bez UTM)` = organika, přímá, nebo reklama bez parametrů.

**Doporučení** — pravidla z funnelu, UTM a z Clarity (rage click, scroll, quickback). Nejsou to automatické úpravy webu.

**Clarity** — Engine data analyzuje a vypíše zjištění + další krok. Nahrávky nemusíš procházet. Token: [CLARITY-API-SETUP.md](CLARITY-API-SETUP.md).

**Facebook** — prázdné, dokud není token. Pak spend a frequency, ať jedna kreativa nejede do únavy.

**Hypotézy** — seznam, co testuješ. Žádný automatický A/B.

**Vlny** — po každé změně landing page zadáš název + datum a čas startu. Engine od té chvíle měří novou variantu zvlášť a srovná ji s předchozí ve **stejné délce od startu** (kusy i %). Není to souběžný A/B split. Funnel níže zůstává smíchaný za celé období.

---

## Facebook cold traffic (provozní pravidla)

- Jedna kampaň, jeden offer (199 Kč / 2 h). Měň **kreativu**, ne pět věcí najednou.
- Text reklamy musí slíbit totéž co H1 / podtitulek.
- Jakmile teče InitiateCheckout, vypni optimalizaci na zobrazení stránky.
- Lookalike až po ~50 nákupech.

Podrobný setup API: [FACEBOOK-API-SETUP.md](FACEBOOK-API-SETUP.md).

---

## Kritérium, že MVP žije

1. V Engine je cesta reklama → návštěva → checkout nebo waitlist.  
2. Waitlist jde vyexportovat.  
3. Testovací Stripe platba zapíše nákup s `utm_content`.  
4. Funnel + doporučení jsou čitelná.  
5. Events Manager vidí InitiateCheckout a Lead.
