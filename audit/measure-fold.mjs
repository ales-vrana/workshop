import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "screenshots");
const LANDING = "https://poznej.coachville.eu/workshop";
const CHROME = "/usr/local/bin/google-chrome";
const VIEWPORTS = [
  { name: "iphone14", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "iphoneSE", width: 375, height: 667, isMobile: true, hasTouch: true },
  { name: "android", width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false },
];
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 562.5,
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const extra = {};
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--hide-scrollbars"],
  });

  const fold = {};
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setUserAgent(vp.isMobile ? UA_MOBILE : UA_DESKTOP);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    await page.evaluateOnNewDocument(() => {
      const apply = () => {
        document.documentElement.style.scrollBehavior = "auto";
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    });
    await page.goto(LANDING, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("#hero-cta", { timeout: 30000 });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.evaluate(() => window.scrollTo(0, 0));
    const data = await page.evaluate(() => {
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return {
          text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 160),
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          width: r.width,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          textTransform: s.textTransform,
          visible: r.top < window.innerHeight && r.bottom > 0,
          fully: r.top >= 0 && r.bottom <= window.innerHeight,
          pxBelowFold: Math.max(0, r.top - window.innerHeight),
          pxCut: Math.max(0, r.bottom - window.innerHeight),
        };
      };
      const h1inner = document.querySelector("h1 span.h-display, h1 span.block, h1 span");
      const price = document.querySelector("#hero-cta")?.parentElement?.querySelector("p");
      const header = document.querySelector("header");
      const next = document.querySelector("#co-zazijete");
      const terminy = document.querySelector("#terminy");
      return {
        scrollY: window.scrollY,
        innerHeight: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        h1: box(document.querySelector("h1")),
        h1inner: box(h1inner),
        h1HTML: document.querySelector("h1")?.innerHTML?.slice(0, 500),
        cta: box(document.querySelector("#hero-cta")),
        price: box(price),
        header: box(header),
        next: box(next),
        terminy: box(terminy),
        nextPeeks: next ? next.getBoundingClientRect().top < window.innerHeight : false,
        headerIs100vh: header ? Math.abs(header.getBoundingClientRect().height - window.innerHeight) < 8 : null,
        headerDvH: header ? header.getBoundingClientRect().height / window.innerHeight : null,
      };
    });

    await page.screenshot({ path: join(OUT, `${vp.name}-first-viewport.png`), fullPage: false });

    const scroll = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      let windowCount = 0;
      const onScroll = () => windowCount++;
      window.addEventListener("scroll", onScroll, { passive: true });
      const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      window.scrollTo(0, max);
      await new Promise((r) => setTimeout(r, 50));
      const y = window.scrollY;
      window.removeEventListener("scroll", onScroll);
      window.scrollTo(0, 0);
      return { y, max, windowCount, reachedEnd: Math.abs(y - max) < 2 };
    });

    fold[vp.name] = { ...data, scrollInstant: scroll, firstScreenOnlyPct: (data.innerHeight / data.scrollHeight) * 100 };
    await page.close();
  }

  // Fresh browser context, cache disabled, Fast 3G LCP
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setCacheEnabled(false);
  await page.setUserAgent(UA_MOBILE);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const client = await page.target().createCDPSession();
  await client.send("Network.emulateNetworkConditions", FAST_3G);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.evaluateOnNewDocument(() => {
    window.__lcp = null;
    new PerformanceObserver((list) => {
      const e = list.getEntries().at(-1);
      if (!e) return;
      window.__lcp = {
        time: e.startTime,
        size: e.size,
        url: e.url || null,
        tag: e.element?.tagName || null,
        className: String(e.element?.className || "").slice(0, 160),
        text: (e.element?.innerText || "").slice(0, 80),
        loading: e.element?.getAttribute?.("loading"),
      };
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const t0 = Date.now();
  await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 12000));
  extra.fast3gUncached = {
    wallMs: Date.now() - t0,
    lcp: await page.evaluate(() => window.__lcp),
    ready: await page.evaluate(() => document.readyState),
  };
  await ctx.close();

  // Stripe checkout (stop at hosted page, do not pay)
  const page2 = await browser.newPage();
  await page2.setUserAgent(UA_MOBILE);
  await page2.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page2.goto(LANDING, { waitUntil: "networkidle2", timeout: 60000 });
  await page2.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page2.click("#hero-cta");
  await new Promise((r) => setTimeout(r, 400));
  extra.afterCta = await page2.evaluate(() => ({ hash: location.hash, y: window.scrollY, terminyTop: document.getElementById("terminy")?.getBoundingClientRect().top }));
  const stripeHref = await page2.evaluate(() => document.querySelector("a[data-engine-checkout]")?.href);
  extra.checkoutClicks = {
    heroToDates: 1,
    dateCards: await page2.evaluate(() => document.querySelectorAll("a[data-engine-checkout]").length),
    stripeHref,
  };
  if (stripeHref) {
    const tStripe = Date.now();
    const resp = await page2.goto(stripeHref, { waitUntil: "domcontentloaded", timeout: 60000 });
    extra.stripePage = {
      status: resp?.status(),
      finalUrl: page2.url(),
      title: await page2.title(),
      ms: Date.now() - tStripe,
      hasFbclid: new URL(stripeHref).searchParams.has("fbclid"),
      hasUtm: new URL(stripeHref).searchParams.has("utm_source"),
      hasClientRef: new URL(stripeHref).searchParams.has("client_reference_id"),
    };
    await page2.screenshot({ path: join(OUT, "iphone14-stripe-checkout.png"), fullPage: false });
  }
  await page2.close();

  // Waitlist modal overlap
  const page3 = await browser.newPage();
  await page3.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page3.setUserAgent(UA_MOBILE);
  await page3.goto(LANDING, { waitUntil: "networkidle2", timeout: 60000 });
  extra.rootIdentify = null;
  await page3.close();

  await browser.close();

  extra.rootHtml = await fetch("https://poznej.coachville.eu/").then(async (r) => {
    const t = await r.text();
    return {
      status: r.status,
      bytes: t.length,
      title: t.match(/<title>([^<]+)/)?.[1],
      generator: t.match(/clickfunnels|unbounce|leadpages|webflow|wordpress|next/i)?.[0],
      snippet: t.slice(0, 400),
    };
  });

  extra.clarityCount = await fetch(LANDING).then(async (r) => {
    const t = await r.text();
    return {
      ykej9fbehc: (t.match(/ykej9fbehc/g) || []).length,
      gtm: (t.match(/GTM-|googletagmanager/g) || []).length,
      cookiebot: (t.match(/cookiebot|cookieyes|onetrust/gi) || []).length,
      cspHeader: r.headers.get("content-security-policy"),
    };
  });

  extra.fold = fold;
  await writeFile(join(__dirname, "measurements-fold.json"), JSON.stringify(extra, null, 2));
  console.log(JSON.stringify({ fold: Object.fromEntries(Object.entries(fold).map(([k, v]) => [k, {
    h1: v.h1, h1inner: v.h1inner && { fontSize: v.h1inner.fontSize, fontWeight: v.h1inner.fontWeight, text: v.h1inner.text, letterSpacing: v.h1inner.letterSpacing, textTransform: v.h1inner.textTransform },
    cta: v.cta, price: v.price, headerH: v.header?.height, nextPeeks: v.nextPeeks, headerIs100vh: v.headerIs100vh, headerDvH: v.headerDvH,
    firstScreenOnlyPct: v.firstScreenOnlyPct, scrollInstant: v.scrollInstant, terminyTop: v.terminy?.top,
  }])), fast3g: extra.fast3gUncached, stripe: extra.stripePage, afterCta: extra.afterCta, root: extra.rootHtml, clarityCount: extra.clarityCount }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
