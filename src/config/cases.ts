import { SITE } from "@/config/site";

/**
 * 作品案例：只放工坊真實做過、客人同意公開嘅作品。
 *
 * 點樣加一件真作品：喺 REAL_CASES 加一項，揀好 category（見下面 CASE_CATEGORIES），
 * 相片放 public/images/cases/<slug>-1.webp、-2.webp……（建議正方形 1200×1200，最少一張，最好有一張戴喺手上）。
 * 加咗之後：首頁作品、/cases、分類頁、作品詳情頁、各章節同文章嘅「相關作品」全部自動更新。
 * 第一件真作品加入後，示例作品會自動全部消失。唔好用 AI 圖或者 3D 示意圖做真作品相。
 */

/** 分類次序按市場數據排：求婚戒指最多人訂，其次係耳環（近年升得最快），之後排鑽戒、吊墜、手鏈、對戒、改造 */
export const CASE_CATEGORIES = [
  {
    slug: "engagement-rings",
    name: "求婚戒指",
    intro: "培育鑽石最多人訂嘅首飾。由揀主石、戒托款式到手寸，按你嘅預算一隻一隻做。",
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
      { label: "第二章 價錢", href: "/price" },
    ],
  },
  {
    slug: "earrings",
    name: "耳環",
    intro: "單鑽耳釘最易襯，日日戴都唔誇張；亦可以做光環或者水滴形。兩粒石要配對顏色同大細。",
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "第二章 價錢", href: "/price" },
    ],
  },
  {
    slug: "eternity-rings",
    name: "排鑽戒",
    intro: "半圈或者全圈排鑽，可以單獨戴，亦可以同求婚戒疊戴。",
    guides: [
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第九章 保養", href: "/care" },
    ],
  },
  {
    slug: "pendants",
    name: "吊墜項鏈",
    intro: "單鑽吊墜最百搭，送禮唔使估手寸；鏈長同扣款都可以揀。",
    guides: [
      { label: "第八章 場景", href: "/occasions" },
      { label: "第四章 4C 選石", href: "/4c" },
    ],
  },
  {
    slug: "bracelets",
    name: "手鏈",
    intro: "網球手鏈一條排滿細鑽，按手腕度長短，扣位要做得穩。",
    guides: [
      { label: "第二章 價錢", href: "/price" },
      { label: "第九章 保養", href: "/care" },
    ],
  },
  {
    slug: "wedding-bands",
    name: "結婚對戒",
    intro: "兩隻一齊設計，闊窄、顏色可以各自揀，內圈可以刻字。",
    guides: [
      { label: "第六章 訂造流程", href: "/custom" },
      { label: "第八章 場景", href: "/occasions" },
    ],
  },
  {
    slug: "remake",
    name: "舊金改造",
    intro: "屋企嘅舊首飾、舊鑽，可以拆開重新設計成新款；點樣計，可以先問師傅。",
    guides: [{ label: "第六章 訂造流程", href: "/custom" }],
  },
] as const;

export type CategorySlug = (typeof CASE_CATEGORIES)[number]["slug"];

export type Case = {
  slug: string;
  category: CategorySlug;
  /** 一句講晒，例如「1.5 卡橢圓形求婚戒指」 */
  title: string;
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
  /** 第一張係封面；建議 3–5 張，最好有一張戴喺手上 */
  images: { src: string; alt: string }[];
  /** 完成日期 YYYY-MM */
  date: string;
  /** 客人已同意公開相片同資料 */
  consent: true;
};

const REAL_CASES: Case[] = [];

/* ---------- 示例作品（SITE.demo = true 而且未有真作品時顯示） ----------
 * 相片係 AI 示意圖或者 3D 示意圖，規格全部「待填」，唔係真實作品。 */
