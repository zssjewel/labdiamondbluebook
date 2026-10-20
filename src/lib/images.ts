/**
 * 首飾示意圖：有細圖嘅檔案，自動提供 srcset，手機按槽寬揀細圖。
 * 2026-10-17 圖片包：-480 / -800；2026-10-18 章節圖包：-480 / -720。
 * 2026-10-20：刊頭拼貼用嘅幾張加 -320（手機格仔只有約 140px 闊，唔使下載 480）。
 */
const SMALL_WIDTHS: Record<string, number[]> = {
  "ring-oval-pale": [320, 480, 800],
  "bracelet-steel": [480, 800],
  "pendant-yg-white": [320, 480, 800],
  "band-rg-steel": [320, 480, 800],
  "halo-rg-pale": [320, 480, 800],
  "macro-ink": [320, 480, 800],
  "solitaire-yg-steel": [320, 480, 800],
  "princess-wg-white": [320, 480, 800],
  "carat-size-round-cover": [480, 800],
  "certificate-verification-ivory": [480, 720],
  "custom-ring-wax-ivory": [480, 720],
  // 2026-10-19：其餘章節圖補細版
  "princess-macro-white": [480, 800],
  "stud-wg-blue": [480, 800],
  "oval-pt-ink": [480, 800],
  "bracelet-close-pale": [480, 800],
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

/** 章節圖嘅 16:9 裁切版（同 CSS 置中裁切一模一樣），用做文章題圖：唔使為咗一張橫圖下載成張正方形 */
const WIDE = new Set([
  "macro-ink",
  "princess-wg-white",
  "certificate-verification-ivory",
  "princess-macro-white",
  "halo-rg-pale",
  "custom-ring-wax-ivory",
  "stud-wg-blue",
  "oval-pt-ink",
  "bracelet-close-pale",
]);

export function coverProps(src: string, sizes: string) {
  const m = src.match(/^(.*\/)([^/]+)\.webp$/);
  if (!m || !WIDE.has(m[2])) return { ...imgProps(src, sizes), wide: false };
  const [, dir, name] = m;
  return { src: `${dir}${name}-wide-1000.webp`, srcSet: `${dir}${name}-wide-640.webp 640w, ${dir}${name}-wide-1000.webp 1000w`, sizes, wide: true };
}
