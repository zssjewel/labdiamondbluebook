// 本地靜態伺服器（有 gzip 壓縮），模擬正式網站 Cloudflare 會壓縮 HTML、CSS、JS 嘅情況。
// 用法：node scripts/serve-gz.cjs <資料夾> <port>
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const [root, port] = [process.argv[2] || "out", Number(process.argv[3] || 8090)];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const cache = new Map();

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    let file = path.join(root, p);
    if (p.endsWith("/")) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end("not found");
    }
    const ext = path.extname(file);
    const type = TYPES[ext] || "application/octet-stream";
    const text = /^(text|application\/(javascript|json|xml)|image\/svg)/.test(type);
    const gz = text && /gzip/.test(req.headers["accept-encoding"] || "");
    let body = fs.readFileSync(file);
    if (gz) {
      if (!cache.has(file)) cache.set(file, zlib.gzipSync(body, { level: 9 }));
      body = cache.get(file);
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": body.length, ...(gz ? { "Content-Encoding": "gzip" } : {}) });
    res.end(body);
  })
  .listen(port);
