import { SITE } from "@/config/site";

/**
 * 作品案例：只放工坊真實做過、客人同意公開嘅作品。
 * 每加一件，首頁「作品案例」同 /cases 頁會自動出現；冇作品時首頁唔顯示呢段。
 * 相片放 public/images/cases/，每件最少一張，建議正方形 1200×1200。
 * 唔好用 AI 圖或者 3D 示意圖做案例相。
 */
export type Case = {
  slug: string;
  /** 一句講晒，例如「1.5 卡橢圓形求婚戒指」 */
  title: string;
  /** 例如「求婚戒指」「結婚對戒」「耳環」 */
  type: string;
  /** 主石：例如「1.52 卡 橢圓 E VS1，IGI 證書」 */
  stone: string;
  /** 金屬：例如「18K 白金」「Pt950」 */
  metal: string;
  /** 價錢區間，例如「HK$1.2–1.5 萬」；唔想公開就留空 */
  priceRange?: string;
  /** 由落單到交貨，例如「約 3 星期」 */
  duration?: string;
  /** 客人嘅要求同師傅點做，兩三句 */
  story: string;
  images: { src: string; alt: string }[];
  /** 完成日期 YYYY-MM */
  date: string;
  /** 客人已同意公開相片同資料 */
  consent: true;
};

const REAL_CASES: Case[] = [];

/**
 * 示例作品：SITE.demo = true 而且未有真實作品時顯示，用嚟睇全站效果。
 * 相片係 AI 示意圖，所有規格都係「待填」，唔係真實作品。換真作品之後會自動消失。
 */
const DEMO_CASES: Case[] = [
  {
    slug: "demo-oval",
    title: "橢圓形求婚戒指",
    type: "求婚戒指",
    stone: "卡數、形狀、顏色、淨度、證書（待填）",
    metal: "金屬及成色（待填）",
    priceRange: "價錢區間（待填）",
    duration: "工期（待填）",
    story: "呢度寫客人嘅要求同師傅點做，兩三句就得。例如客人想要乜嘢款、有咩顧慮、最後點樣解決。",
    images: [{ src: "/images/renders/ring-oval-pale.webp", alt: "示例作品圖：橢圓主石戒指（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-halo",
    title: "玫瑰金光環戒指",
    type: "求婚戒指",
    stone: "卡數、形狀、顏色、淨度、證書（待填）",
    metal: "金屬及成色（待填）",
    priceRange: "價錢區間（待填）",
    duration: "工期（待填）",
    story: "價錢同工期可以留空；留空就唔顯示。",
    images: [{ src: "/images/renders/halo-rg-pale.webp", alt: "示例作品圖：光環戒指（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-band",
    title: "排鑽結婚對戒",
    type: "結婚對戒",
    stone: "碎鑽數量及總卡數（待填）",
    metal: "金屬及成色（待填）",
    duration: "工期（待填）",
    story: "每件作品最少一張真實相片，最好有戴喺手上嘅相。",
    images: [{ src: "/images/renders/band-rg-steel.webp", alt: "示例作品圖：排鑽戒指（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-pendant",
    title: "單鑽吊墜",
    type: "吊墜項鏈",
    stone: "卡數、形狀、顏色、淨度、證書（待填）",
    metal: "金屬及成色（待填）",
    priceRange: "價錢區間（待填）",
    story: "可以寫埋送禮場合，例如周年、生日。",
    images: [{ src: "/images/renders/pendant-yg-white.webp", alt: "示例作品圖：單鑽吊墜（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-bracelet",
    title: "網球手鏈",
    type: "手鏈",
    stone: "鑽石數量及總卡數（待填）",
    metal: "金屬及成色（待填）",
    duration: "工期（待填）",
    story: "手鏈可以寫埋長度同扣款。",
    images: [{ src: "/images/renders/bracelet-steel.webp", alt: "示例作品圖：網球手鏈（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-princess",
    title: "公主方形單石戒指",
    type: "求婚戒指",
    stone: "卡數、形狀、顏色、淨度、證書（待填）",
    metal: "金屬及成色（待填）",
    priceRange: "價錢區間（待填）",
    duration: "工期（待填）",
    story: "呢度寫客人嘅要求同師傅點做。",
    images: [{ src: "/images/renders/princess-wg-white.webp", alt: "示例作品圖：公主方形戒指（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
];

export const isDemoCases = REAL_CASES.length === 0 && SITE.demo;
export const CASES: Case[] = isDemoCases ? DEMO_CASES : REAL_CASES;
