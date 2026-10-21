// 手部示意圖：固定參數截圖 + 量度主石同手指嘅比例（用嚟對比改版前後）
// 用法：node scripts/hand-shots.cjs http://localhost:8080 <輸出資料夾>
const { chromium } = require("playwright");
const fs = require("fs");
const base = process.argv[2] || "http://localhost:8080";
const out = process.argv[3] || "hand";
fs.mkdirSync(out, { recursive: true });
const states = [
  ["0.25ct-mid", 0.25, "中等"],
  ["1ct-mid", 1, "中等"],
  ["3ct-mid", 3, "中等"],
  ["1ct-slim", 1, "手指幼"],
  ["1ct-wide", 1, "手指粗"],
];
(async () => {
  const browser = await chromium.launch();
  for (const [vw, vh, dpr, tag] of [[1440, 900, 2, "desktop"], [390, 844, 3, "phone"]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr });
    const page = await ctx.newPage();
    await page.goto(base + "/index.html", { waitUntil: "load" });
    const plate = page.locator(".bb-tool__plate");
    await plate.scrollIntoViewIfNeeded();
    for (const [name, ct, finger] of states) {
      await page.evaluate((v) => {
        const el = document.querySelector("#tool-ct");
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, ct);
      await page.click(`.bb-tool button:has-text("${finger}")`);
      await page.waitForTimeout(800);
      const m = await page.evaluate(() => {
        const root = document.querySelector(".bb-tool .bb-hand");
        const svg = root.querySelector("svg").getBoundingClientRect();
        const img = root.querySelector(".bb-hand__stone").getBoundingClientRect();
        const ring = root.querySelector("[data-ring-finger]");
        const r = ring ? ring.getBoundingClientRect() : null;
        const read = document.querySelector(".bb-tool .bb-hand__read").textContent.replace(/\s+/g, " ");
        const plateR = document.querySelector(".bb-tool__plate").getBoundingClientRect();
        return {
          read,
          stonePx: +(img.width * 0.94).toFixed(1),
          stoneCx: +((img.left + img.width / 2 - svg.left) / svg.width).toFixed(4),
          stoneCy: +((img.top + img.height / 2 - svg.top) / svg.height).toFixed(4),
          unitPx: svg.width / 380,
          overflow: document.documentElement.scrollWidth - innerWidth,
          plateInView: plateR.width <= innerWidth,
        };
      });
      // 主石直徑（SVG 單位）÷ 中等手指 110 單位 × 16.5 毫米 = 主石毫米
      const stoneMm = (m.stonePx / m.unitPx / (110 / 16.5)).toFixed(2);
      console.log(`${tag} ${name}：${m.read}｜主石畫出嚟 ${stoneMm} 毫米，中心 (${m.stoneCx}, ${m.stoneCy})，溢出 ${m.overflow}px`);
      await plate.screenshot({ path: `${out}/${tag}-${name}.png` });
    }
    await ctx.close();
  }
  // 文章入面嘅同一個組件（手機）
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto(base + "/4c/carat-size-on-hand.html", { waitUntil: "load" });
  await page.locator(".bb-story__sticky").screenshot({ path: `${out}/phone-article-story.png` });
  const ids = await page.evaluate(() => {
    const all = [...document.querySelectorAll("svg [id]")].map((e) => e.id);
    return { n: all.length, dup: all.length - new Set(all).size };
  });
  console.log(`文章頁 SVG id：${ids.n} 個，重複 ${ids.dup} 個`);
  const home = await browser.newPage();
  await home.goto(base + "/index.html", { waitUntil: "load" });
  console.log(`首頁 SVG id 重複：${await home.evaluate(() => { const a = [...document.querySelectorAll("svg [id]")].map((e) => e.id); return a.length - new Set(a).size; })}`);
  await browser.close();
})();
