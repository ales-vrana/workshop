# Facebook API — jak napojit Workshop Engine

Samostatný checklist. Engine **čte** kampaně (spend, CTR, frequency). Nahrávat reklamy z kódu zatím umět nemusí.

Pixel už na webu je (`884397061610419`). **Nezakládej druhý pixel.**

---

## 1. Appka v Meta Developers

1. Jdi na [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**.
2. Typ: **Business**.
3. Název třeba `CoachVille Workshop Engine`.
4. V appce přidej produkt **Marketing API**.

## 2. Propojení s Business Managerem

1. [business.facebook.com](https://business.facebook.com) → **Nastavení firmy** → **Účty** → **Aplikace**.
2. Přidej appku z kroku 1.
3. Stejně ji přiřaď k **reklamnímu účtu**, ze kterého se točí workshop (ne k osobnímu účtu).

## 3. System User a token (to Engine opravdu potřebuje)

Token z Graph Exploreru vyprší. Pro produkci:

1. BM → **Uživatelé** → **Systémoví uživatelé** → vytvoř `workshop-engine` (role Admin nebo Employee).
2. Přiřaď mu reklamní účet s oprávněním **View performance** (MVP stačí čtení: `ads_read`).
3. Generate token:
   - App = Workshop Engine
   - Scope: `ads_read`
4. Token zkopíruj **jednou** a ulož mimo git.

Až budeme posílat Conversion API, přidáme `ads_management` — teď ne.

## 4. Env na Vercel

V projektu landing page (Settings → Environment Variables):

```
FB_ACCESS_TOKEN=EAAB...
FB_AD_ACCOUNT_ID=act_123456789
```

Číslo účtu najdeš v Ads Manageru vlevo nahoře (Account ID). Prefix `act_` Engine doplní, když chybí.

Redeploy. V `/workshop/engine` sekce Facebook buď vypíše tabulku, nebo chybovou hlášku z Graph API (chybějící role, vypršelý token, app v development mode).

**Filtr:** Engine bere jen kampaně / ad sety / reklamy, které mají v názvu slovo `workshop` (bez ohledu na velikost písmen). Webináře a ostatní účty se neschovávají omylem — jsou schované záměrně.

## 5. Development mode vs Live

Nová appka je v režimu Development: token vidí jen data adminů appky.  
Pro ostrý reklamní účet:

- buď appku přepni na **Live** (může chtít ověření firmy),
- nebo System User a token z Business Manageru (ten obvykle vidí firemní ad account i bez Live).

Když Engine napíše `(#200) Missing permission`, chybí přiřazení účtu k system userovi, ne kód.

## 6. URL v každé reklamě (povinné, jinak nepáruje)

Destination URL:

```
https://poznej.coachville.eu/workshop?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.name}}
```

`utm_content={{ad.id}}` je spojka mezi Ads Managerem a tabulkou Kreativy. Používej **id**, ne název.

URL parameters v Ads Manageru: Build a URL parameter → UTM. Dynamické tokeny `{{ad.id}}` fungují u Facebooku; ověř jedním testovacím klikem, že na landing dojde `?utm_content=1203…`.

## 7. Events Manager — co má pixel posílat

Na webu teď:

| Event | Kdy |
|---|---|
| PageView | každé načtení |
| ViewContent | hned po PageView (hero) |
| InitiateCheckout | klik na Stripe „Koupit vstupenku“ |
| Lead | odeslaný waitlist |
| Purchase | thank-you po Stripe |

V Events Manageru u pixelu `884397061610419` ověř, že eventy přitékají (Test events + skutečný klik).

Aggregated Event Measurement (iOS): priorita

1. Purchase  
2. InitiateCheckout  
3. Lead  
4. ViewContent  

**Teď kampaň nepřepínej na Purchase.** Nula nákupů = Meta nemá co učit.  
Jakmile v Engine vidíš InitiateCheckout:

1. Ads Manager → kampaň workshopu  
2. Objective **Sales** (Conversions)  
3. Optimalizace na **InitiateCheckout**  
4. Cílení zatím neměň každý den; jedna kampaň, kreativa jako jediná proměnná  

Purchase až po zhruba 50 nákupech.

## 8. Cursor MCP (volitelné, později)

Engine **nepotřebuje** MCP — volá Graph API sám.  
Až budeš chtít, aby Cloud Agent četl kampaně v chatu, přidej Facebook MCP se **stejným** `ads_read` tokenem. Není to podmínka MVP.

## 9. Co zatím nedělat

- Druhý pixel
- Optimalizace na Landing Page Views, jakmile teče InitiateCheckout
- Pět A/B testů cílení najednou
- Lookalike, dokud není ~50 nákupů
- Generování kreativ z Engine

## 10. Rychlý test, že to žije

1. Env uložené, redeploy.  
2. `/workshop/engine` → Facebook: tabulka nebo srozumitelná chyba.  
3. Testovací klik z Ads Manageru (Preview) s UTM.  
4. Engine → Kreativy: nový řádek s `utm_content` = ad id.  
5. Klik „Koupit vstupenku“ (checkout můžeš zrušit) → Funnel: Checkout +1, Events Manager: InitiateCheckout.
