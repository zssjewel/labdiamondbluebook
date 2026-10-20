// 構建後處理：將 Next.js 嘅程式（_next/static/chunks/*.js）由「開頁即刻下載」改為「頁面載完先下載」。
// 原因：所有內容同首屏動效（CSS）都已經喺 HTML 入面，程式只負責互動同碌動動效；
// 程式遲少少載，手機首屏（尤其慢網絡）唔使同 HTML、CSS、首屏相搶頻寬同 CPU。畫面同動效完全唔變。
// 時間：load 之後等首屏畫完（兩個 animation frame）再隔 0.3 秒先開始下載程式。
// 用法：node scripts/defer-js.cjs out
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "out";
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html")) files.push(p);
  }
})(root);

const SCRIPT = /<script\b([^>]*?)\bsrc="(\/_next\/static\/[^"]+\.js)"([^>]*)><\/script>/g;
const PRELOAD = /<link rel="preload" as="script"[^>]*href="\/_next\/static\/[^"]+"[^>]*\/?>/g;
const CSSLINK = /<link rel="stylesheet" href="(\/_next\/static\/css\/[^"]+\.css)"[^>]*\/?>/g;
let changed = 0;
let inlined = 0;
for (const f of files) {
  let html = fs.readFileSync(f, "utf8");
  if (html.includes("data-defer-js")) continue;
  const list = [];
  html = html.replace(SCRIPT, (m, a, src, b) => {
    const attrs = a + " " + b;
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    list.push([src, /noModule/i.test(attrs) ? 1 : 0, id || ""]);
    return "";
  });
  if (!list.length) continue;
  html = html.replace(PRELOAD, "");
  // 主樣式表直接內嵌入 HTML：手機開頁少一個來回（慢網絡下首屏快 0.2–0.3 秒），樣式內容完全一樣
  html = html.replace(CSSLINK, (m, href) => {
    const file = path.join(root, href);
    if (!fs.existsSync(file)) return m;
    let css = fs.readFileSync(file, "utf8").replace(/url\((['"]?)\.\.\/media\//g, "url($1/_next/static/media/").replace(/<\/style/gi, "<\\/style");
    inlined++;
    return `<style data-inline-href="${href}">${css}</style>`;
  });
  const loader =
    `<script data-defer-js>(function(){var s=${JSON.stringify(list)};function go(){s.forEach(function(x){var e=document.createElement("script");e.src=x[0];e.async=true;if(x[1])e.noModule=true;if(x[2])e.id=x[2];document.body.appendChild(e)})}` +
    `function later(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(go,300)})})}if(document.readyState==="complete")later();else addEventListener("load",later,{once:true})})()</script>`;
  html = html.replace("</body>", loader + "</body>");
  fs.writeFileSync(f, html);
  changed++;
}
console.log(`defer-js：${changed}/${files.length} 個 HTML 改為頁面載完先載程式，內嵌樣式表 ${inlined} 次`);
