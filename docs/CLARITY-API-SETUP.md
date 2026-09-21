# Microsoft Clarity — jak napojit Workshop Engine

Nahrávky na landing page **už běží** (projekt `ykej9fbehc`). Engine je jen čte. Druhý projekt v Clarity nezakládej.

Data Export API má **max 10 požadavků denně** na projekt. Engine si výsledek cachuje na 6 hodin.

---

## 1. Token v Clarity

Musíš být **admin** projektu.

1. Otevři [Clarity projekt ykej9fbehc](https://clarity.microsoft.com/projects/view/ykej9fbehc).
2. **Settings** → **Data Export** → **Generate new API token**.
3. Název např. `workshop-engine` (4–32 znaků, bez mezer: písmena, čísla, `-` `_` `.`).
4. Token zkopíruj **jednou**. Sem do chatu ho neposílej.

## 2. Env na Vercel

Settings → Environment Variables:

```
CLARITY_API_TOKEN=...tvůj token...
```

Zaškrtni **Preview** i **Production** (stejně jako u `ENGINE_PASSWORD`).  
Žádné `NEXT_PUBLIC_…` — token musí zůstat na serveru.

**Redeploy** preview větve `cursor/workshop-engine-mvp-b15d`.

## 3. Co uvidíš v Engine

Sekce Clarity ukáže souhrn za poslední 1–3 dny (sessions, bounce signály podle toho, co API vrátí) + pořád tlačítko do nahrávek.

Když token chybí, zůstane návod a tlačítko **Otevřít Clarity**.

## 4. Co v nahrávkách sledovat ručně

Filtr custom tagů, které Engine posílá z landingu:

- `utm_content` = id Facebook reklamy
- `utm_campaign`
- `visitor_id`

Sleduj: prvních 10 s, rage click u ceny, odchod před sekcí Termíny.

## 5. Limit

Při chybě 429 Engine napíše, že je vyčerpaný denní limit. Stačí počkat; nahrávky v Clarity dál fungují.