const R = "/images/renders";
const D = "/images/cases-demo";
const AI = "（AI 示意圖，非真實作品）";
const CG = "（3D 示意圖，非真實作品）";
const STORY = {
  ring: "呢度寫客人嘅要求同師傅點做，兩三句就得：例如預算幾多、想要咩形狀、手指粗幼，最後點揀石同戒托。",
  ear: "可以寫兩粒石點樣配對顏色同大細、耳針定耳迫，同埋戴落嘅感覺。",
  band: "可以寫排鑽數量、半圈定全圈，同埋點樣同求婚戒疊戴。",
  pendant: "可以寫送禮場合（周年、生日），同埋鏈長、扣款點揀。",
  bracelet: "可以寫手腕尺寸、扣款同安全扣，同埋點樣保養。",
  pair: "可以寫兩隻點樣配搭、內圈刻咗咩字。",
  remake: "可以寫原本係咩首飾、點拆、點重新設計，前後對比相最有說服力。",
};
const demo = (
  slug: string,
  category: CategorySlug,
  title: string,
  img: string,
  alt: string,
  stone: string,
  metal: string,
  story: string,
): Case => ({
  slug,
  category,
  title,
  stone,
  metal,
  priceRange: "價錢區間（待填）",
  duration: "工期（待填）",
  story,
  images: [{ src: img, alt: `示例作品圖：${alt}` }],
  date: "2026-10",
  consent: true,
});

