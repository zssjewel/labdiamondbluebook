// 讀 Lighthouse JSON，印出分數、各項指標、扣分最多嘅建議同細節。
// 用法：node scripts/lh-summary.cjs lh/*.json
const fs = require("fs");
const files = process.argv.slice(2);
const byPage = {};
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(f, "utf8"));
  const page = f.replace(/.*\//, "").replace(/-\d+\.json$/, "");
  (byPage[page] ||= []).push(r);
}
const ms = (v) => (v == null ? "-" : v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`);
for (const [page, runs] of Object.entries(byPage)) {
  runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
  const med = runs[Math.floor(runs.length / 2)];
  const a = med.audits;
  const scores = runs.map((r) => Math.round(r.categories.performance.score * 100)).join("/");
  console.log(`\n== ${page}：手機效能 ${Math.round(med.categories.performance.score * 100)}（${runs.length} 次：${scores}）`);
  for (const k of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]) {
    const x = a[k];
    console.log(`  ${k}: ${k === "cumulative-layout-shift" ? x.numericValue.toFixed(3) : ms(x.numericValue)}（分 ${Math.round((x.score ?? 0) * 100)}）`);
  }
  const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
  if (lcpEl) console.log(`  LCP 元素：${lcpEl.snippet?.slice(0, 160)}`);
  const phases = a["largest-contentful-paint-element"]?.details?.items?.[1]?.items;
  if (phases) console.log(`  LCP 分段：${phases.map((p) => `${p.phase} ${ms(p.timing)}`).join("，")}`);
  const ops = Object.values(a).filter((x) => x.details && (x.details.type === "opportunity" || x.scoreDisplayMode === "metricSavings") && x.score !== null && x.score < 1);
  for (const x of ops.slice(0, 14)) {
    const sav = x.metricSavings ? Object.entries(x.metricSavings).filter(([, v]) => v).map(([k, v]) => `${k} ${ms(v)}`).join(" ") : "";
    console.log(`  - ${x.id}：${x.title}${x.displayValue ? `（${x.displayValue}）` : ""}${sav ? ` [${sav}]` : ""}`);
    const items = (x.details.items || []).slice(0, 4);
    for (const it of items) {
      const u = it.url || it.node?.snippet || it.source?.url || it.label || "";
      const extra = ["wastedBytes", "totalBytes", "wastedMs", "duration", "transferSize"].filter((k) => it[k]).map((k) => `${k}=${Math.round(it[k])}`).join(" ");
      if (u || extra) console.log(`      · ${String(u).slice(0, 150)} ${extra}`);
    }
  }
  const req = a["network-requests"]?.details?.items || [];
  const kb = req.reduce((n, r) => n + (r.transferSize || 0), 0) / 1024;
  console.log(`  請求 ${req.length} 個，共 ${kb.toFixed(0)}KB；JS ${req.filter((r) => r.resourceType === "Script").length} 個 ${(req.filter((r) => r.resourceType === "Script").reduce((n, r) => n + r.transferSize, 0) / 1024).toFixed(0)}KB；CSS ${(req.filter((r) => r.resourceType === "Stylesheet").reduce((n, r) => n + r.transferSize, 0) / 1024).toFixed(0)}KB；圖 ${(req.filter((r) => r.resourceType === "Image").reduce((n, r) => n + r.transferSize, 0) / 1024).toFixed(0)}KB`);
  const mt = a["mainthread-work-breakdown"]?.details?.items?.map((i) => `${i.groupLabel} ${ms(i.duration)}`).slice(0, 5).join("，");
  if (mt) console.log(`  主線程：${mt}`);
}
