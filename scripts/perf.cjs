// 滾動流暢度量度：一邊滾一邊錄 Chrome 追蹤，數有幾多格畫面冇準時出到（掉格）。
// 用法：node scripts/perf.cjs http://localhost:8080 > perf.txt
const { chromium, devices } = require("playwright");

const base = process.argv[2] || "http://localhost:8080";
const allPages = [
  ["首頁", "/zh-hk.html"],
  ["互動文章", "/zh-hk/4c/carat-size-on-hand.html"],
  ["普通文章", "/zh-hk/basics/vs-natural-moissanite.html"],
];
const pages = process.env.PERF_PAGES ? allPages.filter(([n]) => process.env.PERF_PAGES.split(",").includes(n)) : allPages;
const setups = [
  ["電腦 1440", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, 1],
  ["手機 Pixel 7（CPU 慢 4 倍）", { ...devices["Pixel 7"] }, 4],
];
// 對照測試：PERF_VARIANTS='[["名","注入CSS"],...]'，PERF_PAGES=首頁 只測某幾頁
const variants = process.env.PERF_VARIANTS ? JSON.parse(process.env.PERF_VARIANTS) : [["", ""]];

function frameStats(events) {
  const sum = {};
  for (const e of events) {
    if (!["Paint", "RasterTask", "Layout", "UpdateLayoutTree", "Layerize", "DrawFrame", "DroppedFrame", "BeginFrame", "GPUTask"].includes(e.name)) continue;
    const k = e.name;
    sum[k] = sum[k] || { n: 0, ms: 0 };
    sum[k].n++;
    if (e.dur) sum[k].ms += e.dur / 1000;
  }
  return sum;
}

(async () => {
  const browser = await chromium.launch({ args: ["--enable-gpu-rasterization"] });
  for (const [sname, ctxOpts, cpu] of setups) {
    for (const [pname, path] of pages) {
      for (const [vname, css] of variants) for (let rep = 0; rep < Number(process.env.PERF_REPEAT || 1); rep++) {
        const ctx = await browser.newContext(ctxOpts);
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
        await page.goto(base + path, { waitUntil: "load" });
        if (css) await page.addStyleTag({ content: css });
        await page.waitForTimeout(2000);
        await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "cc", "gpu"] });
        const t0 = Date.now();
        // 好似用滑鼠轆咁滾，每 50ms 一下
        const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        for (let y = 0; y < Math.min(max, 6000); y += 100) {
          await page.mouse.wheel(0, 100);
          await page.waitForTimeout(50);
        }
        const secs = (Date.now() - t0) / 1000;
        const buf = await browser.stopTracing();
        let events = [];
        try { events = JSON.parse(buf.toString()).traceEvents || []; } catch {}
        const st = frameStats(events);
        const f = (k) => (st[k] ? `${st[k].n} 次/${Math.round(st[k].ms)}ms` : "0");
        console.log(`${sname} · ${pname}${vname ? `（${vname}）` : ""}：${secs.toFixed(1)} 秒 | 出畫 ${st.DrawFrame ? st.DrawFrame.n : 0} 格，掉格 ${st.DroppedFrame ? st.DroppedFrame.n : 0} | 重畫 Paint ${f("Paint")} | 光柵化 Raster ${f("RasterTask")} | GPU ${f("GPUTask")} | 排版 Layout ${f("Layout")} | 樣式 ${f("UpdateLayoutTree")}`);
        await ctx.close();
      }
    }
  }
  await browser.close();
})();
