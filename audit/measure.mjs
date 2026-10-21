/**
 * Forensic landing-page measurements against production.
 * Read-only. Writes audit/screenshots/* and audit/measurements.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "screenshots");
const JSON_OUT = join(__dirname, "measurements.json");
const LANDING_URL = "https://poznej.coachville.eu/workshop";
const AD_URL =
  "https://poznej.coachville.eu/workshop?utm_source=facebook&utm_medium=paid&utm_campaign=test-audit&utm_content=ad123&utm_term=adset&fbclid=IwAR0AUDIT123";
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const VIEWPORTS = [
  // deviceScaleFactor=1: CSS pixels stay native device size; 3x full-page PNGs OOM in CI
  { name: "iphone14", width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  { name: "iphoneSE", width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  { name: "android", width: 360, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];

const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 562.5,
};

const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const UA_FB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21E219 [FBAN/FBIOS;FBAV/192.168.1.2.112;FBDV/iPhone14,7;FBMD/iPhone;FBSN/iOS;FBSV/17.4;FBSS/3;FBID/phone;FBLC/cs_CZ;FBOP/5]";
const UA_IG =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0.0.0 (iPhone14,7; iOS 17_4; cs_CZ; cs-cz; scale=3.00; 1170x2532; 123456789)";
const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

async function redirectChain(url) {
  const hops = [];
  let current = url;
  for (let i = 0; i < 8; i++) {
    const t0 = Date.now();
    const res = await fetch(current, { redirect: "manual", headers: { "User-Agent": UA_DESKTOP } });
    const ms = Date.now() - t0;
    const loc = res.headers.get("location");
    hops.push({
      url: current,
      status: res.status,
      ms,
      location: loc,
      csp: res.headers.get("content-security-policy"),
      xframe: res.headers.get("x-frame-options"),
      setCookie: res.headers.get("set-cookie"),
    });
    if (!loc || (res.status !== 301 && res.status !== 302 && res.status !== 307 && res.status !== 308)) break;
    current = new globalThis.URL(loc, current).toString();
  }
  return hops;
}

async function assetInfo(url) {
  const t0 = Date.now();
  const res = await fetch(url, { headers: { "User-Agent": UA_DESKTOP } });
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    url,
    status: res.status,
    bytes: buf.length,
    contentType: res.headers.get("content-type"),
    ms: Date.now() - t0,
  };
}

function chromeArgs() {
  return [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--font-render-hinting=none",
    "--hide-scrollbars",
  ];
}

async function launch() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: chromeArgs(),
    defaultViewport: null,
  });
}

async function collectPageMetrics(page) {
  return page.evaluate(() => {
    const cs = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        overflow: s.overflow,
        overflowX: s.overflowX,
        overflowY: s.overflowY,
        height: s.height,
        maxHeight: s.maxHeight,
        position: s.position,
        transform: s.transform,
      };
    };

    const overflowCandidates = [];
    document.querySelectorAll("html, body, main, header, #__next, [class*='overflow'], [class*='h-screen'], [class*='h-dvh']").forEach((el) => {
      const s = getComputedStyle(el);
      overflowCandidates.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: String(el.className || "").slice(0, 180),
        overflow: s.overflow,
        overflowY: s.overflowY,
        height: s.height,
        maxHeight: s.maxHeight,
        position: s.position,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      });
    });

    const scrollers = [];
    document.querySelectorAll("*").forEach((el) => {
      const s = getComputedStyle(el);
      const oy = s.overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 4) {
        scrollers.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: String(el.className || "").slice(0, 180),
          overflowY: oy,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        });
      }
    });

    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
        visibleInViewport: r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth,
        fullyVisible: r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth,
        pxBelowFold: r.top > window.innerHeight ? r.top - window.innerHeight : 0,
        pxCutOff: r.bottom > window.innerHeight ? r.bottom - window.innerHeight : 0,
        fontSize: s.fontSize,
        color: s.color,
        backgroundColor: s.backgroundColor,
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute("href"),
        id: el.id,
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 200),
      };
    };

    const sections = [];
    const nodes = document.querySelectorAll("header, main > section, footer, [id='terminy'], [id='co-zazijete']");
    const seen = new Set();
    document.querySelectorAll("header, section, footer").forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const r = el.getBoundingClientRect();
      const topAbs = r.top + window.scrollY;
      sections.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: String(el.className || "").slice(0, 120),
        heading: (el.querySelector("h1,h2,h3")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 120),
        height: Math.round(r.height),
        top: Math.round(topAbs),
        screens: r.height / window.innerHeight,
        startsAtScreen: topAbs / window.innerHeight,
      });
    });

    const clickables = [];
    document.querySelectorAll("a, button, [role='button'], input, select, textarea, [onclick]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return;
      clickables.push({
        order: i,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim().slice(0, 80),
        href: el.getAttribute("href"),
        type: el.getAttribute("type"),
        width: Math.round(r.width),
        height: Math.round(r.height),
        top: Math.round(r.top + window.scrollY),
        tapOk: r.width >= 44 && r.height >= 44,
        ariaHidden: el.getAttribute("aria-hidden"),
      });
    });

    const overlays = [];
    document.querySelectorAll("*").forEach((el) => {
      const s = getComputedStyle(el);
      if (s.position !== "fixed" && s.position !== "sticky") return;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      overlays.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: String(el.className || "").slice(0, 120),
        position: s.position,
        zIndex: s.zIndex,
        top: r.top,
        bottom: r.bottom,
        height: r.height,
        width: r.width,
        transform: s.transform,
        ariaHidden: el.getAttribute("aria-hidden"),
      });
    });

    const scripts = [...document.scripts].map((s) => ({
      src: s.src || null,
      async: s.async,
      defer: s.defer,
      id: s.id || null,
      inlinePreview: s.src ? null : (s.textContent || "").slice(0, 180),
    }));

    const thirdParty = [...document.querySelectorAll("script[src], link[href], img[src]")].map((el) => {
      const url = el.src || el.href;
      try {
        return { tag: el.tagName.toLowerCase(), host: new URL(url, location.href).host, url };
      } catch {
        return { tag: el.tagName.toLowerCase(), host: null, url };
      }
    });

    const cmpSelectors = [
      "#onetrust-banner-sdk",
      ".cc-window",
      "#CybotCookiebotDialog",
      ".cky-consent-container",
      "[id*='cookie']",
      "[class*='cookie']",
      "[class*='consent']",
      "[id*='consent']",
    ];
    const cmpHits = [];
    for (const sel of cmpSelectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        cmpHits.push({
          sel,
          id: el.id,
          className: String(el.className || "").slice(0, 120),
          text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 120),
          width: r.width,
          height: r.height,
          visible: r.width > 0 && r.height > 0 && getComputedStyle(el).display !== "none",
        });
      });
    }

    const fonts = [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      status: f.status,
    }));

    const bodyP = document.querySelector("main p, section p");
    const bodyStyle = bodyP ? getComputedStyle(bodyP) : null;

    const h1 = document.querySelector("h1");
    const h1Text = h1 ? h1.innerText : null;
    const h1Html = h1 ? h1.innerHTML : null;

    const images = [...document.querySelectorAll("header img, .hero img, img")].slice(0, 20).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      loading: img.getAttribute("loading"),
      fetchPriority: img.getAttribute("fetchpriority") || img.getAttribute("fetchPriority"),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.getBoundingClientRect().width,
      displayHeight: img.getBoundingClientRect().height,
      inHeader: Boolean(img.closest("header")),
    }));

    const videos = [...document.querySelectorAll("video")].map((v) => ({
      src: v.currentSrc,
      autoplay: v.autoplay,
      muted: v.muted,
    }));

    const clarityFns = typeof window.clarity;
    const fbqFns = typeof window.fbq;
    const dataLayer = typeof window.dataLayer;
    const gtag = typeof window.gtag;

    const contrastSample = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return { color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight };
    };

    return {
      href: location.href,
      title: document.title,
      readyState: document.readyState,
      windowScrollY: window.scrollY,
      windowScrollX: window.scrollX,
      pageYOffset: window.pageYOffset,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      clientHeight: document.documentElement.clientHeight,
      bodyScrollHeight: document.body.scrollHeight,
      docScrollHeight: document.documentElement.scrollHeight,
      bodyClientHeight: document.body.clientHeight,
      html: cs(document.documentElement),
      body: cs(document.body),
      main: cs(document.querySelector("main")),
      overflowCandidates,
      innerScrollers: scrollers,
      heroCta: rect("#hero-cta"),
      priceNearCta: rect("#hero-cta + p, #hero-cta ~ p"),
      h1: rect("h1"),
      h1Text,
      h1Html,
      terminy: rect("#terminy"),
      coZazijete: rect("#co-zazijete"),
      sections,
      clickables,
      overlays,
      scripts,
      thirdPartyHosts: [...new Set(thirdParty.map((t) => t.host).filter(Boolean))],
      cmpHits,
      fonts,
      bodyText: bodyStyle
        ? { fontSize: bodyStyle.fontSize, color: bodyStyle.color, lineHeight: bodyStyle.lineHeight }
        : null,
      h1Style: contrastSample(h1),
      images,
      videos,
      shadowRoots: [...document.querySelectorAll("*")].filter((e) => e.shadowRoot).map((e) => e.tagName),
      canvas: document.querySelectorAll("canvas").length,
      clarityType: clarityFns,
      fbqType: fbqFns,
      dataLayerType: dataLayer,
      gtagType: gtag,
      clarityProjectFromSnippet: [...document.scripts]
        .map((s) => s.textContent || "")
        .join("\n")
        .match(/clarity\.ms\/tag\/([a-z0-9]+)/)?.[1] || null,
      pixelIdFromSnippet: [...document.scripts]
        .map((s) => s.textContent || "")
        .join("\n")
        .match(/fbq\('init',\s*'(\d+)'\)/)?.[1] || null,
      cookieBannerText: document.body.innerText.match(/cookie|souhlas|gdpr/i)?.[0] || null,
      hasLenis: Boolean(window.Lenis || window.lenis),
      hasLocomotive: Boolean(window.LocomotiveScroll),
      hasGsap: Boolean(window.gsap),
      stickyCtaClass: document.querySelector(".sticky-cta")?.className || null,
      cookies: document.cookie,
    };
  });
}

async function measureScroll(page) {
  await page.evaluate(() => {
    window.__auditScroll = { window: 0, document: 0, body: 0, y: [] };
    window.addEventListener(
      "scroll",
      () => {
        window.__auditScroll.window += 1;
        window.__auditScroll.y.push(window.scrollY);
      },
      { passive: true },
    );
    document.addEventListener(
      "scroll",
      () => {
        window.__auditScroll.document += 1;
      },
      { passive: true, capture: true },
    );
    document.body.addEventListener(
      "scroll",
      () => {
        window.__auditScroll.body += 1;
      },
      { passive: true },
    );
  });

  const before = await page.evaluate(() => ({
    y: window.scrollY,
    bodyOverflow: getComputedStyle(document.body).overflowY,
    htmlOverflow: getComputedStyle(document.documentElement).overflowY,
  }));

  await page.evaluate(async () => {
    const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const step = Math.max(80, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, max);
    await new Promise((r) => setTimeout(r, 300));
  });

  const after = await page.evaluate(() => ({
    y: window.scrollY,
    maxY: Math.max(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight),
    counts: window.__auditScroll,
    docElScrollTop: document.documentElement.scrollTop,
    bodyScrollTop: document.body.scrollTop,
  }));

  await page.evaluate(() => window.scrollTo(0, 0));
  return { before, after };
}

async function waitSettled(page, extraMs = 1200) {
  await page.waitForSelector("h1", { timeout: 30000 });
  await page.waitForFunction(() => document.readyState === "complete", { timeout: 30000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, extraMs));
}

async function screenshotFirstAndFull(page, name) {
  const first = join(OUT_DIR, `${name}-first-viewport.png`);
  const full = join(OUT_DIR, `${name}-fullpage.png`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: first, fullPage: false });
  await page.screenshot({ path: full, fullPage: true, captureBeyondViewport: true });
  return { firstViewport: `audit/screenshots/${name}-first-viewport.png`, fullPage: `audit/screenshots/${name}-fullpage.png` };
}

async function setupPage(page, vp, { ua, throttle, extraHeaders } = {}) {
  const userAgent = ua || (vp.isMobile ? UA_MOBILE : UA_DESKTOP);
  await page.setUserAgent(userAgent);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
  });
  if (extraHeaders) await page.setExtraHTTPHeaders(extraHeaders);
  page.setDefaultTimeout(45000);
  if (throttle) {
    const client = await page.target().createCDPSession();
    await client.send("Network.emulateNetworkConditions", throttle);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    return client;
  }
  return null;
}

async function lcpObserver(page) {
  await page.evaluateOnNewDocument(() => {
    window.__auditPerf = { lcp: null, lcpStart: performance.now(), navStart: performance.timing?.navigationStart };
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      const el = last.element;
      window.__auditPerf.lcp = {
        time: last.startTime,
        size: last.size,
        url: last.url || null,
        tag: el ? el.tagName : null,
        id: el ? el.id : null,
        className: el ? String(el.className || "").slice(0, 120) : null,
        src: el && "currentSrc" in el ? el.currentSrc : null,
        loading: el ? el.getAttribute?.("loading") : null,
      };
    }).observe({ type: "largest-contentful-paint", buffered: true });
    window.addEventListener("error", (e) => {
      (window.__auditErrors ||= []).push({ type: "error", msg: e.message, src: e.filename, line: e.lineno });
    });
    window.addEventListener("unhandledrejection", (e) => {
      (window.__auditErrors ||= []).push({ type: "rejection", msg: String(e.reason) });
    });
    const orig = console.error;
    console.error = (...args) => {
      (window.__auditErrors ||= []).push({ type: "console.error", msg: args.map(String).join(" ") });
      orig.apply(console, args);
    };
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const out = {
    generatedAt: new Date().toISOString(),
    productionUrl: LANDING_URL,
    adUrlTemplate: AD_URL,
  };

  const qs = "?utm_source=facebook&utm_medium=paid&utm_campaign=x&utm_content=1&utm_term=y&fbclid=abc";
  out.redirects = {
    workshop: await redirectChain(LANDING_URL),
    workshopSlash: await redirectChain(LANDING_URL + "/" + qs),
    workshopNoSlash: await redirectChain(LANDING_URL + qs),
    root: await redirectChain("https://poznej.coachville.eu/"),
    oldHost: await redirectChain("https://workshop.coachville.eu/").catch((e) => ({ error: String(e) })),
  };

  out.assets = {
    hero: await assetInfo("https://poznej.coachville.eu/workshop/hero.jpg"),
    portrait: await assetInfo("https://poznej.coachville.eu/workshop/ales-vrana-portrait.jpg"),
    badge: await assetInfo("https://poznej.coachville.eu/workshop/icf-mcc-badge.webp"),
    og: await assetInfo("https://poznej.coachville.eu/workshop/og-image.jpg"),
  };

  const browser = await launch();
  const consoleByVp = {};

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      const logs = [];
      page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
      page.on("pageerror", (err) => logs.push({ type: "pageerror", text: String(err) }));
      page.on("requestfailed", (req) =>
        logs.push({ type: "requestfailed", text: `${req.url()} ${req.failure()?.errorText}` }),
      );
      await lcpObserver(page);
      await setupPage(page, vp);
      const t0 = Date.now();
      await page.goto(AD_URL, { waitUntil: "networkidle2", timeout: 60000 });
      await waitSettled(page, 1800);
      const loadMs = Date.now() - t0;
      const metrics = await collectPageMetrics(page);
      const scroll = await measureScroll(page);
      // re-collect sections after scroll reset
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 250));
      const shots = await screenshotFirstAndFull(page, vp.name);

      // CTA click (native hash)
      let ctaClick = null;
      try {
        await page.click("#hero-cta");
        await new Promise((r) => setTimeout(r, 900));
        ctaClick = await page.evaluate(() => {
          const t = document.getElementById("terminy");
          const r = t?.getBoundingClientRect();
          return {
            hash: location.hash,
            scrollY: window.scrollY,
            terminyTop: r?.top ?? null,
            terminyVisible: r ? r.top < window.innerHeight && r.bottom > 0 : false,
          };
        });
      } catch (e) {
        ctaClick = { error: String(e) };
      }

      await page.evaluate(() => window.scrollTo(0, 0));

      const perf = await page.evaluate(() => ({
        lcp: window.__auditPerf?.lcp || null,
        errors: window.__auditErrors || [],
        ttfb: performance.timing ? performance.timing.responseStart - performance.timing.requestStart : null,
        domContentLoaded: performance.timing
          ? performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
          : null,
        loadEvent: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : null,
        resources: performance.getEntriesByType("resource").map((r) => ({
          name: r.name,
          initiator: r.initiatorType,
          duration: Math.round(r.duration),
          transferSize: r.transferSize,
          encoded: r.encodedBodySize,
        })),
      }));

      const stripeHref = await page.evaluate(() => {
        const a = document.querySelector("a[data-engine-checkout], a[href*='buy.stripe.com']");
        return a ? { href: a.href, text: a.innerText.trim() } : null;
      });

      consoleByVp[vp.name] = logs;
      out[vp.name] = {
        loadMs,
        metrics,
        scroll,
        shots,
        ctaClick,
        perf: {
          lcp: perf.lcp,
          errors: perf.errors,
          ttfb: perf.ttfb,
          domContentLoaded: perf.domContentLoaded,
          loadEvent: perf.loadEvent,
          resourceCount: perf.resources.length,
          transferBytes: perf.resources.reduce((s, r) => s + (r.transferSize || 0), 0),
          thirdParty: perf.resources.filter((r) => {
            try {
              return !new globalThis.URL(r.name).host.includes("coachville");
            } catch {
              return false;
            }
          }),
        },
        stripeHref,
        screens: metrics.docScrollHeight / metrics.innerHeight,
        firstScreenOnlyPct: (metrics.innerHeight / metrics.docScrollHeight) * 100,
      };
      await page.close();
    }

    // Fast 3G LCP on iPhone 14
    {
      const page = await browser.newPage();
      await lcpObserver(page);
      await setupPage(page, VIEWPORTS[0], { throttle: FAST_3G });
      const t0 = Date.now();
      await page.goto(LANDING_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
      await waitSettled(page, 8000);
      const lcp = await page.evaluate(() => window.__auditPerf?.lcp || null);
      const interactive = Date.now() - t0;
      const heroCta = await page.evaluate(() => {
        const el = document.querySelector("#hero-cta");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, visible: r.top < window.innerHeight, text: el.innerText };
      });
      out.fast3gIphone14 = { interactiveMs: interactive, lcp, heroCta };
      await page.close();
    }

    // JS disabled: CTA still an anchor?
    {
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(false);
      await setupPage(page, VIEWPORTS[0]);
      await page.goto(LANDING_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      out.noJs = await page.evaluate(() => {
        const a = document.querySelector("#hero-cta, a[href='#terminy']");
        const h1 = document.querySelector("h1");
        return {
          hasCta: Boolean(a),
          href: a?.getAttribute("href") || null,
          tag: a?.tagName || null,
          h1: h1?.innerText || null,
          hasClarityInline: /clarity\.ms\/tag/.test(document.documentElement.innerHTML),
        };
      });
      await page.screenshot({ path: join(OUT_DIR, "iphone14-nojs-first-viewport.png"), fullPage: false });
      await page.close();
    }

    // FB in-app UA
    {
      const page = await browser.newPage();
      const logs = [];
      page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
      page.on("pageerror", (err) => logs.push({ type: "pageerror", text: String(err) }));
      await lcpObserver(page);
      await setupPage(page, VIEWPORTS[0], { ua: UA_FB });
      await page.goto(AD_URL, { waitUntil: "networkidle2", timeout: 60000 });
      await waitSettled(page, 2000);
      const metrics = await collectPageMetrics(page);
      const scroll = await measureScroll(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: join(OUT_DIR, "iphone14-fb-inapp-first-viewport.png"), fullPage: false });
      let cta = null;
      try {
        await page.click("#hero-cta");
        await new Promise((r) => setTimeout(r, 800));
        cta = await page.evaluate(() => ({ hash: location.hash, y: window.scrollY }));
      } catch (e) {
        cta = { error: String(e) };
      }
      const lsOk = await page.evaluate(() => {
        try {
          localStorage.setItem("__audit", "1");
          const v = localStorage.getItem("__audit");
          document.cookie = "audit_cookie=1; Path=/; SameSite=Lax";
          return { localStorage: v === "1", cookie: document.cookie.includes("audit_cookie") || document.cookie.includes("cv_attr") };
        } catch (e) {
          return { localStorage: false, error: String(e) };
        }
      });
      out.fbInApp = {
        href: metrics.href,
        innerHeight: metrics.innerHeight,
        scrollHeight: metrics.docScrollHeight,
        windowScrollYAfterFullScroll: scroll.after.y,
        windowScrollEvents: scroll.after.counts.window,
        heroCta: metrics.heroCta,
        overlays: metrics.overlays,
        cookies: metrics.cookies,
        storage: lsOk,
        cta,
        cmpHits: metrics.cmpHits,
        console: logs.filter((l) => l.type === "error" || l.type === "pageerror"),
      };
      await page.close();
    }

    // Instagram UA
    {
      const page = await browser.newPage();
      await setupPage(page, VIEWPORTS[0], { ua: UA_IG });
      await page.goto(LANDING_URL, { waitUntil: "networkidle2", timeout: 60000 });
      await waitSettled(page, 1200);
      out.igInApp = await page.evaluate(() => ({
        href: location.href,
        h1: document.querySelector("h1")?.innerText,
        innerHeight: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
      }));
      await page.screenshot({ path: join(OUT_DIR, "iphone14-ig-inapp-first-viewport.png"), fullPage: false });
      await page.close();
    }

    // Contrast + large text
    {
      const page = await browser.newPage();
      await setupPage(page, VIEWPORTS[0]);
      await page.goto(LANDING_URL, { waitUntil: "networkidle2", timeout: 60000 });
      await waitSettled(page, 1000);
      out.largeText = await page.evaluate(() => {
        document.documentElement.style.fontSize = "24px";
        const h1 = document.querySelector("h1");
        const cta = document.querySelector("#hero-cta");
        return {
          h1: h1?.innerText,
          h1Overflow: h1 ? h1.scrollWidth > h1.clientWidth + 2 : null,
          ctaTop: cta?.getBoundingClientRect().top,
          ctaVisible: cta ? cta.getBoundingClientRect().top < window.innerHeight : null,
        };
      });
      await page.screenshot({ path: join(OUT_DIR, "iphone14-large-text-first-viewport.png"), fullPage: false });
      await page.close();
    }

    out.console = consoleByVp;

    // Stripe URL attribution (open href, don't pay)
    const stripe = out.iphone14?.stripeHref?.href;
    if (stripe) {
      const u = new URL(stripe);
      out.stripeParams = {
        href: stripe,
        client_reference_id: u.searchParams.get("client_reference_id"),
        utm_source: u.searchParams.get("utm_source"),
        utm_medium: u.searchParams.get("utm_medium"),
        utm_campaign: u.searchParams.get("utm_campaign"),
        utm_content: u.searchParams.get("utm_content"),
        fbclid: u.searchParams.get("fbclid"),
      };
    }
  } finally {
    await browser.close();
  }

  await writeFile(JSON_OUT, JSON.stringify(out, null, 2));
  console.log("Wrote", JSON_OUT);
  const vpSummary = VIEWPORTS.map((v) => {
    const d = out[v.name];
    return {
      name: v.name,
      innerHeight: d.metrics.innerHeight,
      scrollHeight: d.metrics.docScrollHeight,
      screens: d.screens,
      firstScreenOnlyPct: d.firstScreenOnlyPct,
      scrollYAfter: d.scroll.after.y,
      windowEvents: d.scroll.after.counts.window,
      ctaVisible: d.metrics.heroCta?.visibleInViewport,
      ctaTop: d.metrics.heroCta?.top,
    };
  });
  console.log(JSON.stringify({ verdictHint: vpSummary, fast3g: out.fast3gIphone14, redirects: out.redirects, stripe: out.stripeParams }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
