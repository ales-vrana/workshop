/**
 * Vlna 1 acceptance checks against local production server.
 */
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const OUT = "/workspace/audit/vlna1";
const URL = process.env.AUDIT_URL || "http://127.0.0.1:3100/workshop";
const CHROME = "/usr/local/bin/google-chrome";
const VIEWPORTS = [
  { name: "iphone14", width: 390, height: 844, isMobile: true },
  { name: "iphoneSE", width: 375, height: 667, isMobile: true },
  { name: "android", width: 360, height: 800, isMobile: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];

function contrast(hexBg, fg = [255, 255, 255]) {
  const h = hexBg.replace("#", "");
  const bg = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = (c) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const L1 = lum(fg);
  const L2 = lum(bg);
  const a = Math.max(L1, L2);
  const b = Math.min(L1, L2);
  return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--hide-scrollbars"],
  });
  const results = {};
  const consoles = {};

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    const logs = [];
    page.on("pageerror", (e) => logs.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") logs.push(m.text());
    });
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    await page.evaluateOnNewDocument(() => {
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.scrollBehavior = "auto";
      });
    });
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("#hero-cta");
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 400));

    const m = await page.evaluate(() => {
      const hero = document.querySelector("header");
      const next = hero.nextElementSibling;
      const cta = document.querySelector("#hero-cta");
      const t = document.querySelector("#terminy");
      const h = hero.getBoundingClientRect();
      const n = next.getBoundingClientRect();
      const c = cta.getBoundingClientRect();
      const cs = getComputedStyle(cta);
      const parseRgb = (s) => {
        const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
      };
      return {
        innerHeight: innerHeight,
        scrollHeight: document.body.scrollHeight,
        heroHeight: h.height,
        heroVhRatio: h.height / innerHeight,
        nextTop: n.top,
        nextId: next.id,
        nextPeeksPx: Math.max(0, innerHeight - n.top),
        ctaTop: c.top,
        ctaBottom: c.bottom,
        ctaFullyVisible: c.bottom <= innerHeight && c.top >= 0,
        ctaText: cta.textContent.replace(/\s+/g, " ").trim(),
        ctaColor: cs.color,
        ctaBg: cs.backgroundColor,
        ctaTracking: cs.letterSpacing,
        ctaWhiteSpace: cs.whiteSpace,
        ctaWidth: c.width,
        terminyTop: t.getBoundingClientRect().top + scrollY,
        terminyScreen: (t.getBoundingClientRect().top + scrollY) / innerHeight,
        screens: document.body.scrollHeight / innerHeight,
        secondaryLink: !!document.querySelector('a[href="#co-zazijete"]'),
        upwardAnchors: [...document.querySelectorAll('a[href="#terminy"]')].filter((a) => {
          const pos = getComputedStyle(a.closest("[class*='sticky-cta']") || a).position;
          if (pos === "fixed") return false;
          return a.getBoundingClientRect().top + scrollY > t.getBoundingClientRect().top + scrollY;
        }).length,
        heroIntervals: (() => {
          // no public API; check hero DOM for carousel controls
          return {
            carouselButtons: !!document.querySelector('header button[aria-label="Další reference"]'),
            quoteCount: document.querySelectorAll("header figure").length,
          };
        })(),
      };
    });

    await page.screenshot({ path: join(OUT, `${vp.name}-after.png`), fullPage: false });

    // sticky at 150
    await page.evaluate(() => window.scrollTo(0, 150));
    await new Promise((r) => setTimeout(r, 250));
    const stickyAt150 = await page.evaluate(() => {
      const shown = [...document.querySelectorAll(".sticky-cta, .sticky-cta-desktop")].filter((el) => {
        const s = getComputedStyle(el);
        return el.classList.contains("visible") && s.display !== "none";
      });
      return {
        scrollY: window.scrollY,
        visibleCount: shown.length,
        ariaHidden: shown[0]?.getAttribute("aria-hidden") ?? null,
      };
    });

    // scroll to terminy
    await page.evaluate(() => {
      document.getElementById("terminy")?.scrollIntoView({ block: "center" });
    });
    await new Promise((r) => setTimeout(r, 300));
    const stickyAtTerminy = await page.evaluate(() => {
      const shown = [...document.querySelectorAll(".sticky-cta, .sticky-cta-desktop")].filter((el) => {
        const s = getComputedStyle(el);
        return el.classList.contains("visible") && s.display !== "none";
      });
      const t = document.getElementById("terminy").getBoundingClientRect();
      return {
        visibleCount: shown.length,
        terminyTop: t.top,
        terminyVisible: t.top < innerHeight && t.bottom > 0,
      };
    });

    consoles[vp.name] = logs;
    results[vp.name] = { ...m, stickyAt150, stickyAtTerminy, consoleErrors: logs };
    await page.close();
  }

  // no-js CTA
  {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    results.noJs = await page.evaluate(() => {
      const a = document.querySelector("#hero-cta");
      return { tag: a?.tagName, href: a?.getAttribute("href"), text: a?.textContent.replace(/\s+/g, " ").trim() };
    });
    await page.close();
  }

  await browser.close();

  const ctaContrast = contrast("#1E7E34");
  const out = { url: URL, ctaContrastWhiteOn1E7E34: ctaContrast, results };
  await writeFile(join(OUT, "acceptance.json"), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
