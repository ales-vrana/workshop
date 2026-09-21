# Microsoft Clarity — jak napojit Workshop Engine

Nahrávky na landing page **už běží** (projekt `ykej9fbehc`). Engine je jen čte. Druhý projekt v Clarity nezakládej.

Data Export API má **max 10 požadavků denně** na projekt. Engine si výsledek cachuje na 3 hodiny.

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

Zaškrtni **Preview** i **Production**.  
Žádné `NEXT_PUBLIC_…` — token musí zůstat na serveru.

**Redeploy** Production (`main`).

## 3. Co uvidíš v Engine

Ne počet nahrávek. Engine z Data Export API spočítá signály (scroll, čas, rage/dead click, quickback, boti) a z nich složí **zjištění + další krok** v sekci Clarity i v Doporučeních.

Příklady:

- rychlý odchod → nesedí slib reklamy s H1
- mělký scroll → termíny a 199 Kč musí jít výš
- rage click → rozbité / falešné tlačítko Koupit

Nahrávky v Clarity zůstávají jako záloha. Ručně je procházet nemusíš.

Když token chybí, zůstane návod a tlačítko **Otevřít nahrávky v Clarity**.

## 4. Limit

Při chybě 429 Engine napíše, že je vyčerpaný denní limit. Stačí počkat; nahrávky v Clarity dál fungují.
