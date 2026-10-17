import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export const dynamic = "force-static";

// 正式上線前禁止收錄；上線時把 src/config/site.ts 的 launched 改為 true
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", ...(SITE.launched ? { allow: "/" } : { disallow: "/" }) }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
