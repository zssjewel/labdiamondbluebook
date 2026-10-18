/**
 * 全站設定：站名、網址、編著者、WhatsApp。
 * 改這裡就會改全站，不要在各頁面寫死。
 */
export const SITE = {
  name: "培育鑽石藍皮書",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://labdiamondbluebook.com",
  publisher: "鄒三山工坊",
  /** WhatsApp 號碼（852 開頭、只填數字）。未填時，詢價按鈕會連到「關於本書」的聯絡段落。 */
  whatsapp: "",
  locale: "zh-hk",
  htmlLang: "zh-HK",
  /** 正式上線前為 false：robots.txt 禁止收錄、頁面加 noindex。 */
  launched: false,
  /**
   * 示例內容開關：true 時，未有真資料嘅位置都用「示例」填住（WhatsApp 按鈕、作品案例、師傅介紹、工坊資料、社交平台），
   * 方便睇全站效果。每個示例旁邊會有「示例」小標籤。換晒真資料之後改做 false。
   */
  demo: true,
  /** 師傅資料：填咗就會取代示例 */
  master: { name: "", title: "", bio: "", photo: "" },
  /** 工坊資料 */
  studio: { address: "", hours: "", booking: "" },
  /** 社交平台連結（完整網址） */
  social: { instagram: "", facebook: "", xiaohongshu: "" },
  homeTitle: "培育鑽石訂造攻略｜價錢、證書、4C、款式一本睇清 - 培育鑽石藍皮書",
  description:
    "培育鑽石同天然有咩分別？1 卡要幾錢？IGI 定 GIA 證書？由 4C、形狀、款式到訂造流程，鄒三山工坊老師傅將行內做法同報價水份一次講清。",
} as const;

export function localizeHref(href: string, locale: string = SITE.locale) {
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/#")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** 已經有真實聯絡號碼先顯示「WhatsApp 問師傅」；未有就如實寫「聯絡方式籌備中」，唔放假按鈕。 */
export const hasContact = Boolean(SITE.whatsapp) || SITE.demo;

/** 有真資料用真資料；冇就喺示例模式下用示例文字，否則留空 */
export function orDemo(value: string, demo: string) {
  if (value) return value;
  return SITE.demo ? demo : "";
}

/** WhatsApp 詢價連結，可預填一句話。 */
export function waHref(message?: string) {
  if (!SITE.whatsapp) return `${localizeHref("/about")}#contact`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${SITE.whatsapp}${text}`;
}

export function isExternal(href: string) {
  return href.startsWith("http");
}
