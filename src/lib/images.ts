/**
 * 首飾示意圖：有細圖嘅檔案，自動提供 srcset，手機按槽寬揀細圖。
 * 2026-10-17 圖片包：-480 / -800；2026-10-18 章節圖包：-480 / -720。
 */
const SMALL_WIDTHS: Record<string, number[]> = {
  "ring-oval-pale": [480, 800],
  "bracelet-steel": [480, 800],
  "pendant-yg-white": [480, 800],
  "band-rg-steel": [480, 800],
  "halo-rg-pale": [480, 800],
  "macro-ink": [480, 800],
  "solitaire-yg-steel": [480, 800],
  "princess-wg-white": [480, 800],
  "carat-size-round-cover": [480, 800],
  "certificate-verification-ivory": [480, 720],
  "custom-ring-wax-ivory": [480, 720],
};

/** 原圖闊度：手鏈 1400，分享封面 1200，其他 1000 */
const FULL_WIDTH: Record<string, number> = { "bracelet-steel": 1400, "carat-size-round-cover": 1200 };

export function srcSetFor(src: string) {
  const m = src.match(/^(.*\/)([^/]+)\.webp$/);
  if (!m) return undefined;
  const [, dir, name] = m;
  // 示例作品圖：一律有 480、800 兩個細版
  const smalls = dir === "/images/cases-demo/" ? [480, 800] : SMALL_WIDTHS[name];
  if (!smalls) return undefined;
  const full = FULL_WIDTH[name] ?? 1000;
  return [...smalls.map((w) => `${dir}${name}-${w}.webp ${w}w`), `${src} ${full}w`].join(", ");
}

/** 方便喺 <img> 上展開：src、srcSet、sizes */
export function imgProps(src: string, sizes: string) {
  const srcSet = srcSetFor(src);
  return srcSet ? { src, srcSet, sizes } : { src };
}
