import type { MetadataRoute } from "next";
import { CHAPTER_SLUGS } from "@/config/chapters";
import { SITE, localizeHref } from "@/config/site";
import { routing } from "@/i18n/routing";
import { CASES, isDemoCases } from "@/config/cases";
import { getAllContent } from "@/lib/content";
import { articleReady } from "@/lib/indexing";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const add = (pathname: string, lastModified?: string, priority = 0.6) => {
      const url = `${SITE.url}${localizeHref(pathname, locale)}`;
      entries.push({
        url,
        ...(lastModified ? { lastModified } : {}),
        priority,
        alternates: { languages: { [SITE.htmlLang]: url } },
      });
    };
    add("/", undefined, 1);
    // 只列可收錄嘅頁：核對完成嘅文章，同有核對文章嘅章節；初稿同空章節唔列
    for (const slug of CHAPTER_SLUGS) {
      const ready = (await getAllContent(slug, locale)).filter((i) => articleReady(i.metadata));
      if (ready.length === 0) continue;
      add(`/${slug}`, ready[0].metadata.lastModified ?? ready[0].metadata.date, 0.8);
      for (const item of ready) add(`/${slug}/${item.slug}`, item.metadata.lastModified ?? item.metadata.date, 0.7);
    }
    if (CASES.length > 0 && !isDemoCases) add("/cases", undefined, 0.6);
    add("/about", undefined, 0.4);
    add("/privacy-policy", undefined, 0.2);
    add("/terms-of-service", undefined, 0.2);
  }
  return entries;
}
