import fs from "fs";
import path from "path";
import { CHAPTERS } from "@/config/chapters";
import { CONTENT_TYPES as CONFIG_CONTENT_TYPES } from "@/config/navigation";
import { routing, type Locale } from "@/i18n/routing";

export const CONTENT_TYPES = CONFIG_CONTENT_TYPES;

export { headingId } from "@/lib/heading";
import { headingId } from "@/lib/heading";

/** 文件名轉網址 slug。網址只用英文，所以 MDX 文件名一律用英文小寫加連字號。 */
export function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/\.mdx$/, "")
    .replace(/[^a-zA-Z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findFileBySlug(dir: string, slug: string, basePath: string[] = []): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const result = findFileBySlug(fullPath, slug, [...basePath, entry.name]);
      if (result) return result;
    } else if (entry.name.endsWith(".mdx")) {
      const fileName = entry.name.replace(".mdx", "");
      if ([...basePath, fileNameToSlug(fileName)].join("/") === slug) {
        return [...basePath, fileName].join("/");
      }
    }
  }
  return null;
}

/** 與 MDX 文件裡 export const metadata 對應 */
export interface ContentMetadata {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  image?: string;
  summary?: string;
  /** 初稿：頁面顯示「待師傅核對」提示 */
  draft?: boolean;
  /** false：唔顯示文章題圖（例如正文開頭已經有互動圖） */
  cover?: boolean;
  /** 封面／分享圖嘅替代文字同尺寸（冇填就用 1000×1000） */
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** 示例大綱：只有結構、未有正文 */
  placeholder?: boolean;
  /** 作者署名，未填時用編著者（鄒三山工坊） */
  author?: string;
  /** 師傅核對人和日期；未填即「待核對」 */
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface ContentItem {
  slug: string;
  segments: string[];
  contentType: string;
  locale: Locale;
  metadata: ContentMetadata;
}

export type ContentData = ContentItem & {
  MDXContent: React.ComponentType;
  headings: Heading[];
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** 從 MDX 原文抽出 ## 和 ### 標題，用於文章目錄 */
function extractHeadings(mdxSource: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of mdxSource.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const text = match[2].replace(/\{[^}]*\}/g, "").trim();
      headings.push({ id: headingId(text), text, level: match[1].length });
    }
  }
  return headings;
}

function getSlugsFromDirectory(dir: string, basePath: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];
  const paths: string[][] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...getSlugsFromDirectory(fullPath, [...basePath, entry.name]));
    } else if (entry.name.endsWith(".mdx")) {
      paths.push([...basePath, fileNameToSlug(entry.name.replace(".mdx", ""))]);
    }
  }
  return paths;
}

/** 一個欄目下的全部文章，按更新日期新到舊排 */
export async function getAllContent(contentType: string, language: Locale): Promise<ContentItem[]> {
  const contentDir = path.join(CONTENT_ROOT, language, contentType);
  const items = await Promise.all(
    getSlugsFromDirectory(contentDir).map(async (segments) => {
      const slug = segments.join("/");
      try {
        const realSlug = findFileBySlug(contentDir, slug) || slug;
        const mod = await import(`../../content/${language}/${contentType}/${realSlug}.mdx`);
        return { slug, segments, contentType, locale: language, metadata: mod.metadata as ContentMetadata } satisfies ContentItem;
      } catch {
        return null;
      }
    }),
  );
  return items
    .filter((item): item is ContentItem => Boolean(item))
    .sort((a, b) => (b.metadata.lastModified || b.metadata.date).localeCompare(a.metadata.lastModified || a.metadata.date));
}

export async function getAllArticles(language: Locale): Promise<ContentItem[]> {
  const all: ContentItem[] = [];
  for (const contentType of CONTENT_TYPES) all.push(...(await getAllContent(contentType, language)));
  return all.sort((a, b) => (b.metadata.lastModified || b.metadata.date).localeCompare(a.metadata.lastModified || a.metadata.date));
}

export async function getContent(contentType: string, slugSegments: string[], language: Locale): Promise<ContentData | null> {
  const currentSlug = slugSegments.join("/");
  const contentDir = path.join(CONTENT_ROOT, language, contentType);
  try {
    const realSlug = findFileBySlug(contentDir, currentSlug) || currentSlug;
    const mdxPath = path.join(contentDir, `${realSlug}.mdx`);
    const { default: MDXContent, metadata } = await import(`../../content/${language}/${contentType}/${realSlug}.mdx`);
    return {
      slug: currentSlug,
      segments: slugSegments,
      contentType,
      locale: language,
      metadata: metadata as ContentMetadata,
      MDXContent,
      headings: extractHeadings(fs.readFileSync(mdxPath, "utf-8")),
    };
  } catch {
    return null;
  }
}

/** 全部文章路徑，用於 generateStaticParams 和 sitemap */
export async function getAllContentPaths(language: Locale = routing.defaultLocale) {
  const localeDir = path.join(CONTENT_ROOT, language);
  if (!fs.existsSync(localeDir)) return [];
  return fs
    .readdirSync(localeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && CONTENT_TYPES.includes(entry.name))
    .flatMap((entry) =>
      getSlugsFromDirectory(path.join(localeDir, entry.name)).map((slug) => ({ contentType: entry.name, slug })),
    );
}

/**
 * 全書順序：按九章的次序，章內按 chapters.ts 的 topics 次序，未列入 topics 的排在該章最後。
 * 用於上一篇／下一篇、全書目錄。
 */
export async function getBookOrder(language: Locale): Promise<ContentItem[]> {
  const ordered: ContentItem[] = [];
  for (const chapter of CHAPTERS) {
    const items = await getAllContent(chapter.slug, language);
    const rank = (title: string) => {
      const i = chapter.topics.indexOf(title);
      return i === -1 ? 999 : i;
    };
    ordered.push(...[...items].sort((a, b) => rank(a.metadata.title) - rank(b.metadata.title)));
  }
  return ordered;
}