const DEMO_CASES: Case[] = [
  // 求婚戒指：橢圓同圓形最受歡迎，黃金比例上升
  demo("oval-solitaire", "engagement-rings", "橢圓單石求婚戒指", `${R}/ring-oval-pale.webp`, `橢圓主石單石戒指${AI}`, "橢圓主石（卡數、顏色、淨度、證書待填）", "白色金屬（成色待填）", STORY.ring),
  demo("round-solitaire-yg", "engagement-rings", "圓形單石求婚戒指・黃金", `${R}/solitaire-yg-steel.webp`, `黃金色圓形單石戒指${AI}`, "圓形主石（卡數、顏色、淨度、證書待填）", "黃金（成色待填）", STORY.ring),
  demo("round-halo-rg", "engagement-rings", "圓形光環求婚戒指・玫瑰金", `${R}/halo-rg-pale.webp`, `玫瑰金色光環戒指${AI}`, "圓形主石連光環碎鑽（待填）", "玫瑰金（成色待填）", STORY.ring),
  demo("princess-solitaire", "engagement-rings", "公主方單石求婚戒指", `${R}/princess-wg-white.webp`, `公主方形單石戒指${AI}`, "公主方主石（卡數、顏色、淨度、證書待填）", "白色金屬（成色待填）", STORY.ring),
  demo("round-six-prong", "engagement-rings", "圓形六爪求婚戒指", `${R}/macro-ink.webp`, `六爪圓形主石特寫${AI}`, "圓形主石（卡數、顏色、淨度、證書待填）", "白色金屬（成色待填）", STORY.ring),
  demo("round-halo-yg", "engagement-rings", "圓形光環求婚戒指・黃金", `${D}/halo-yg.webp`, `黃金色光環戒指${AI}`, "圓形主石連光環碎鑽（待填）", "黃金（成色待填）", STORY.ring),
  demo("round-solitaire-wg", "engagement-rings", "圓形單石求婚戒指・白色金屬", `${D}/solitaire-wg.webp`, `白色金屬圓形單石戒指${AI}`, "圓形主石（卡數、顏色、淨度、證書待填）", "白色金屬（成色待填）", STORY.ring),
  demo("round-solitaire-rg", "engagement-rings", "圓形單石求婚戒指・玫瑰金", `${D}/solitaire-rg.webp`, `玫瑰金色圓形單石戒指${AI}`, "圓形主石（卡數、顏色、淨度、證書待填）", "玫瑰金（成色待填）", STORY.ring),
  demo("round-halo-wg", "engagement-rings", "圓形光環求婚戒指・白色金屬", `${D}/halo-wg.webp`, `白色金屬光環戒指${AI}`, "圓形主石連光環碎鑽（待填）", "白色金屬（成色待填）", STORY.ring),
  // 耳環
  demo("round-studs-yg", "earrings", "圓形單鑽耳釘・黃金", `${D}/studs-yg.webp`, `黃金色四爪圓形耳釘一對${AI}`, "一對圓形主石（每粒卡數、顏色待填）", "黃金（成色待填）", STORY.ear),
  demo("round-studs-wg", "earrings", "圓形單鑽耳釘・白色金屬", `${D}/studs-wg.webp`, `白色金屬四爪圓形耳釘一對${AI}`, "一對圓形主石（每粒卡數、顏色待填）", "白色金屬（成色待填）", STORY.ear),
  demo("round-studs-rg", "earrings", "圓形單鑽耳釘・玫瑰金", `${D}/studs-rg.webp`, `玫瑰金色四爪圓形耳釘一對${AI}`, "一對圓形主石（每粒卡數、顏色待填）", "玫瑰金（成色待填）", STORY.ear),
  // 排鑽戒
  demo("half-eternity-rg", "eternity-rings", "半圈排鑽戒・玫瑰金", `${R}/band-rg-steel.webp`, `玫瑰金色半圈排鑽戒指${AI}`, "排鑽數量及總卡數（待填）", "玫瑰金（成色待填）", STORY.band),
  demo("half-eternity-yg", "eternity-rings", "半圈排鑽戒・黃金", `${D}/band-yg.webp`, `黃金色半圈排鑽戒指${AI}`, "排鑽數量及總卡數（待填）", "黃金（成色待填）", STORY.band),
  demo("half-eternity-wg", "eternity-rings", "半圈排鑽戒・白色金屬", `${D}/band-wg.webp`, `白色金屬半圈排鑽戒指${AI}`, "排鑽數量及總卡數（待填）", "白色金屬（成色待填）", STORY.band),
  // 吊墜項鏈
  demo("round-pendant-yg", "pendants", "圓形單鑽吊墜・黃金", `${R}/pendant-yg-white.webp`, `黃金色四爪單鑽吊墜${AI}`, "圓形主石（卡數、顏色、淨度待填）", "黃金（成色待填），鏈長待填", STORY.pendant),
  demo("round-pendant-rg", "pendants", "圓形單鑽吊墜・玫瑰金", `${D}/pendant-rg.webp`, `玫瑰金色四爪單鑽吊墜${AI}`, "圓形主石（卡數、顏色、淨度待填）", "玫瑰金（成色待填），鏈長待填", STORY.pendant),
  demo("round-pendant-wg", "pendants", "圓形單鑽吊墜・白色金屬", `${D}/pendant-wg.webp`, `白色金屬四爪單鑽吊墜${AI}`, "圓形主石（卡數、顏色、淨度待填）", "白色金屬（成色待填），鏈長待填", STORY.pendant),
  // 手鏈
  demo("tennis-bracelet", "bracelets", "網球手鏈", `${R}/bracelet-steel.webp`, `白色金屬圓鑽網球手鏈${AI}`, "鑽石數量及總卡數（待填）", "白色金屬（成色待填），長度待填", STORY.bracelet),
  demo("tennis-bracelet-four-prong", "bracelets", "四爪網球手鏈", `${D}/bracelet-detail.webp`, `四爪圓鑽網球手鏈特寫${AI}`, "鑽石數量及總卡數（待填）", "白色金屬（成色待填），長度待填", STORY.bracelet),
  demo("tennis-bracelet-close", "bracelets", "細鏈網球手鏈", `${D}/bracelet-close-pale.webp`, `白色金屬網球手鏈${CG}`, "鑽石數量及總卡數（待填）", "白色金屬（成色待填），長度待填", STORY.bracelet),
  // 結婚對戒
  demo("pair-yg-wg", "wedding-bands", "排鑽對戒・黃金配白色金屬", `${D}/pair-yg-wg.webp`, `黃金色同白色金屬排鑽戒指一對${AI}`, "排鑽數量及總卡數（待填）", "黃金、白色金屬各一（成色待填）", STORY.pair),
  demo("pair-rg-wg", "wedding-bands", "排鑽對戒・玫瑰金配白色金屬", `${D}/pair-rg-wg.webp`, `玫瑰金色同白色金屬排鑽戒指一對${AI}`, "排鑽數量及總卡數（待填）", "玫瑰金、白色金屬各一（成色待填）", STORY.pair),
  demo("pair-yg-rg", "wedding-bands", "排鑽對戒・黃金配玫瑰金", `${D}/pair-yg-rg.webp`, `黃金色同玫瑰金色排鑽戒指一對${AI}`, "排鑽數量及總卡數（待填）", "黃金、玫瑰金各一（成色待填）", STORY.pair),
  // 舊金改造
  demo("remake-wax", "remake", "舊鑽重鑲：先出蠟版確認", `${R}/custom-ring-wax-ivory.webp`, `戒指蠟版同設計草圖${AI}`, "客人原有主石（待填）", "舊金折算／新金（待填）", STORY.remake),
  demo("remake-setting", "remake", "舊金改新戒托", `${D}/wax-steel.webp`, `綠色戒托蠟版${CG}`, "客人原有主石（待填）", "舊金折算／新金（待填）", STORY.remake),
  demo("remake-band", "remake", "舊戒改排鑽戒", `${D}/band-pt-pale.webp`, `白色金屬排鑽戒指${CG}`, "排鑽數量（待填）", "舊金折算／新金（待填）", STORY.remake),
];

