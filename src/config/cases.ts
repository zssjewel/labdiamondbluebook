import { SITE } from "@/config/site";

/**
 * 作品案例：只放工坊真實做過、客人同意公開嘅作品。
 *
 * 點樣加一件真作品：喺 REAL_CASES 加一項，揀好 category（見下面 CASE_CATEGORIES），
 * 相片放 public/images/cases/<slug>-1.webp、-2.webp……（正方形 1000×1000，另出 -480、-800 細版；由作品上線流水線出圖）。
 * 文案按流水線《上架标准.md》寫：seoTitle、description、specs、sections、faq、guides。
 * 加咗之後：首頁作品、/cases、分類頁、作品詳情頁、各章節同文章嘅「相關作品」全部自動更新。
 * 預覽期真作品排前、示例補位；SITE.demo 改 false 之後示例作品全部消失。
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
  /** 第一張係封面；戴喺手上嗰張標 worn: true（首頁同列表滑鼠移上去會換成呢張） */
  images: { src: string; alt: string; worn?: true }[];
  /** 完成日期 YYYY-MM */
  date: string;
  /** 客人已同意公開相片同資料 */
  consent: true;
  /** 示例作品（AI 或 3D 示意圖、規格待填）；真作品唔使填 */
  demo?: true;
  /* ---- 以下按《作品上架標準》填（流水線 上架标准.md），真作品建議全部填 ---- */
  /** 作品頁大標題（可以長過卡片標題，帶「培育鑽石」），唔填就用 title */
  h1?: string;
  /** 搜尋結果標題（32 字內），唔填就用 title */
  seoTitle?: string;
  /** 搜尋結果描述（70–80 字，一句講晒） */
  description?: string;
  /** 規格表，一行一項；有就取代 stone / metal 嗰幾行 */
  specs?: [string, string][];
  /** 正文段落：每段一個小標題 */
  sections?: { h: string; p?: string[]; list?: [string, string][] }[];
  /** 常見問題：問題帶呢件嘅規格，答案第一句直接答 */
  faq?: { q: string; a: string; link?: { label: string; href: string } }[];
  /** 實拍影片（YouTube）：作品相第 2 格，撳先載入；poster 係影片截圖（正方形，放 public/images/cases/<slug>-video.webp） */
  video?: { youtubeId: string; poster: string; uploadDate: string; duration: string; seconds: number };
  /** 相關章節；唔填就用分類預設 */
  guides?: { label: string; href: string }[];
};

