// 開頁速度量度：模擬普通 4G 手機（延遲 150ms、下載 1.6Mbps、CPU 慢 4 倍）同電腦寬頻，
// 量首次顯示內容（FCP）、最大內容顯示（LCP）、版面跳動（CLS）、請求數同下載量。
// 用法：node scripts/load.cjs http://localhost:8080 > load.txt
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:8080";
const pages = ["/zh-hk.html", "/zh-hk/4c/carat-size-on-hand.html", "/zh-hk/basics/vs-natural-moissanite.html"];
const setups = [
  ["手機 4G（慢 CPU）", { ...devices["Pixel 7"] }, { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }, 4],
  ["電腦寬頻", { viewport: { width: 1440, height: 900 } }, { latency: 20, downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 }, 1],
];
(async () => {
  const browser = await chromium.launch();
  for (const [name, ctxOpts, net, cpu] of setups) {
    for (const p of pages) {
     const runs = [];
     for (let k = 0; k < 3; k++) {
      const ctx = await browser.newContext(ctxOpts);
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, ...net });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      let reqs = 0, bytes = 0;
      const urls = {}, sizes = [];
      cdp.on("Network.requestWillBeSent", (e) => { urls[e.requestId] = e.request.url; });
      cdp.on("Network.loadingFinished", (e) => { reqs++; bytes += e.encodedDataLength || 0; sizes.push([e.encodedDataLength || 0, (urls[e.requestId] || "").replace(base, "")]); });
      await page.addInitScript(() => {
        window.__m = { lcp: 0, cls: 0 };
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__m.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__m.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
      });
      const t0 = Date.now();
      await page.goto(base + p, { waitUntil: "load", timeout: 90000 });
      const loadMs = Date.now() - t0;
      await page.waitForTimeout(3000);
      const m = await page.evaluate(() => {
        const fcp = performance.getEntriesByName("first-contentful-paint")[0];
        const nav = performance.getEntriesByType("navigation")[0];
        return { fcp: fcp ? fcp.startTime : 0, lcp: window.__m.lcp, cls: window.__m.cls, html: nav ? nav.encodedBodySize : 0 };
      });
      runs.push({ ...m, loadMs, reqs, bytes, sizes });
      await ctx.close();
     }
      const med = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
      const r0 = runs[0];
      console.log(`${name} · ${p.replace(/\.html$/, "")}（3 次中位數）：FCP ${(med("fcp") / 1000).toFixed(2)}s，LCP ${(med("lcp") / 1000).toFixed(2)}s，CLS ${med("cls").toFixed(3)}，載完 ${(med("loadMs") / 1000).toFixed(1)}s，請求 ${r0.reqs} 個，共 ${Math.round(r0.bytes / 1024)}KB（HTML ${Math.round(r0.html / 1024)}KB，未壓縮）`);
      if (p === pages[0]) console.log("   最大嘅檔案：" + r0.sizes.sort((a, b) => b[0] - a[0]).slice(0, 6).map(([b, u]) => `${u.split("?")[0]} ${Math.round(b / 1024)}KB`).join("，"));
    }
  }
  await browser.close();
})();
