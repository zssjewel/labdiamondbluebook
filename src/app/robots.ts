import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// 上線前禁止收錄；正式上線時改回 allow: "/"
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labdiamondbluebook.com";
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
