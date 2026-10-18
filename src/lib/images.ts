/**
 * 首飾示意圖：有 480／800px 小圖的檔案，自動提供 srcset，手機按槽寬揀細圖。
 * 小圖由 2026-10-17 圖片包提供（manifest.json），檔名加 -480 / -800 後綴。
 */
const RESPONSIVE = new Set([
  "ring-oval-pale",
  "bracelet-steel",
  "pendant-yg-white",
  "band-rg-steel",
  "halo-rg-pale",
  "macro-ink",
  "solitaire-yg-steel",
  "princess-wg-white",
  "carat-size-round-cover",
]);

/** 原圖闊度：手鏈 1400，分享封面 1200，其他 1000 */
const FULL_WIDTH: Record<string, number> = { "bracelet-steel": 1400, "carat-size-round-cover": 1200 };

export function srcSetFor(src: string) {
  const m = src.match(/^(.*\/)([^/]+)\.webp$/);
  if (!m) return undefined;
  const [, dir, name] = m;
  if (!RESPONSIVE.has(name)) return undefined;
  const full = FULL_WIDTH[name] ?? 1000;
  return `${dir}${name}-480.webp 480w, ${dir}${name}-800.webp 800w, ${src} ${full}w`;
}

/** 方便喺 <img> 上展開：src、srcSet、sizes */
export function imgProps(src: string, sizes: string) {
  const srcSet = srcSetFor(src);
  return srcSet ? { src, srcSet, sizes } : { src };
}
