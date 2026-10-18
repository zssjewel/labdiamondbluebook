// 發佈前檢查：橫向溢出、破圖、手機目錄摺疊、每頁 SEO 狀態、sitemap、404。
// 用法：node scripts/check.cjs http://localhost:8080 > check.txt
const { chromium } = require("playwright");

const base = process.argv[2] || "http://localhost:8080";
const pages = [
  "/zh-hk.html",
  "/zh-hk/price.html",
  "/zh-hk/certificate.html",
  "/zh-hk/custom.html",
  "/zh-hk/about.html",
  "/zh-hk/cases.html",
  "/zh-hk/basics/vs-natural-moissanite.html",
  "/zh-hk/4c/carat-size-on-hand.html",
];
const widths = [320, 390, 768, 1440];

(async () => {
  const browser = await chromium.launch();
  console.log("== 每頁 SEO 狀態（本地構建）==");
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  const inMap = (p) => sitemap.includes(p.replace(/\.html$/, "").replace("/zh-hk.html", "/zh-hk"));
  for (const p of pages) {
    const page = await browser.newPage();
    const res = await page.goto(base + p, { waitUntil: "load" });
    const info = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content || "",
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      robots: document.querySelector('meta[name="robots"]')?.content || "(無)",
      h1: document.querySelectorAll("h1").length,
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
        try { return JSON.parse(s.textContent)["@type"]; } catch { return "解析失敗"; }
      }),
      draft: !!document.querySelector(".bb-draft"),
    }));
    const path = p.replace(/\.html$/, "");
    console.log(`${path} | HTTP ${res.status()} | title「${info.title}」 | description ${info.desc.length} 字 | canonical ${info.canonical.replace(/^https?:\/\/[^/]+/, "")} | robots ${info.robots} | H1×${info.h1} | JSON-LD ${info.ld.join("、") || "無"} | 初稿 ${info.draft ? "是" : "否"} | sitemap ${inMap(path) ? "有" : "冇"}`);
    await page.close();
  }
  const nf = await browser.newPage();
  const r404 = await nf.goto(base + "/zh-hk/__not_found_check", { waitUntil: "load" });
  console.log(`/zh-hk/__not_found_check | HTTP ${r404.status()}（本地靜態伺服器；正式網站要另外喺 Cloudflare 複測）`);
  await nf.close();
  const rob = await (await fetch(base + "/robots.txt")).text();
  console.log("robots.txt:", rob.replace(/\n/g, " / "));
  console.log("sitemap 網址：", (sitemap.match(/<loc>[^<]+<\/loc>/g) || []).map((x) => x.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, "")).join("、"));

  console.log("\n== 版面：橫向溢出、破圖 ==");
  for (const w of widths) {
    for (const p of pages) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 800 ? 3 : 1 });
      const page = await ctx.newPage();
      await page.goto(base + p, { waitUntil: "load" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      });
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => {
        const over = document.documentElement.scrollWidth - window.innerWidth;
        const imgs = [...document.images];
        const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"));
        const picked = imgs.filter((i) => i.currentSrc && /-(480|800)\.webp$/.test(i.currentSrc)).length;
        return { over, n: imgs.length, broken, picked };
      });
      const flag = r.over > 1 ? `⚠ 橫向溢出 ${r.over}px` : "冇溢出";
      console.log(`${w}px ${p.replace(/\.html$/, "")}：${flag}，圖 ${r.n} 張，破圖 ${r.broken.length}${r.broken.length ? "（" + r.broken.join("、") + "）" : ""}，用咗細圖 ${r.picked} 張`);
      await ctx.close();
    }
  }

  console.log("\n== 手機文章：首屏順序、目錄摺疊 ==");
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + "/zh-hk/basics/vs-natural-moissanite.html", { waitUntil: "load" });
  const order = await page.evaluate(() => {
    const top = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height ? Math.round(r.top + scrollY) : "隱藏"; };
    return { h1: top("h1"), lead: top(".bb-page__lead"), meta: top(".bb-metaline"), toc: top(".bb-tocfold"), prose: top(".bb-prose") };
  });
  console.log(`H1 ${order.h1}px，結論 ${order.lead}px，元資料 ${order.meta}px，摺疊目錄 ${order.toc}px，正文 ${order.prose}px（首屏高 844px）`);
  await page.click(".bb-tocfold summary");
  const open = await page.evaluate(() => document.querySelector(".bb-tocfold").open);
  const firstLink = await page.evaluate(() => document.querySelector(".bb-tocfold a")?.getAttribute("href"));
  await page.click(".bb-tocfold a");
  await page.waitForTimeout(800);
  const jumped = await page.evaluate((h) => { const e = document.querySelector(h); return e ? Math.round(e.getBoundingClientRect().top) : null; }, firstLink);
  console.log(`目錄撳開：${open ? "成功" : "失敗"}；撳第一條（${firstLink}）後標題距頂 ${jumped}px（要大過黏頂頁頭）`);
  await page.keyboard.press("Tab");
  await ctx.close();

  console.log("\n== 圓鑽文章分享圖 ==");
  {
    const html = await (await fetch(base + "/zh-hk/4c/carat-size-on-hand.html")).text();
    const metas = (re) => [...html.matchAll(re)].map((m) => m[1]);
    const og = metas(/<meta property="og:image" content="([^"]+)"/g);
    const ogw = metas(/<meta property="og:image:width" content="([^"]+)"/g);
    const ogh = metas(/<meta property="og:image:height" content="([^"]+)"/g);
    const oga = metas(/<meta property="og:image:alt" content="([^"]+)"/g);
    const tw = metas(/<meta name="twitter:image" content="([^"]+)"/g);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return "解析失敗"; } });
    const art = ld.find((x) => x && x["@type"] === "Article");
    console.log(`og:image ×${og.length}：${og.join("、")}（${ogw.join()}×${ogh.join()}，alt「${oga.join()}」）`);
    console.log(`twitter:image ×${tw.length}：${tw.join("、")}`);
    console.log(`Article.image：${art ? art.image : "冇"}；JSON-LD 解析失敗 ${ld.filter((x) => x === "解析失敗").length} 個`);
    console.log(`仲有冇用方鑽圖做封面：${/princess-macro-white/.test(html) ? "有（要查）" : "冇"}`);
    const ch = await (await fetch(base + "/zh-hk/4c.html")).text();
    console.log(`第四章頁 og:image：${(ch.match(/<meta property="og:image" content="([^"]+)"/) || [])[1]}（應該仍然係方鑽圖）`);
    for (const f of ["carat-size-round-cover.webp", "carat-size-round-cover-800.webp", "carat-size-round-cover-480.webp"]) {
      const r = await fetch(base + "/images/renders/" + f);
      const buf = Buffer.from(await r.arrayBuffer());
      // WebP VP8/VP8L/VP8X 讀闊高
      let w = 0, h = 0; const t = buf.toString("ascii", 12, 16);
      if (t === "VP8X") { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); }
      else if (t === "VP8 ") { w = buf.readUInt16LE(26) & 0x3fff; h = buf.readUInt16LE(28) & 0x3fff; }
      else if (t === "VP8L") { const b = buf.readUInt32LE(21); w = (b & 0x3fff) + 1; h = ((b >> 14) & 0x3fff) + 1; }
      console.log(`/images/renders/${f}：HTTP ${r.status}，${r.headers.get("content-type")}，${w}×${h}，${Math.round(buf.length / 1024)}KB`);
    }
  }

  console.log("\n== 返回目錄、尺寸工具 ==");
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pg = await ctx2.newPage();
    for (const [label, sel] of [["價錢", 'header a[href$="/zh-hk/price"]'], ["訂造流程", 'header a[href$="/zh-hk/custom"]']]) {
      await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
      await pg.waitForTimeout(500);
      await pg.click(sel);
      await pg.waitForLoadState("load");
      await pg.waitForTimeout(600);
      const at = new URL(pg.url()).pathname;
      await pg.goBack();
      await pg.waitForTimeout(800);
      await pg.evaluate(() => document.getElementById("contents")?.scrollIntoView());
      await pg.waitForTimeout(1200);
      const vis = await pg.evaluate(() => {
        const h = document.getElementById("contents-title");
        const list = document.querySelector(".bb-toc");
        const op = (e) => (e ? getComputedStyle(e).opacity : "冇");
        return { h: op(h), list: op(list), pending: document.querySelectorAll(".is-pending:not(.is-in)").length };
      });
      console.log(`首頁 → ${label}（${at}）→ 返回：目錄標題透明度 ${vis.h}，目錄透明度 ${vis.list}`);
    }
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    const read = () => pg.evaluate(() => document.querySelector(".bb-tool .bb-hand__read")?.textContent?.replace(/\s+/g, " "));
    const setRange = (v) => pg.evaluate((v) => {
      const el = document.querySelector("#tool-ct");
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(el, String(v));
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await pg.locator("#tool-ct").scrollIntoViewIfNeeded();
    await setRange(0.25); await pg.waitForTimeout(300); console.log(`拉桿最細：${await read()}`);
    await setRange(3); await pg.waitForTimeout(300); console.log(`拉桿最大：${await read()}`);
    for (const f of ["手指幼", "中等", "手指粗"]) {
      await pg.click(`.bb-tool button:has-text("${f}")`);
      await pg.waitForTimeout(300);
      const pressed = await pg.evaluate((f) => [...document.querySelectorAll(".bb-tool .bb-hand__fingers-pick button")].find((b) => b.textContent === f)?.getAttribute("aria-pressed"), f);
      console.log(`揀「${f}」（已選 ${pressed}）：${await read()}`);
    }
    await ctx2.close();
  }
  await browser.close();
})();