export const isDemoCases = REAL_CASES.length === 0 && SITE.demo;
export const CASES: Case[] = isDemoCases ? DEMO_CASES : REAL_CASES;

/** 少過呢個數嘅分類先唔顯示，避免一撳入去得一兩件 */
export const MIN_CATEGORY = 3;

export function categoryOf(slug: string) {
  return CASE_CATEGORIES.find((c) => c.slug === slug);
}

/** 有足夠作品、可以顯示嘅分類（按市場數據次序） */
export function visibleCategories() {
  return CASE_CATEGORIES.map((c) => ({ ...c, count: CASES.filter((x) => x.category === c.slug).length })).filter((c) => c.count >= MIN_CATEGORY);
}

export function casesIn(category: string) {
  return CASES.filter((c) => c.category === category);
}

export function caseHref(c: Case) {
  return `/cases/${c.category}/${c.slug}`;
}

/** 按分類輪流揀，求婚戒指每輪多一件（佔大頭），用嚟做首頁同「相關作品」 */
export function mixed(categories: readonly string[] = CASE_CATEGORIES.map((c) => c.slug), limit = 12, exclude?: string) {
  const pools = categories.map((cat) => CASES.filter((c) => c.category === cat && c.slug !== exclude));
  const out: Case[] = [];
  for (let round = 0; out.length < limit && pools.some((p) => p.length); round++) {
    for (let i = 0; i < pools.length && out.length < limit; i++) {
      const take = categories[i] === "engagement-rings" ? 2 : 1;
      out.push(...pools[i].splice(0, Math.min(take, limit - out.length)));
    }
  }
  return out;
}

/** 每章配邊啲作品：講價錢、款式就配戒指；講保養就配手鏈、耳環等日日戴嘅 */
const CHAPTER_CASES: Record<string, string[]> = {
  basics: ["engagement-rings", "earrings", "pendants"],
  price: ["engagement-rings", "earrings", "bracelets"],
  certificate: ["engagement-rings", "earrings"],
  "4c": ["engagement-rings", "earrings", "pendants"],
  styles: ["engagement-rings", "eternity-rings", "earrings"],
  custom: ["remake", "engagement-rings", "wedding-bands"],
  choose: ["engagement-rings", "wedding-bands", "remake"],
  occasions: ["engagement-rings", "wedding-bands", "pendants"],
  care: ["bracelets", "eternity-rings", "earrings"],
};

export function casesForChapter(chapter: string, limit = 8) {
  return mixed(CHAPTER_CASES[chapter] ?? CASE_CATEGORIES.map((c) => c.slug), limit);
}
