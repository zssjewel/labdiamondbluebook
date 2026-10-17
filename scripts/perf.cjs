// 滾動流暢度量度：逐頁、逐種屏幕，一邊滾一邊記錄每格畫面用咗幾耐。
// 用法：node scripts/perf.cjs http://localhost:8080 > perf.txt
const { chromium, devices } = require("playwright");

const base = process.argv[2] || "http://localhost:8080";
const pages = [
  ["首頁", "/zh-hk.html"],
  ["互動文章", "/zh-hk/4c/carat-size-on-hand.html"],
  ["普通文章", "/zh-hk/basics/vs-natural-moissanite.html"],
];
const setups = [
  ["電腦 1440", { viewport: { width: 1440, height: 900 } }, 1],
  ["手機 Pixel 7（CPU 慢 4 倍）", { ...devices["Pixel 7"] }, 4],
];

(async () => {
  const browser = await chromium.launch();
  for (const [sname, ctxOpts, cpu] of setups) {
    for (const [pname, path] of pages) {
      const ctx = await browser.newContext(ctxOpts);
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(2500);
      const r = await page.evaluate(async () => {
        const longTasks = [];
        try {
          new PerformanceObserver((l) => l.getEntries().forEach((e) => longTasks.push(e.duration))).observe({ type: "longtask", buffered: false });
        } catch {}
        const deltas = [];
        let last = performance.now();
        const max = document.documentElement.scrollHeight - innerHeight;
        await new Promise((done) => {
          let y = 0;
          const step = () => {
            const now = performance.now();
            deltas.push(now - last);
            last = now;
            y += 24;
            window.scrollTo(0, Math.min(y, max));
            if (y < max && deltas.length < 600) requestAnimationFrame(step);
            else done();
          };
          requestAnimationFrame(step);
        });
        deltas.shift();
        const s = [...deltas].sort((a, b) => a - b);
        const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
        return {
          frames: deltas.length,
          median: q(0.5),
          p95: q(0.95),
          slow: deltas.filter((d) => d > 33.4).length,
          longTasks: longTasks.length,
          longMs: Math.round(longTasks.reduce((a, b) => a + b, 0)),
        };
      });
      const pct = Math.round((r.slow / r.frames) * 100);
      console.log(`${sname} · ${pname}：${r.frames} 格，中位 ${r.median.toFixed(1)}ms，95% ${r.p95.toFixed(1)}ms，卡頓格（>33ms）${r.slow}（${pct}%），長任務 ${r.longTasks} 個共 ${r.longMs}ms`);
      await ctx.close();
    }
  }
  await browser.close();
})();
