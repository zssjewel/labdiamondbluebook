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
  "/zh-hk/cases/engagement-rings.html",
  "/zh-hk/cases/engagement-rings/oval-solitaire.html",
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

  console.log("\n== 第三章、第六章章節圖 ==");
  for (const [path, want] of [["/zh-hk/certificate", "certificate-verification-ivory"], ["/zh-hk/custom", "custom-ring-wax-ivory"]]) {
    const html = await (await fetch(base + path + ".html")).text();
    const og = [...html.matchAll(/<meta property="og:image(?::(width|height|alt))?" content="([^"]+)"/g)].map((m) => `${m[1] || "url"}=${m[2].replace(/^https?:\/\/[^/]+/, "")}`);
    console.log(`${path} 分享圖：${og.join("，")}`);
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const pg3 = await ctx3.newPage();
    await pg3.goto(base + path + ".html", { waitUntil: "load" });
    await pg3.waitForTimeout(500);
    const info = await pg3.evaluate(() => {
      const img = document.querySelector(".bb-chapfig img");
      if (!img) return null;
      const r = img.getBoundingClientRect();
      const fig = img.parentElement.getBoundingClientRect();
      return { src: img.getAttribute("src"), current: img.currentSrc.replace(location.origin, ""), alt: img.alt, nat: `${img.naturalWidth}×${img.naturalHeight}`, box: `${Math.round(r.width)}×${Math.round(r.height)}`, fig: `${Math.round(fig.width)}×${Math.round(fig.height)}`, fit: getComputedStyle(img).objectFit, srcset: img.getAttribute("srcset"), sizes: img.getAttribute("sizes"), wh: `${img.getAttribute("width")}×${img.getAttribute("height")}`, loading: img.getAttribute("loading") || "eager" };
    });
    console.log(`  側欄圖：${info ? `${info.src}（用緊 ${info.current}，原圖 ${info.nat}，顯示 ${info.box}，框 ${info.fig}，object-fit ${info.fit}，width/height ${info.wh}，載入 ${info.loading}，sizes ${info.sizes}）` : "冇"}`);
    console.log(`  alt：${info && info.alt}`);
    if (info && info.srcset) {
      for (const part of info.srcset.split(",")) {
        const u = part.trim().split(" ")[0];
        const r = await fetch(base + u);
        console.log(`  srcset ${u}：HTTP ${r.status} ${r.headers.get("content-type")}`);
      }
    }
    console.log(`  係咪用新圖：${info && info.src.includes(want) ? "係" : "唔係"}`);
    await ctx3.close();
  }
  for (const old of ["side-girdle-steel.webp", "wax-steel.webp"]) {
    const r = await fetch(base + "/images/renders/" + old);
    console.log(`舊圖 ${old} 仍然保留：HTTP ${r.status}`);
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

  console.log("\n== 動效 ==");
  for (const [tag, opts] of [["電腦 1440", { viewport: { width: 1440, height: 900 } }], ["手機 390", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }]]) {
    const ctx = await browser.newContext(opts);
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    const sup = await pg.evaluate(() => ({
      view: CSS.supports("animation-timeline: view()"),
      tl: [...document.querySelectorAll("*")].filter((e) => /view|scroll|--bb/.test(getComputedStyle(e).animationTimeline || "")).length,
      range: getComputedStyle(document.querySelector("[data-reveal]")).animationRange || getComputedStyle(document.querySelector("[data-reveal]")).animationRangeStart,
    }));
    console.log(`${tag}：支援碌動動畫 ${sup.view ? "係" : "唔係"}，有 ${sup.tl} 個元素跟碌動，進場範圍「${sup.range}」`);
    // 開頁 2.5 秒後：首屏元素應該全部到位
    await pg.waitForTimeout(2500);
    const hero = await pg.evaluate(() => [...document.querySelectorAll(".bb-hero__actions, .bb-answers > li, .bb-mosaic img, .bb-mosaic > div")].filter((e) => {
      const cs = getComputedStyle(e); return Number(cs.opacity) < 0.99 || (cs.transform !== "none" && cs.transform !== "matrix(1, 0, 0, 1, 0, 0)");
    }).length);
    console.log(`  開頁 2.5 秒後首屏未到位：${hero} 個`);
    // 流程圖：剛入畫面時方塊未排好；去到畫面中間要全部排好
    const svgSel = opts.isMobile ? ".bb-how__svg--v" : ".bb-how__svg--h";
    await pg.waitForTimeout(1500); // 等動效層載入
    const sortInfo = () => pg.evaluate((sel) => {
      const ms = [...document.querySelectorAll(sel + " .m")];
      const off = (m) => {
        const t = getComputedStyle(m).transform;
        if (!t || t === "none") return 0;
        const n = (t.match(/-?[\d.]+(e-?\d+)?/g) || []).map(Number);
        const [tx, ty] = t.startsWith("matrix(") ? [n[4], n[5]] : [n[0] || 0, n[1] || 0];
        return Math.hypot(tx, ty);
      };
      return { all: ms.length, away: ms.filter((m) => off(m) > 0.5).length };
    }, svgSel);
    const before = await sortInfo();
    console.log(`  流程圖未碌到：${before.all} 粒要郁嘅方塊，${before.away} 粒擺咗喺左邊亂堆等緊`);
    const cls0 = await pg.evaluate(() => document.querySelector(".bb-how__stage").className);
    // 上面段落延遲排版，高度會變：反覆對位直到穩定
    for (let k = 0; k < 8; k++) {
      const moved = await pg.evaluate(() => {
        const r = document.querySelector(".bb-how__stage").getBoundingClientRect();
        const d = r.top + r.height / 2 - innerHeight / 2;
        window.scrollTo(0, scrollY + d);
        return Math.abs(d);
      });
      if (moved < 2) break;
      await pg.waitForTimeout(100);
    }
    console.log(`  碌到之前舞台狀態：${cls0}`);
    await pg.waitForTimeout(600);
    const mid = await sortInfo();
    const pics = () => pg.evaluate(() => [...document.querySelectorAll(".bb-how__pic img")].map((i) => `${Number(getComputedStyle(i).opacity).toFixed(2)}${i.complete && i.naturalWidth ? "" : "(未載)"}`).join("/"));
    const picMid = await pics();
    await pg.waitForTimeout(3400);
    const after = await sortInfo();
    const picEnd = await pics();
    const left = await pg.evaluate(() => document.querySelectorAll(".bb-how__stage.is-ready, .bb-how__stage.is-sorting").length);
    console.log(`  碌到之後 0.6 秒：${mid.away} 粒仲喺路上，三張圖透明度 ${picMid}；4 秒：${after.away} 粒仲喺路上，三張圖透明度 ${picEnd}，動畫狀態未清：${left}`);
    await pg.screenshot({ path: `shots/motion-how-${opts.isMobile ? "390" : "1440"}.png` }).catch(() => {});
    // 逐個 data-reveal 碌過，之後等動畫播完，應該全部完全顯示
    const n = await pg.evaluate(() => document.querySelectorAll("[data-reveal]").length);
    for (let i = 0; i < n; i++) {
      await pg.evaluate((i) => document.querySelectorAll("[data-reveal]")[i].scrollIntoView({ block: "center", behavior: "instant" }), i);
      await pg.waitForTimeout(80);
    }
    await pg.waitForTimeout(1600);
    const stuck = await pg.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((e) => {
      const cs = getComputedStyle(e); return Number(cs.opacity) < 0.99 || (e.classList.contains("is-pending") && !e.classList.contains("is-in"));
    }).map((e) => (e.className || e.tagName) + " " + (e.textContent || "").trim().slice(0, 12)));
    const used = await pg.evaluate(() => document.querySelectorAll("[data-reveal].is-pending").length);
    console.log(`  ${n} 個進場元素（${used} 個有進場動畫）碌過之後未完全顯示：${stuck.length ? stuck.join("；") : "冇"}`);
    // 碌到最底：結尾段要完全顯示
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pg.waitForTimeout(300);
    const bottom = await pg.evaluate(() => [...document.querySelectorAll(".bb-close [data-reveal]")].map((e) => Number(getComputedStyle(e).opacity).toFixed(2)).join("、"));
    console.log(`  碌到最底，結尾段透明度：${bottom}`);
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    const r = await pg.evaluate(() => {
      const all = [...document.querySelectorAll("[data-reveal], .bb-answers > li, .bb-mosaic img, .bb-how__svg .m, .bb-how__pic img")];
      return { n: all.length, hidden: all.filter((e) => { const cs = getComputedStyle(e); return Number(cs.opacity) < 0.99 || cs.animationName !== "none"; }).length };
    });
    console.log(`減少動畫模式：${r.n} 個元素之中 ${r.hidden} 個仲有動畫或者未顯示`);
    await ctx.close();
  }

  console.log("\n== 流程圖示意圖（睇書 → 問師傅 → 訂造） ==");
  {
    // 圖片 200、真透明底
    const ctx = await browser.newContext();
    const pg = await ctx.newPage();
    for (const k of ["learn", "consult", "finished"]) for (const w of [480, 720]) {
      const res = await pg.goto(`${base}/images/process/process-${k}-${w}.webp`);
      const body = await res.body();
      const alpha = body.slice(12, 40).toString("latin1");
      console.log(`  process-${k}-${w}.webp：${res.status()}，${res.headers()["content-type"]}，${body.length} bytes，${/VP8X/.test(alpha) && (body[20] & 0x10) ? "有透明通道" : "冇透明通道！"}`);
    }
    await ctx.close();
  }
  // 各闊度：圖完整、唔重疊、冇橫向溢出、手機圖文成對
  for (const w of [375, 430, 768, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    await pg.evaluate(() => document.querySelector(".bb-how__stage").scrollIntoView({ block: "center", behavior: "instant" }));
    await pg.waitForFunction(() => [...document.querySelectorAll(".bb-how__pic img")].every((i) => i.complete && i.naturalWidth), null, { timeout: 8000 }).catch(() => {});
    const r = await pg.evaluate(() => {
      const st = document.querySelector(".bb-how__stage").getBoundingClientRect();
      const imgs = [...document.querySelectorAll(".bb-how__pic img")];
      const box = imgs.map((i) => i.getBoundingClientRect());
      const steps = [...document.querySelectorAll(".bb-how__steps li")].map((l) => l.getBoundingClientRect());
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const svg = [...document.querySelectorAll(".bb-how__svg")].find((s) => s.getClientRects().length);
      return {
        size: box.map((b) => Math.round(b.width)).join("/"),
        loaded: imgs.filter((i) => i.complete && i.naturalWidth).length,
        src: imgs.map((i) => (i.currentSrc.match(/-(\d+)\.webp/) || [])[1]).join("/"),
        out: box.filter((b) => b.left < st.left - 2 - b.width * 0.05 || b.right > st.right + 2 + b.width * 0.05).length,
        overlapImg: box.some((a, i) => box.some((b, j) => i < j && hit(a, b))),
        overlapText: steps.some((s) => box.some((b) => hit(s, b))),
        pair: steps.map((s, i) => Math.round(Math.abs((s.top + s.bottom) / 2 - (box[i].top + box[i].bottom) / 2))).join("/"),
        svg: svg ? `${svg.classList.contains("bb-how__svg--v") ? "直" : "橫"}版，${getComputedStyle(svg).visibility}` : "冇",
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    console.log(`  ${w}px：圖闊 ${r.size}px（載入 ${r.loaded}/3，用 ${r.src}w），超出舞台 ${r.out}，圖互相重疊 ${r.overlapImg ? "有！" : "冇"}，圖字重疊 ${r.overlapText ? "有！" : "冇"}，${w <= 760 ? `圖文中心相差 ${r.pair}px，` : ""}方塊層 ${r.svg}，橫向溢出 ${r.overflow}px`);
    await pg.screenshot({ path: `shots/how-${w}.png` }).catch(() => {});
    await ctx.close();
  }
  // 停用 JavaScript：靜態圖文照見
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    await pg.evaluate(() => document.querySelector(".bb-how__stage").scrollIntoView({ block: "center", behavior: "instant" }));
    await pg.waitForTimeout(1500);
    const r = await pg.evaluate(() => [...document.querySelectorAll(".bb-how__pic img, .bb-how__steps li")].map((e) => Number(getComputedStyle(e).opacity).toFixed(2)).join("/"));
    console.log(`  停用 JS：三張圖同三步文字透明度 ${r}`);
    await ctx.close();
  }
  // 圖載得慢 + 站內轉頁返首頁 + 來回碌 + 改視窗大小
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pg = await ctx.newPage();
    await pg.route("**/images/process/**", async (route) => { await new Promise((r) => setTimeout(r, 1800)); await route.continue(); });
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    await pg.waitForTimeout(1500);
    const state = () => pg.evaluate(() => ({
      op: [...document.querySelectorAll(".bb-how__pic img")].map((i) => Number(getComputedStyle(i).opacity).toFixed(2)).join("/"),
      cls: document.querySelector(".bb-how__stage").className.replace("bb-how__stage", "").trim() || "靜態",
      stages: document.querySelectorAll(".bb-how__stage").length,
    }));
    await pg.evaluate(() => document.querySelector(".bb-how__stage").scrollIntoView({ block: "center", behavior: "instant" }));
    await pg.waitForTimeout(700);
    const s1 = await state();
    await pg.waitForTimeout(5200);
    const s2 = await state();
    console.log(`  圖慢 1.8 秒先到：碌到 0.7 秒 ${s1.cls}（${s1.op}）；6 秒後 ${s2.cls}（${s2.op}）`);
    // 去價錢章再撳返首頁（站內轉頁），碌落去睇有冇重複初始化、透明圖
    const toPrice = pg.locator('a[href$="/price"], a[href$="/price.html"], a[href*="/price/"]').first();
    if (await toPrice.count()) {
      await pg.evaluate(() => window.scrollTo(0, 0));
      await toPrice.click();
      await pg.waitForTimeout(1500);
      await pg.locator(".bb-header__mark").first().click();
      await pg.waitForTimeout(1500);
      for (const y of [0.3, 0.7, 0.4, 0.8]) {
        await pg.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), y);
        await pg.waitForTimeout(250);
      }
      await pg.evaluate(() => document.querySelector(".bb-how__stage").scrollIntoView({ block: "center", behavior: "instant" }));
      await pg.waitForTimeout(700);
      const s3 = await state();
      await pg.setViewportSize({ width: 700, height: 800 });
      await pg.waitForTimeout(400);
      await pg.setViewportSize({ width: 1280, height: 800 });
      await pg.waitForTimeout(4500);
      const s4 = await state();
      console.log(`  轉頁返首頁：${s3.stages} 個舞台，碌到 0.7 秒 ${s3.cls}（${s3.op}）；來回碌兼改視窗之後 ${s4.cls}（${s4.op}）`);
    } else console.log("  搵唔到去價錢章嘅連結");
    await ctx.close();
  }

  console.log("\n== 點解揀鄒三山工坊：四張示意圖 ==");
  {
    const ctx = await browser.newContext();
    const pg = await ctx.newPage();
    for (const k of ["workshop-interior-v2", "factory-direct-v2", "quality-certificate-v2", "doorstep-handover-v2"]) {
      const st = [];
      for (const w of [480, 800, 1200]) st.push((await pg.goto(`${base}/images/workshop-v2/${k}-${w}.webp`)).status());
      console.log(`  ${k}：${st.join("/")}`);
    }
    await ctx.close();
  }
  for (const [w, extra] of [[375, {}], [430, {}], [768, {}], [1440, {}], [390, { javaScriptEnabled: false }], [390, { reducedMotion: "reduce" }]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, ...extra });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    for (let k = 0; k < 6; k++) {
      await pg.evaluate(() => document.querySelector(".bb-why__grid").scrollIntoView({ block: "start", behavior: "instant" }));
      await pg.waitForTimeout(150);
    }
    await pg.waitForFunction(() => [...document.querySelectorAll(".bb-why img")].every((i) => i.complete && i.naturalWidth), null, { timeout: 8000 }).catch(() => {});
    await pg.waitForTimeout(2200);
    const r = await pg.evaluate(() => {
      const imgs = [...document.querySelectorAll(".bb-why img")];
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      return {
        list: imgs.map((i) => {
          const b = i.getBoundingClientRect();
          const cap = i.closest("figure").querySelector("figcaption").getBoundingClientRect();
          const box = i.closest(".bb-why__card");
          const card = box ? box.getBoundingClientRect() : null;
          return {
            name: (i.currentSrc.match(/workshop-v2\/(.+?)-v2-(\d+)/) || []).slice(1).join("@"),
            size: `${Math.round(b.width)}×${Math.round(b.height)}`,
            ratio: Math.round((b.width / b.height) * 100) / 100,
            nat: Math.round((i.naturalWidth / i.naturalHeight) * 100) / 100,
            op: Number(getComputedStyle(i).opacity).toFixed(2),
            capOver: !box ? false : hit(b, cap),
            outCard: card ? b.left < card.left - 1 || b.right > card.right + 1 || b.bottom > card.bottom + 1 : false,
          };
        }),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const tag = extra.javaScriptEnabled === false ? "390px 停用 JS" : extra.reducedMotion ? "390px 減少動畫" : `${w}px`;
    console.log(`  ${tag}：${r.list.map((x) => `${x.name} ${x.size}（顯示比例 ${x.ratio}／原圖 ${x.nat}，透明度 ${x.op}${x.capOver ? "，圖說遮圖！" : ""}${x.outCard ? "，出咗卡！" : ""}）`).join("；")}；橫向溢出 ${r.overflow}px`);
    if (extra.javaScriptEnabled !== false && !extra.reducedMotion) await pg.locator(".bb-why").screenshot({ path: `shots/why-${w}.png` }).catch(() => {});
    await ctx.close();
  }

  console.log("\n== 首頁段落之間留白（上一段內容底 → 下一段內容頂） ==");
  for (const w of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    for (let y = 0; y < 14; y++) { await pg.evaluate((y) => window.scrollTo(0, y * 800), y); await pg.waitForTimeout(80); }
    const r = await pg.evaluate(() => {
      const secs = [...document.querySelectorAll("main > section, main > * > section")].filter((s) => s.getClientRects().length && s.closest("main"));
      const box = (s) => {
        const kids = [...s.children].filter((k) => k.getClientRects().length && getComputedStyle(k).position !== "absolute");
        return { name: s.className.split(" ")[0], top: kids.length ? Math.min(...kids.map((k) => k.getBoundingClientRect().top)) : s.getBoundingClientRect().top, bottom: kids.length ? Math.max(...kids.map((k) => k.getBoundingClientRect().bottom)) : s.getBoundingClientRect().bottom, bg: getComputedStyle(s).backgroundColor };
      };
      const b = secs.map(box);
      return b.slice(1).map((x, i) => `${b[i].name}→${x.name} ${Math.round(x.top - b[i].bottom)}px${b[i].bg === x.bg ? "（同底色）" : ""}`);
    });
    console.log(`  ${w}px：${r.join("，")}`);
    await ctx.close();
  }

  console.log("\n== 作品貨架 ==");
  for (const [tag, opts] of [["電腦 1440", { viewport: { width: 1440, height: 900 } }], ["手機 390", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }]]) {
    const ctx = await browser.newContext(opts);
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html", { waitUntil: "load" });
    await pg.waitForTimeout(1500);
    const info = async () => pg.evaluate(() => {
      const sec = document.querySelector(".bb-works");
      const tr = sec.querySelector(".bb-shelf__track");
      const cards = [...tr.querySelectorAll(":scope > li")];
      const r = sec.getBoundingClientRect();
      const tabs = [...sec.querySelectorAll(".bb-shelf__tabs button")].map((b) => `${b.textContent}${b.getAttribute("aria-pressed") === "true" ? "✓" : ""}`);
      const broken = [...tr.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).length;
      return { top: Math.round(r.top + scrollY), h: Math.round(r.height), cards: cards.length, tabs: tabs.join(" "), scrollW: tr.scrollWidth, w: tr.clientWidth, cardW: Math.round(cards[0].getBoundingClientRect().width), broken, pageOver: document.documentElement.scrollWidth - innerWidth };
    });
    let i = await info();
    console.log(`${tag}：作品段喺 ${i.top}px，高 ${i.h}px；分類「${i.tabs}」；卡 ${i.cards} 張（每張闊 ${i.cardW}px，可滑 ${i.scrollW - i.w}px）；破圖 ${i.broken}；頁面橫向溢出 ${i.pageOver}px`);
    await pg.locator(".bb-works .bb-shelf__tabs button", { hasText: "耳環" }).click();
    await pg.waitForTimeout(900);
    i = await info();
    console.log(`  撳「耳環」：卡 ${i.cards} 張，分類「${i.tabs}」`);
    const first = await pg.evaluate(() => document.querySelector(".bb-works .bb-shelf__track li a").getAttribute("href"));
    console.log(`  第一張連去 ${first}`);
    if (!opts.isMobile) {
      await pg.locator(".bb-works .bb-shelf__tabs button", { hasText: "所有產品" }).click();
      await pg.waitForTimeout(500);
      await pg.locator(".bb-works .bb-shelf__paddle--next").click();
      await pg.waitForTimeout(1200);
      const sl = await pg.evaluate(() => document.querySelector(".bb-works .bb-shelf__track").scrollLeft);
      await pg.locator(".bb-works .bb-shelf__paddle--next").click();
      await pg.waitForTimeout(1200);
      const sl2 = await pg.evaluate(() => document.querySelector(".bb-works .bb-shelf__track").scrollLeft);
      console.log(`  撳右箭咀：第一下滑咗 ${Math.round(sl)}px，第二下再滑 ${Math.round(sl2 - sl)}px（一張卡闊 + 間距 = ${i.cardW + 16}px）`);
    }
    await ctx.close();
  }
  {
    const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await pg.goto(base + "/zh-hk/cases/engagement-rings/oval-solitaire.html", { waitUntil: "load" });
    const d = await pg.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent,
      slides: document.querySelectorAll(".bb-gallery__slide").length,
      specs: [...document.querySelectorAll(".bb-specs div")].map((x) => x.textContent).join("｜"),
      related: [...document.querySelectorAll(".bb-related h2")].map((x) => x.textContent).join("、"),
      robots: document.querySelector('meta[name="robots"]')?.content,
    }));
    {
      const dp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await dp.goto(base + "/zh-hk/cases/engagement-rings/oval-solitaire.html", { waitUntil: "load" });
      await dp.waitForTimeout(800);
      await dp.hover(".bb-gallery__stage");
      await dp.waitForTimeout(400);
      const vis = await dp.evaluate(() => [...document.querySelectorAll(".bb-gallery__stage .bb-shelf__paddle")].map((b) => `${b.getAttribute("aria-label")} 透明度 ${getComputedStyle(b).opacity}${b.disabled ? "（停用）" : ""}`).join("、"));
      await dp.click(".bb-gallery__stage .bb-shelf__paddle--next");
      await dp.waitForTimeout(1000);
      const g = await dp.evaluate(() => { const t = document.querySelector(".bb-gallery__track"); return { at: Math.round(t.scrollLeft / t.clientWidth) + 1, dot: [...document.querySelectorAll(".bb-gallery__dots button")].findIndex((b) => b.getAttribute("aria-current") === "true") + 1 }; });
      console.log(`作品相（電腦）：滑鼠移入 → ${vis}；撳右箭咀後去到第 ${g.at} 張，頁碼點第 ${g.dot} 粒`);
      await dp.screenshot({ path: "shots/gallery-hover-1440.png", clip: { x: 0, y: 0, width: 1440, height: 900 } });
      await dp.close();
    }
    console.log(`作品頁：${d.h1}｜相 ${d.slides} 格｜${d.specs}｜相關：${d.related}｜robots ${d.robots}`);
    for (const p of ["/zh-hk/price.html", "/zh-hk/4c/carat-size-on-hand.html"]) {
      await pg.goto(base + p, { waitUntil: "load" });
      const r = await pg.evaluate(() => [...document.querySelectorAll(".bb-related")].map((s) => `${s.querySelector("h2").textContent}（${s.querySelectorAll(".bb-shelf__track > li").length - 1} 件）`).join("、"));
      console.log(`${p} 相關作品：${r || "冇"}`);
    }
    await pg.close();
  }

  console.log("\n== 分享圖（原始 HTML）==");
  const metaOf = (html, prop) => [...html.matchAll(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]+)"`, "g"))].map((m) => m[1]);
  for (const p of ["/zh-hk", "/zh-hk/cases", ...["engagement-rings", "earrings", "eternity-rings", "pendants", "bracelets", "wedding-bands", "remake"].map((c) => `/zh-hk/cases/${c}`), "/zh-hk/cases/engagement-rings/oval-solitaire", "/zh-hk/certificate", "/zh-hk/custom", "/zh-hk/4c/carat-size-on-hand", "/zh-hk/about"]) {
    const html = await (await fetch(base + p + ".html")).text();
    const og = metaOf(html, "og:image"), tw = metaOf(html, "twitter:image");
    const ogw = metaOf(html, "og:image:width")[0], ogh = metaOf(html, "og:image:height")[0];
    const short = (u) => (u || "冇").replace(/^https?:\/\/[^/]+/, "");
    const abs = og.every((u) => /^https:\/\//.test(u)) && tw.every((u) => /^https:\/\//.test(u));
    console.log(`${p}：og ${og.length} 個 ${short(og[0])}（${ogw}×${ogh}）｜twitter ${tw.length} 個 ${short(tw[0])}｜一致 ${og[0] === tw[0] ? "係" : "唔係"}｜絕對網址 ${abs ? "係" : "唔係"}`);
  }
  {
    const r = await fetch(base + "/images/social/share-cover-labdiamond-1200x630.jpg");
    const buf = Buffer.from(await r.arrayBuffer());
    let w = 0, h = 0;
    for (let i = 2; i < buf.length; ) { if (buf[i] !== 0xff) break; const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; } i += 2 + len; }
    console.log(`分享封面：HTTP ${r.status}，${r.headers.get("content-type")}，${w}×${h}，${Math.round(buf.length / 1024)}KB`);
  }

  console.log("\n== 推薦作品出口文案 ==");
  for (const [p, sel] of [["/zh-hk.html", ".bb-works"], ["/zh-hk/price.html", ".bb-related"], ["/zh-hk/4c/carat-size-on-hand.html", ".bb-related"], ["/zh-hk/cases/engagement-rings/oval-solitaire.html", ".bb-related"]]) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(base + p, { waitUntil: "load" });
    const r = await pg.evaluate((sel) => [...document.querySelectorAll(sel)].map((s) => { const a = s.querySelector(".bb-shelf__card--all"); return `「${(s.querySelector("h2") || {}).textContent || ""}」→「${a.textContent.replace("›", "").trim()}」連去 ${a.getAttribute("href")}`; }), sel);
    for (const x of r) {
      const href = x.match(/連去 (\S+)/)[1];
      const dest = await browser.newPage();
      await dest.goto(base + href + ".html", { waitUntil: "load" });
      const n = await dest.evaluate(() => document.querySelectorAll(".bb-casegrid > li").length);
      await dest.close();
      console.log(`${p.replace(".html", "")} ${x}（目的地有 ${n} 件）`);
    }
    await pg.close();
  }

  console.log("\n== 首頁目錄（手機唔放裝飾圖）==");
  for (const w of [375, 400, 430, 960, 1024, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 800, hasTouch: w < 800 });
    const pg = await ctx.newPage();
    await pg.goto(base + "/zh-hk.html#contents", { waitUntil: "load" });
    await pg.waitForTimeout(800);
    await pg.evaluate(() => document.getElementById("contents").scrollIntoView({ block: "start", behavior: "instant" }));
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => {
      const front = document.querySelector(".bb-book__front");
      const first = document.querySelector(".bb-toc a");
      const head = document.getElementById("contents-title").getBoundingClientRect();
      const bar = document.querySelector(".bb-header").getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      const inside = document.querySelector(".bb-book__inside").getBoundingClientRect();
      const page = document.querySelector(".bb-book__page").getBoundingClientRect();
      const side = getComputedStyle(front).display === "none" ? "，手機版：目錄先，最新文章喺後" : `，打開咗：內頁喺${inside.right <= page.left + 2 ? "左" : "右"}（${Math.round(inside.width)}×${Math.round(inside.height)}），目錄頁喺右（${Math.round(page.width)}×${Math.round(page.height)}）`;
      const hitOk = (sel) => { const a = document.querySelector(sel); if (!a) return "冇"; const b = a.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return "唔喺畫面"; const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return a.contains(e) ? "撳得到" : `被 ${e?.className || e?.tagName} 擋住`; };
      const side2 = side + `；最新文章連結${hitOk(".bb-book__latest a")}，第一章連結${hitOk(".bb-toc a")}`;
      return { fig: getComputedStyle(front).display, side: side2, first: Math.round(fr.top), inView: fr.top < innerHeight && fr.bottom > 0, headTop: Math.round(head.top), barBottom: Math.round(bar.bottom), over: document.documentElement.scrollWidth - innerWidth };
    });
    console.log(`${w}px：書${r.fig === "none" ? "（封面隱藏）" : ""}${r.side}｜第一章連結喺畫面 ${r.first}px（${r.inView ? "睇得到" : "要再碌"}）｜目錄標題頂 ${r.headTop}px，頁頭底 ${r.barBottom}px｜橫向溢出 ${r.over}px`);
    if (w >= 1024 || w === 375) { await pg.waitForTimeout(2600); await pg.screenshot({ path: `shots/contents-${w}.png` }).catch(() => {}); }
    await ctx.close();
  }
  for (const from of ["/zh-hk/price.html", "/zh-hk/custom.html"]) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(base + from, { waitUntil: "load" });
    await pg.waitForTimeout(1200);
    await pg.click('.bb-header__tab a:has-text("目錄")');
    await pg.waitForTimeout(2500);
    const r = await pg.evaluate(() => {
      const head = document.getElementById("contents-title").getBoundingClientRect();
      const bar = document.querySelector(".bb-header").getBoundingClientRect();
      const toc = document.querySelector(".bb-toc").getBoundingClientRect();
      return { url: location.pathname + location.hash, head: Math.round(head.top), bar: Math.round(bar.bottom), toc: Math.round(toc.top), op: getComputedStyle(document.querySelector(".bb-toc")).opacity };
    });
    console.log(`由 ${from.replace(".html", "")} 撳頂部「目錄」：去到 ${r.url}，目錄標題頂 ${r.head}px（頁頭底 ${r.bar}px，${r.head >= r.bar ? "冇被遮" : "被遮住"}），章節表頂 ${r.toc}px，透明度 ${r.op}`);
    await pg.goBack();
    await pg.waitForTimeout(800);
    const back = await pg.evaluate(() => location.pathname);
    await pg.goForward();
    await pg.waitForTimeout(800);
    const fwd = await pg.evaluate(() => location.pathname + location.hash);
    console.log(`  返回：${back}；前進：${fwd}`);
    await pg.close();
  }
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(base + "/zh-hk/price.html", { waitUntil: "load" });
    await pg.keyboard.press("Tab");
    const skip = await pg.evaluate(() => ({ t: document.activeElement.textContent, top: Math.round(document.activeElement.getBoundingClientRect().top) }));
    await pg.keyboard.press("Enter");
    await pg.waitForTimeout(300);
    const after = await pg.evaluate(() => `${document.activeElement.tagName}#${document.activeElement.id}`);
    console.log(`跳至正文：第一下 Tab 聚焦「${skip.t}」（頂 ${skip.top}px），撳 Enter 後焦點喺 ${after}；main 數量 ${await pg.evaluate(() => document.querySelectorAll("main").length)}`);
    await pg.close();
  }

  console.log("\n== 作品列表頁分類（同首頁一樣嘅分段選擇器）==");
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(base + "/zh-hk/cases.html", { waitUntil: "load" });
    await pg.waitForTimeout(1200);
    await pg.evaluate(() => window.scrollTo(0, 300));
    const ind = () => pg.evaluate(() => {
      const nav = document.querySelector(".bb-casegrid") && document.querySelector("nav.bb-seg");
      const on = nav.querySelector('[aria-current="page"]');
      const i = nav.querySelector(".bb-seg__ind");
      return { on: on && on.textContent, x: Math.round(new DOMMatrix(getComputedStyle(i).transform).m41), want: on ? on.offsetLeft : -1, live: nav.classList.contains("is-live"), url: location.pathname, y: Math.round(scrollY), n: document.querySelectorAll(".bb-casegrid > li").length };
    });
    console.log("開頁：", JSON.stringify(await ind()));
    await pg.click('nav.bb-seg a:has-text("耳環")');
    await pg.waitForTimeout(150);
    console.log("撳「耳環」0.15 秒（膠囊滑緊、未換頁）：", JSON.stringify(await ind()));
    await pg.waitForTimeout(1800);
    console.log("1.9 秒後（已換頁）：", JSON.stringify(await ind()));
    await pg.close();
  }
  await browser.close();
})();
