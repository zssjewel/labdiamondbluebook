import type { MetadataRoute } from "next";
import { CHAPTER_SLUGS } from "@/config/chapters";
import { SITE, localizeHref } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getAllContent } from "@/lib/content";

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
    for (const slug of CHAPTER_SLUGS) {
      const items = await getAllContent(slug, locale);
      add(`/${slug}`, items[0]?.metadata.lastModified ?? items[0]?.metadata.date, 0.8);
      for (const item of items) add(`/${slug}/${item.slug}`, item.metadata.lastModified ?? item.metadata.date, 0.7);
    }
    add("/about", undefined, 0.4);
    add("/privacy-policy", undefined, 0.2);
    add("/terms-of-service", undefined, 0.2);
  }
  return entries;
}
