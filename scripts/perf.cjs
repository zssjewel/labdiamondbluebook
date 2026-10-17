// 滾動流暢度量度：一邊滾一邊錄 Chrome 追蹤，數有幾多格畫面冇準時出到（掉格）。
// 同一頁會量兩次：原樣，同埋關咗毛玻璃 + 無限循環動畫，用嚟比較。
// 用法：node scripts/perf.cjs http://localhost:8080 > perf.txt
const { chromium, devices } = require("playwright");

const base = process.argv[2] || "http://localhost:8080";
const pages = [
  ["首頁", "/zh-hk.html"],
  ["互動文章", "/zh-hk/4c/carat-size-on-hand.html"],
  ["普通文章", "/zh-hk/basics/vs-natural-moissanite.html"],
];
const setups = [
  ["電腦 1440", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, 1],
  ["手機 Pixel 7（CPU 慢 4 倍）", { ...devices["Pixel 7"] }, 4],
];
const variants = [
  ["原樣", ""],
  ["冇毛玻璃、冇循環動畫", "*{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.bb-drift{animation:none!important}"],
];

function frameStats(events) {
  let presented = 0, dropped = 0;
  for (const e of events) {
    if (e.name !== "PipelineReporter" || e.ph !== "b") continue;
    const st = e.args && e.args.chrome_frame_reporter && e.args.chrome_frame_reporter.state;
    if (st === "STATE_DROPPED") dropped++;
    else if (st === "STATE_PRESENTED_ALL" || st === "STATE_PRESENTED_PARTIAL") presented++;
  }
  return { presented, dropped };
}

(async () => {
  const browser = await chromium.launch({ args: ["--enable-gpu-rasterization"] });
  for (const [sname, ctxOpts, cpu] of setups) {
    for (const [pname, path] of pages) {
      for (const [vname, css] of variants) {
        const ctx = await browser.newContext(ctxOpts);
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
        await page.goto(base + path, { waitUntil: "load" });
        if (css) await page.addStyleTag({ content: css });
        await page.waitForTimeout(2000);
        await browser.startTracing(page, { categories: ["cc", "viz", "benchmark", "disabled-by-default-devtools.timeline.frame"] });
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
        const { presented, dropped } = frameStats(events);
        const total = presented + dropped;
        const pct = total ? Math.round((dropped / total) * 100) : 0;
        console.log(`${sname} · ${pname} · ${vname}：${secs.toFixed(1)} 秒，出咗 ${presented} 格，掉咗 ${dropped} 格（${pct}%）`);
        await ctx.close();
      }
    }
  }
  await browser.close();
})();
