// 整頁截圖（檢查版面用）：開「減少動畫」，令碌動進場效果唔會令畫面以下嘅內容喺截圖入面變透明。
// 用法：node scripts/shots.cjs http://localhost:8080 shots name:path ...
const { chromium, devices } = require("playwright");

const [base, out, ...pages] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  for (const p of pages) {
    const name = p.slice(0, p.indexOf(":"));
    const path = p.slice(p.indexOf(":") + 1);
    for (const [suffix, opts] of [["1440", { viewport: { width: 1440, height: 900 } }], ["390", { ...devices["Pixel 7"] }]]) {
      const ctx = await browser.newContext({ ...opts, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      try {
        await page.goto(`${base}/${path}`, { waitUntil: "load" });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${out}/${name}-${suffix}.png`, fullPage: true });
      } catch (e) {
        console.log(`${name}-${suffix} 截圖失敗：${e.message}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
})();
