import { CHAPTER_SLUGS } from "@/config/chapters";

/** 頁頭的連結（目錄 + 三個最常用章節）。 */
export const HEADER_LINKS = [
  { label: "目錄", path: "/#contents" },
  { label: "價錢", path: "/price" },
  { label: "證書", path: "/certificate" },
  { label: "訂造流程", path: "/custom" },
] as const;

/** 有文章的欄目，與 content/zh-hk/ 下的資料夾同名。 */
export const CONTENT_TYPES: string[] = [...CHAPTER_SLUGS];
