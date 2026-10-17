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
 * 只喺預覽截圖用嘅版面示例（NEXT_PUBLIC_CASES_DEMO=1），正式網站永遠唔會出現。
 * 用嚟睇排版，唔係真實作品。
 */
const DEMO_CASES: Case[] = [
  {
    slug: "demo-1",
    title: "版面示例：橢圓形求婚戒指",
    type: "版面示例（非真實作品）",
    stone: "示例文字",
    metal: "示例文字",
    priceRange: "示例文字",
    duration: "示例文字",
    story: "呢度會寫客人嘅要求同師傅點做。正式網站只會放工坊真實做過、經客人同意公開嘅作品。",
    images: [{ src: "/images/renders/ring-oval-pale.webp", alt: "版面示例（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-2",
    title: "版面示例：光環戒指",
    type: "版面示例（非真實作品）",
    stone: "示例文字",
    metal: "示例文字",
    story: "價錢同工期可以唔填；唔填就唔顯示。",
    images: [{ src: "/images/renders/halo-rg-pale.webp", alt: "版面示例（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "demo-3",
    title: "版面示例：網球手鏈",
    type: "版面示例（非真實作品）",
    stone: "示例文字",
    metal: "示例文字",
    duration: "示例文字",
    story: "每件最少一張真實相片。",
    images: [{ src: "/images/renders/pendant-yg-white.webp", alt: "版面示例（AI 示意圖，非真實作品）" }],
    date: "2026-10",
    consent: true,
  },
];

export const CASES: Case[] = process.env.NEXT_PUBLIC_CASES_DEMO === "1" && REAL_CASES.length === 0 ? DEMO_CASES : REAL_CASES;