const REAL_CASES: Case[] = [
  {
    slug: "pear-halo-3-09ct-18k-white-gold",
    category: "engagement-rings",
    title: "3.09 卡梨形光環求婚戒指・18K 白金",
    h1: "3.09 卡梨形培育鑽石求婚戒指・碎鑽光環",
    seoTitle: "3.09卡梨形培育鑽石求婚戒指｜E VS1・18K白金",
    description: "3.09 卡梨形培育鑽石求婚戒指：E 色 VS1，IGI 證書，18K 白金碎鑽光環戒托。鄒三山工坊港工師傅喺東莞訂造，約 10 日完成，可以 WhatsApp 問類似款報價。",
    stone: "3.09 卡 梨形 E VS1，IGI 證書",
    metal: "18K 白金",
    duration: "約 10 日",
    story: "呢隻係 3.09 卡梨形培育鑽石求婚戒指：主石 E 色、VS1，拋光同對稱都係 Excellent，附 IGI 證書；外圍一圈碎鑽光環，戒臂再排一行微鑲，金屬用 18K 白金。由鄒三山工坊港工師傅喺東莞廠房訂造，由落單到完成約 10 日。",
    specs: [
      ["主石", "培育鑽石，梨形，3.09 卡"],
      ["顏色淨度", "E 色，VS1"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["證書", "IGI"],
      ["鑲法", "主石一圈碎鑽光環，戒臂單排微鑲"],
      ["金屬", "18K 白金"],
      ["工期", "約 10 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "梨形鑽石一頭圓、一頭尖，戴落手會令手指睇落修長。呢隻用光環戒托：主石外面圍一圈碎鑽，令主石輪廓更清楚，遠睇面積亦會大啲；戒臂再排一行微鑲，由正面到側面都有閃光，唔會淨係得粒主石。",
          "主石揀 E 色，屬於無色級，鑲喺白金上面唔會睇到偏黃；VS1 嘅內含物要用放大鏡先睇到，肉眼睇唔出。3 卡以上嘅梨形石，顏色同淨度值得揀高啲，因為石面大，底色同瑕疵都比細石容易被睇到。",
        ],
      },
      {
        h: "戴喺手上有幾大",
        p: ["3 卡左右嘅梨形鑽石，按一般比例估算大約 12 × 8 毫米（實際以證書尺寸為準），戴喺無名指上差唔多遮住手指一半闊度，加埋光環會再大一圈。尖頭向指甲方向係最常見嘅戴法，手指會顯得長啲。"],
      },
      {
        h: "揀呢款要諗嘅嘢",
        list: [
          ["尖位保護", "梨形最脆弱係尖嗰頭，訂造時要確認尖位有爪包住。"],
          ["光環碎鑽", "碎鑽多，日常勾衫機會比單石戒高少少；建議半年到一年俾師傅檢查一次爪位，順便清洗。"],
          ["疊戴", "光環戒托比較闊，想之後配結婚戒疊戴，落單時同師傅講，可以預留位置。"],
        ],
      },
    ],
    faq: [
      { q: "3 卡梨形培育鑽石戴喺手上有幾大？", a: "大約 12 × 8 毫米，差唔多遮住無名指一半闊度。梨形同卡數通常比圓形睇落大，加光環會再大一圈。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "E 色 VS1 嘅培育鑽石值唔值得揀？", a: "3 卡呢個大小值得。E 色屬於無色級，VS1 肉眼睇唔到內含物；石面大嘅時候，顏色同淨度揀低咗會比細石明顯。預算有限可以考慮 F 至 G 色、VS2，肉眼分別唔大。", link: { label: "第四章 4C 選石", href: "/4c" } },
      { q: "梨形鑽石嘅尖位會唔會易崩？", a: "尖位係梨形最容易受撞嘅位置，所以戒托一定要有爪包住尖頭。訂造前可以叫師傅俾相或者影片你睇清楚尖位點鑲。" },
      { q: "3 卡梨形培育鑽石戒指大概幾錢？", a: "主要睇主石顏色、淨度、證書，同戒托用金量、碎鑽數量。呢件價錢唔公開；同規格最新報價可以 WhatsApp 問師傅。", link: { label: "第二章 價錢", href: "/price" } },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。每隻都係按客人預算、手寸同喜好訂造，所以唔會完全一樣；卡數、顏色、金屬同光環款式都可以改。" },
    ],
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第三章 證書", href: "/certificate" },
    ],
    images: [
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-1.webp", alt: "3.09 卡梨形培育鑽石求婚戒指正面，18K 白金碎鑽光環戒托" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-2.webp", alt: "梨形主石同一圈碎鑽光環特寫" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-3.webp", alt: "3.09 卡梨形培育鑽石求婚戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-4.webp", alt: "戴黑手套嘅手指拎住梨形鑽石戒指，睇到戒托高度同戒臂微鑲" },
    ],
    date: "2026-09",
    consent: true,
  },
];

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
  demo: true,
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

/** 預覽期（SITE.demo）：真作品排前，示例作品補位，等每個分類都夠件數顯示；正式上線（demo = false）就淨係真作品 */
export const CASES: Case[] = SITE.demo ? [...REAL_CASES, ...DEMO_CASES] : REAL_CASES;
/** 仲有冇示例作品喺度（列表頁顯示「示例」提示、唔俾收錄） */
export const isDemoCases = CASES.some((c) => c.demo);

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
