// 首頁作品分類「撳分類」逐格量度：頁面有冇上下跳、分類列有冇左右跳、卡片有冇上下郁、貨架高度有冇變。
// 用 WebKit（iPhone）同 Chromium（Android）各跑一次，另外試幾個對照組（關卡片進場、關膠囊動畫）。
// 用法：node scripts/tabs-probe.cjs http://localhost:8080 shots/tabs
const { chromium, webkit, devices } = require("playwright");
const fs = require("fs");

const base = process.argv[2] || "http://localhost:8080";
const out = process.argv[3] || "shots/tabs";
fs.mkdirSync(out, { recursive: true });

const VARIANTS = {
  現狀: "",
  舊做法郁li: ".bb-shelf__track[data-picked] > li { animation: bb-shelfin 620ms var(--ease-apple) both; animation-delay: calc(var(--n, 0) * 45ms); }",
  冇卡片進場: ".bb-shelf__track[data-picked] > li, .bb-shelf__track[data-picked] > li > .bb-shelf__card { animation: none !important; }",
};
const TAPS = ["耳環", "求婚戒指", "手鏈", "舊金改造", "所有產品"];

async function sample(page, ms) {
  return page.evaluate((ms) => new Promise((done) => {
    const works = document.querySelector(".bb-works");
    const track = works.querySelector(".bb-shelf__track");
    const seg = works.querySelector(".bb-seg");
    const ind = seg.querySelector(".bb-seg__ind");
    const rows = [];
    const t0 = performance.now();
    const tick = () => {
      const li = track.querySelector("li .bb-shelf__card");
      const lr = li ? li.getBoundingClientRect() : { top: 0, left: 0 };
      const sr = seg.getBoundingClientRect();
      rows.push({
        t: Math.round(performance.now() - t0),
        y: Math.round(scrollY * 10) / 10,
        works: Math.round(works.getBoundingClientRect().top * 10) / 10,
        segTop: Math.round(sr.top * 10) / 10,
        segX: Math.round(seg.scrollLeft * 10) / 10,
        segW: seg.scrollWidth,
        trackX: Math.round(track.scrollLeft * 10) / 10,
        trackH: Math.round(track.getBoundingClientRect().height * 10) / 10,
        liTop: Math.round(lr.top * 10) / 10,
        liLeft: Math.round(lr.left * 10) / 10,
        ind: getComputedStyle(ind).transform,
        docH: document.documentElement.scrollHeight,
      });
      if (performance.now() - t0 < ms) requestAnimationFrame(tick);
      else done(rows);
    };
    requestAnimationFrame(tick);
  }), ms);
}

// 一個數值喺取樣期間：變咗幾多次、最大最細、方向反轉幾多次（反轉＝抖）
function summary(rows, key) {
  const v = rows.map((r) => r[key]);
  let changes = 0, flips = 0, last = 0;
  for (let i = 1; i < v.length; i++) {
    const d = typeof v[i] === "number" ? v[i] - v[i - 1] : v[i] === v[i - 1] ? 0 : 1;
    if (d) {
      changes++;
      const s = Math.sign(d);
      if (typeof v[i] === "number" && last && s !== last) flips++;
      last = s;
    }
  }
  const nums = v.filter((x) => typeof x === "number");
  const span = nums.length ? Math.round((Math.max(...nums) - Math.min(...nums)) * 10) / 10 : "-";
  return { changes, flips, span };
}

(async () => {
  for (const [engine, type, dev] of [["WebKit iPhone 13", webkit, devices["iPhone 13"]], ["Chromium Pixel 7", chromium, devices["Pixel 7"]]]) {
    const browser = await type.launch();
    for (const [name, css] of Object.entries(VARIANTS)) {
      const video = name === "現狀";
      const ctx = await browser.newContext({ ...dev, ...(video ? { recordVideo: { dir: out, size: dev.viewport } } : {}) });
      const page = await ctx.newPage();
      await page.goto(base + "/index.html", { waitUntil: "load" });
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(2500);
      await page.evaluate(() => {
        const r = document.querySelector(".bb-works").getBoundingClientRect();
        window.scrollTo(0, scrollY + r.top - 60);
      });
      await page.waitForTimeout(1500);
      console.log(`\n== ${engine}｜${name} ==`);
      for (const tab of TAPS) {
        const btn = page.locator(".bb-works .bb-seg button", { hasText: tab });
        const p = sample(page, 1300);
        await page.waitForTimeout(60);
        await btn.tap();
        const rows = await p;
        const keys = ["y", "works", "segTop", "segX", "segW", "trackX", "trackH", "liTop", "liLeft", "ind", "docH"];
        const parts = keys.map((k) => {
          const s = summary(rows, k);
          return s.changes ? `${k} 變${s.changes}次${s.flips ? `／反轉${s.flips}次` : ""}${typeof s.span === "number" ? `／幅度${s.span}` : ""}` : null;
        }).filter(Boolean);
        const gaps = rows.slice(1).map((r, i) => r.t - rows[i].t);
        const long = gaps.filter((g) => g > 34).length;
        console.log(`撳「${tab}」：${rows.length} 格，掉格 ${long}；${parts.join("，") || "全部唔郁"}`);
        if (name === "現狀") fs.writeFileSync(`${out}/${engine.split(" ")[0]}-${tab}.json`, JSON.stringify(rows));
        await page.waitForTimeout(300);
      }
      const v = page.video();
      await ctx.close();
      if (v) fs.renameSync(await v.path(), `${out}/${engine.split(" ")[0]}.webm`);
    }
    await browser.close();
  }
})();
