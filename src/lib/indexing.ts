import type { Metadata } from "next";
import { SITE } from "@/config/site";
import type { ContentMetadata } from "@/lib/content";

/**
 * 收錄規則（逐頁）：
 * - 未正式上線（SITE.launched = false）：全站 noindex，robots.txt 禁止抓取。上線時只改 site.ts 一個開關。
 * - 上線後：完成並經師傅核對嘅文章、有至少一篇核對文章嘅章節、首頁同說明頁可以收錄；
 *   初稿、未核對文章、空章節、未有作品嘅案例頁一律 noindex, follow，亦唔放入 sitemap。
 */
export function articleReady(meta: ContentMetadata) {
  return !meta.draft && Boolean(meta.verifiedDate);
}

export function robotsFor(ready: boolean): Metadata["robots"] {
  if (!SITE.launched) return { index: false, follow: false };
  return ready ? { index: true, follow: true } : { index: false, follow: true };
}
