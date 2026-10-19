// 動效錄影：電腦同手機各錄一段「開首頁 → 慢慢碌到底 → 撳入一篇文章」，另外截幾格關鍵畫面。
// 用法：node scripts/motion-video.cjs http://localhost:8080 shots/motion
const { chromium, devices } = require("playwright");
const fs = require("fs");

const base = process.argv[2] || "http://localhost:8080";
const out = process.argv[3] || "shots/motion";
fs.mkdirSync(out, { recursive: true });

// 用 requestAnimationFrame 平滑碌動，速度大約每秒 px 像素，喺 stops 位置停一停
async function glide(page, pxPerSec, stops = []) {
  await page.evaluate(
    async ([speed, stops]) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const stopAt = stops.map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return Math.min(max, Math.max(0, r.top + scrollY - (innerHeight - r.height) / 2));
      }).filter((v) => v !== null).sort((a, b) => a - b);
      let y = scrollY;
      let last = performance.now();
      while (y < max - 1) {
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        const next = Math.min(max, y + ((now - last) / 1000) * speed);
        const hit = stopAt.find((s) => s > y && s <= next);
        y = hit ?? next;
        last = now;
        window.scrollTo(0, y);
        if (hit !== undefined) { await new Promise((r) => setTimeout(r, 900)); last = performance.now(); }
      }
    },
    [pxPerSec, stops],
  );
}

(async () => {
  const browser = await chromium.launch();
  for (const [tag, opts, speed] of [
    ["desktop", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }, 900],
    ["phone", { ...devices["Pixel 7"] }, 700],
  ]) {
    const size = opts.viewport;
    const ctx = await browser.newContext({ ...opts, recordVideo: { dir: out, size } });
    const page = await ctx.newPage();
    await page.goto(base + "/zh-hk.html", { waitUntil: "load" });
    await page.waitForTimeout(2200);
    await glide(page, speed, [".bb-tool__plate", tag === "phone" ? ".bb-how__svg--v" : ".bb-how__svg--h", ".bb-tiles__a"]);
    await page.waitForTimeout(600);
    // 撳入文章，睇換頁
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);
    const link = page.locator('.bb-answers a').nth(1);
    await link.click();
    await page.waitForTimeout(1400);
    if (tag === "phone") {
      const fold = page.locator(".bb-tocfold summary");
      if (await fold.count()) { await fold.click(); await page.waitForTimeout(900); await fold.click(); await page.waitForTimeout(700); }
    }
    const video = page.video();
    await ctx.close();
    const p = await video.path();
    fs.renameSync(p, `${out}/${tag}.webm`);
    console.log(`錄好 ${tag}.webm`);
  }

  // 關鍵畫面：首屏開頁 0 / 0.4 / 0.9 / 2 秒
  for (const [tag, opts] of [["desktop", { viewport: { width: 1280, height: 800 } }], ["phone", { ...devices["Pixel 7"] }]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(base + "/zh-hk.html", { waitUntil: "commit" });
    for (const ms of [400, 900, 2000]) {
      await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
      await page.screenshot({ path: `${out}/${tag}-hero-${ms}.png` });
    }
    // 流程圖排隊過程
    const sel = tag === "phone" ? ".bb-how__svg--v" : ".bb-how__svg--h";
    for (const f of [0.12, 0.25, 0.38, 0.5]) {
      await page.evaluate(([sel, f]) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        window.scrollTo(0, scrollY + r.top - innerHeight + (innerHeight + r.height) * f);
      }, [sel, f]);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${tag}-how-${Math.round(f * 100)}.png` });
    }
    // 宣言色塊放大
    for (const f of [0.08, 0.2, 0.42]) {
      await page.evaluate((f) => {
        const r = document.querySelector(".bb-tiles").getBoundingClientRect();
        window.scrollTo(0, scrollY + r.top - innerHeight + (innerHeight + r.height) * f);
      }, f);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${tag}-tiles-${Math.round(f * 100)}.png` });
    }
    await ctx.close();
  }
  await browser.close();
})();
