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
  /** 完成日期 YYYY-MM；唔知就唔填（規格表唔顯示「完成」） */
  date?: string;
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
  /** 標題下面一排重點規格（4–5 個，最重要嘅先） */
  highlights?: string[];
  /** 正文段落：每段一個小標題；list 會排成小卡；figure: "size" 喺段落後面加等比例尺寸圖 */
  sections?: { h: string; p?: string[]; list?: [string, string][]; figure?: "size" }[];
  /** 等比例尺寸圖（毫米，按一般比例估算） */
  sizeGuide?: { shape: "pear" | "oval" | "round" | "marquise"; stone: [number, number]; halo?: [number, number]; finger?: number; eastWest?: boolean; caption: string };
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
    highlights: ["3.09 卡", "E 色", "VS1", "IGI 證書", "18K 白金"],
    sizeGuide: {
      shape: "pear",
      stone: [12, 8],
      halo: [15, 11],
      finger: 17,
      caption: "按真實比例畫（尺上每格 1 毫米）：主石按一般比例估算約 12 × 8 毫米，加光環約 15 × 11 毫米；無名指以約 17 毫米闊計。實際尺寸以證書同你隻手為準。",
    },
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
        figure: "size",
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
    video: { youtubeId: "UNbgBSoXnAY", poster: "/images/cases/pear-halo-3-09ct-18k-white-gold-video.webp", uploadDate: "2026-10-21", duration: "PT21S", seconds: 21 },
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第三章 證書", href: "/certificate" },
    ],
    images: [
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-1.webp", alt: "3.09 卡梨形培育鑽石求婚戒指，18K 白金碎鑽光環戒托，戒臂單排鑲鑽" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-2.webp", alt: "3.09 卡梨形培育鑽石求婚戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-3.webp", alt: "梨形培育鑽石求婚戒指正面，梨形主石同一圈碎鑽光環" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-4.webp", alt: "梨形培育鑽石求婚戒指側面，見到戒頭高度、底托側邊碎鑽同戒臂鑲鑽" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-5.webp", alt: "由梨形圓頭嗰端睇戒托，見到爪、隱藏碎鑽同鏤空底托" },
      { src: "/images/cases/pear-halo-3-09ct-18k-white-gold-v2-6.webp", alt: "梨形主石同光環碎鑽近鏡特寫" },
    ],
    date: "2026-09",
    consent: true,
  },
  {
    slug: "three-flower-pear-necklace-18k-white-gold",
    category: "pendants",
    title: "三朵花梨形鑽項鏈・18K 白金",
    h1: "三朵花培育鑽石項鏈・梨形花瓣配馬眼鑽",
    seoTitle: "三朵花培育鑽石項鏈｜梨形鑽花瓣・馬眼鑽・18K白金",
    description: "三朵花培育鑽石項鏈：每朵六片梨形鑽花瓣圍住一粒圓鑽，鏈上配四鑽幸運草、馬眼鑽同小圓鑽，18K 白金。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "梨形、圓形、馬眼培育鑽石，D–E 色，VS–VVS",
    metal: "18K 白金",
    duration: "同類款式一般約 12–15 日",
    story: "呢條係三朵花培育鑽石項鏈：三朵花上二下一砌埋一齊，每朵用六片梨形鑽做花瓣、中間一粒圓鑽做花心；兩邊鏈上再有四鑽幸運草、馬眼鑽同小圓鑽，金屬係 18K 白金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["三朵花", "18 粒梨形鑽", "D–E 色", "VS–VVS", "18K 白金"],
    specs: [
      ["花朵", "三朵，上二下一；每朵六片梨形鑽花瓣，花心一粒圓鑽"],
      ["鏈上", "兩邊各有四鑽幸運草、馬眼鑽、小圓鑽"],
      ["顏色淨度", "D–E 色，VS–VVS"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["金屬", "18K 白金"],
      ["尺寸", "三朵花整體約 3 厘米闊（按相片估計）"],
      ["鏈長", "一般約 40–45 厘米，可按頸圍訂造"],
      ["工期", "同類款式一般約 12–15 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "三朵花唔係排成一行，而係上面兩朵、下面一朵，花瓣邊互相搭住少少，成個吊墜睇落似一束細花。每朵花用六片梨形鑽做花瓣，尖頭向住花心，中間一粒圓鑽，所以正面望落每朵都係一個完整嘅圓。",
          "條鏈唔係淨鏈：由花朵向上，兩邊順序有一組四粒圓鑽砌成嘅幸運草、一粒直放嘅馬眼鑽，再上去一粒小圓鑽，左右對稱。戴起嚟由鎖骨到頸側都有閃光，唔會淨係中間一點。",
        ],
      },
      {
        h: "戴喺頸上有幾大",
        p: ["三朵花整體大約 3 厘米闊（按相片估計），戴落會落喺鎖骨中間下面少少。鏈長一般揀 40 至 45 厘米：40 厘米貼近鎖骨，啱圓領同一字領；45 厘米垂低少少，配 V 領或者襯衫開領更好睇。訂造時可以按頸圍調。"],
      },
      {
        h: "揀呢款要諗嘅嘢",
        list: [
          ["鏈長", "想日日戴揀 40 厘米左右，貼身唔會晃；想配低領禮服可以揀長啲。"],
          ["爪鑲保養", "花瓣全部用爪鑲，冷衫、毛巾比較易勾；建議一年俾師傅檢查一次爪位，順便清洗。"],
          ["證書", "梨形鑽同馬眼鑽可以揀 IGI 或 GIA 證書，或者唔要大證平啲；出貨都附 GDTC 省檢證書。"],
        ],
      },
    ],
    faq: [
      { q: "三朵花培育鑽石項鏈戴起嚟有幾大？", a: "三朵花整體大約 3 厘米闊，戴落喺鎖骨中間下面，遠睇好明顯但唔會誇張，日常同晚宴都戴得。" },
      { q: "D–E 色、VS–VVS 嘅培育鑽石項鏈夠唔夠靚？", a: "夠。D–E 色屬於最高嘅無色級，VS–VVS 肉眼睇唔到內含物；梨形鑽花瓣多，顏色揀高啲成條項鏈會更白更閃。", link: { label: "第四章 4C 選石", href: "/4c" } },
      { q: "項鏈鏈長揀 40 定 45 厘米好？", a: "40 厘米貼近鎖骨，啱圓領同一字領；45 厘米垂低少少，配 V 領或者開領襯衫。唔肯定可以先用繩量一量頸圍再加 5 至 8 厘米。" },
      { q: "梨形鑽花瓣項鏈會唔會易勾衫？點保養？", a: "爪鑲嘅花瓣會比光金易勾冷衫同毛巾，戴嘅時候留意吓就得；建議一年俾師傅檢查一次爪位，日常用溫水加少少洗潔精輕輕刷。", link: { label: "第九章 保養", href: "/care" } },
      { q: "培育鑽石項鏈要唔要證書？", a: "可以揀。梨形鑽同馬眼鑽可以配 IGI 或 GIA 證書，唔要大證會平啲；碎鑽一般唔帶證書。出貨都附 GDTC 省檢證書，驗金屬同鑽石係培育定天然。", link: { label: "第三章 證書", href: "/certificate" } },
      { q: "可唔可以做一條差唔多嘅？", a: "可以做類似款。花朵數量、花瓣大細、鏈上配石同鏈長都可以按你預算同頸圍改，每條都係訂造，所以唔會完全一樣。" },
    ],
    video: { youtubeId: "qPyPT-Usol8", poster: "/images/cases/three-flower-pear-necklace-18k-white-gold-video.webp", uploadDate: "2026-10-21", duration: "PT17S", seconds: 17 },
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "第三章 證書", href: "/certificate" },
      { label: "第八章 場景", href: "/occasions" },
      { label: "第九章 保養", href: "/care" },
    ],
    images: [
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-1.webp", alt: "三朵花培育鑽石項鏈全貌，18K 白金鏈配四鑽幸運草同馬眼鑽" },
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-2.webp", alt: "三朵花培育鑽石項鏈戴喺頸上，花朵落喺鎖骨中間", worn: true },
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-3.webp", alt: "三朵花吊墜特寫，每朵六片梨形鑽花瓣同一粒圓鑽花心" },
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-4.webp", alt: "三朵花培育鑽石項鏈斜角，睇到花瓣爪鑲同立體感" },
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-5.webp", alt: "項鏈鏈身特寫：四鑽幸運草、馬眼鑽同小圓鑽" },
      { src: "/images/cases/three-flower-pear-necklace-18k-white-gold-6.webp", alt: "手指提起三朵花培育鑽石項鏈，睇到大細比例" },
    ],
    consent: true,
  },
  {
    slug: "marquise-east-west-1-33ct-platinum",
    category: "engagement-rings",
    title: "1.33 卡馬眼橫鑲求婚戒指・鉑金",
    h1: "1.33 卡馬眼形培育鑽石求婚戒指・打橫鑲",
    seoTitle: "1.33卡馬眼形培育鑽石戒指｜橫鑲・E VS1・鉑金",
    description: "1.33 卡馬眼形培育鑽石戒指：E 色 VS1、2EX，IGI 證書，馬眼鑽打橫鑲，兩頭半包鑲護住尖位，光面鉑金戒臂。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "1.33 卡 馬眼 E VS1，IGI 證書",
    metal: "鉑金",
    duration: "同類款式一般約 7–10 日",
    story: "呢隻係 1.33 卡馬眼形培育鑽石求婚戒指：主石 E 色、VS1，拋光同對稱都係 Excellent，附 IGI 證書。馬眼鑽唔係順住手指擺，而係打橫鑲，兩頭尖位用金屬半包鑲保護，底下一個 V 形承托，戒臂係光面鉑金，冇碎鑽。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["1.33 卡", "E 色", "VS1", "IGI 證書", "鉑金"],
    sizeGuide: {
      shape: "marquise",
      stone: [11, 5.5],
      finger: 17,
      eastWest: true,
      caption: "按真實比例畫（尺上每格 1 毫米）：1.33 卡馬眼鑽按一般比例估算約 11 × 5.5 毫米，打橫戴，長邊橫跨無名指約三分之二闊；無名指以約 17 毫米闊計。實際尺寸以證書同你隻手為準。",
    },
    specs: [
      ["主石", "培育鑽石，馬眼形，1.33 卡"],
      ["顏色淨度", "E 色，VS1"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["證書", "IGI"],
      ["鑲法", "打橫鑲，兩頭半包鑲，底下 V 形承托"],
      ["金屬", "鉑金，光面戒臂"],
      ["工期", "同類款式一般約 7–10 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "馬眼鑽一般順住手指直擺，呢隻就反過嚟打橫鑲：長邊橫跨手指，戴落去更貼手、少啲勾衫，睇落亦比直擺嘅款式現代同低調。",
          "馬眼最驚撞嘅係兩頭尖位，所以兩頭用金屬半包鑲包住，長邊就完全開放，光可以由兩側入石，火彩唔會被爪擋住。底下一個 V 形承托由戒臂升上嚟托住鑽石，戒頭好低，戴手套、做嘢都唔易撞。戒臂刻意做光面鉑金冇碎鑽，成隻戒焦點全部喺粒馬眼鑽度。",
        ],
      },
      {
        h: "戴喺手上有幾大",
        figure: "size",
        p: ["1.33 卡嘅馬眼鑽，按一般比例估算大約 11 × 5.5 毫米（實際以證書尺寸為準）。打橫戴嘅時候，11 毫米嗰邊橫跨無名指，差唔多遮住手指三分之二闊度；馬眼形面積睇落比同卡數圓鑽大，所以 1 卡幾已經好有存在感。"],
      },
      {
        h: "揀呢款要諗嘅嘢",
        list: [
          ["打橫定直擺", "打橫鑲貼手、低調，啱日日戴；想手指睇落長啲，可以改返直擺。"],
          ["尖位保護", "馬眼兩頭最易崩，半包鑲或者 V 爪一定要包住尖位，訂之前可以叫師傅俾相睇清楚。"],
          ["鉑金定 18K 金", "鉑金密度高、唔使電金、白色唔會褪；18K 白金輕啲、平啲，但幾年後要重新電金。"],
        ],
      },
    ],
    faq: [
      { q: "1.33 卡馬眼形培育鑽石戴喺手上有幾大？", a: "大約 11 × 5.5 毫米。打橫戴差唔多遮住無名指三分之二闊；馬眼形面積睇落比同卡數圓鑽大，所以 1 卡幾已經好明顯。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "馬眼鑽打橫鑲有咩好處？", a: "打橫鑲貼手、戒頭低，日常少啲撞同勾衫，造型亦比傳統直擺現代。如果想手指顯長，就揀直擺。" },
      { q: "馬眼鑽嘅尖位會唔會易崩？點保護？", a: "尖位係馬眼最脆弱嘅位置，所以要用半包鑲或者 V 爪包住兩頭。呢隻用金屬半包鑲，兩頭完全包住，長邊開放俾光入石。" },
      { q: "E 色 VS1 嘅馬眼形培育鑽石值唔值得揀？", a: "值得。E 色屬於無色級，VS1 肉眼睇唔到內含物；馬眼形兩頭比較易睇到底色，顏色揀高啲成粒會更白。預算有限可以考慮 F 至 G 色。", link: { label: "第四章 4C 選石", href: "/4c" } },
      { q: "求婚戒指揀鉑金定 18K 白金好？", a: "鉑金天然係白色、密度高、唔使電金，耐戴但貴啲重啲；18K 白金輕啲平啲，不過幾年後要俾師傅重新電金先保持白亮。" },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。卡數、顏色、金屬，甚至改成直擺都得；每隻都係按客人預算同手寸訂造，所以唔會完全一樣。" },
    ],
    video: { youtubeId: "a7SCx3V3T14", poster: "/images/cases/marquise-east-west-1-33ct-platinum-video.webp", uploadDate: "2026-10-31", duration: "PT19S", seconds: 19 },
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
      { label: "第三章 證書", href: "/certificate" },
    ],
    images: [
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-1.webp", alt: "1.33 卡馬眼形培育鑽石求婚戒指，打橫鑲，兩頭半包鑲，光面鉑金戒臂" },
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-2.webp", alt: "1.33 卡馬眼形培育鑽石戒指打橫戴喺左手無名指", worn: true },
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-3.webp", alt: "由上面睇馬眼鑽打橫鑲，兩頭金屬半包鑲" },
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-4.webp", alt: "馬眼鑽戒指側面，戒頭好低、光面戒臂" },
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-5.webp", alt: "由一端睇戒指，見到 V 形承托托住馬眼鑽" },
      { src: "/images/cases/marquise-east-west-1-33ct-platinum-6.webp", alt: "馬眼形培育鑽石同半包鑲近鏡特寫" },
    ],
    consent: true,
  },
  {
    slug: "full-eternity-band-round-18k-white-gold",
    category: "eternity-rings",
    title: "滿鑽排戒・圓鑽排滿一圈・18K 白金",
    h1: "滿鑽培育鑽石排戒・圓鑽排滿一圈",
    seoTitle: "滿鑽培育鑽石排戒｜每粒約 0.08 卡・D–E 色・18K白金",
    description: "滿鑽培育鑽石排戒：一圈圓形培育鑽石排滿成隻戒，每粒約 0.08 卡，D–E 色、VS–VVS，兩邊金邊夾住、內圈鏤空透光，18K 白金。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "圓形培育鑽石排滿一圈，每粒約 0.08 卡，D–E 色，VS–VVS",
    metal: "18K 白金",
    duration: "同類款式一般約 10–12 日",
    story: "呢隻係滿鑽培育鑽石排戒：一粒粒大細一樣嘅圓形培育鑽石排滿成個戒圈，每粒約 0.08 卡，D 至 E 色、VS 至 VVS 淨度。兩邊用細金邊夾住，鑽與鑽之間共用細爪；內圈每粒鑽底下開一個小圓孔，等光由底透入，金屬係 18K 白金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["滿鑽一圈", "每粒約 0.08 卡", "D–E 色", "VS–VVS", "18K 白金"],
    specs: [
      ["鑽石", "圓形培育鑽石，每粒約 0.08 卡（約 2.7 毫米），排滿一圈"],
      ["顏色淨度", "D–E 色，VS–VVS"],
      ["鑲法", "兩邊金邊夾住，鑽與鑽之間共用細爪；內圈每粒鑽底開小孔透光"],
      ["戒圈", "闊約 3 毫米，外側光面，內圈圓滑貼手"],
      ["金屬", "18K 白金"],
      ["證書", "碎鑽一般唔帶證書；出貨附省檢證書"],
      ["工期", "同類款式一般約 10–12 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "滿鑽排戒最考功夫嘅係「齊」：每粒鑽大細、顏色都要揀到一樣，排落去先唔會有一粒特別黃或者特別細。呢隻用每粒約 0.08 卡嘅圓鑽，D 至 E 色，成圈睇落一樣白。",
          "兩邊用細金邊夾住，鑽與鑽之間共用細爪，正面睇係一條連續嘅鑽線，金屬只係兩條幼邊。內圈每粒鑽底下開一個小圓孔，一嚟光可以由底透入令鑽更閃，二嚟方便日後清潔；戒圈闊約 3 毫米，單戴秀氣，同求婚戒疊戴亦唔會搶位。",
        ],
      },
      {
        h: "揀滿鑽排戒要諗嘅嘢",
        list: [
          ["手寸要度準", "滿鑽排戒一圈都係鑽，冇位改大改細，訂之前一定要度準手寸；手寸會變（例如懷孕）可以考慮半圈款。"],
          ["滿鑽定半圈", "滿鑽轉到邊面都見到鑽，最閃；半圈只係正面有鑽，平啲、可以改圈，底部亦唔會頂住隔籬手指。"],
          ["每粒大細", "每粒 0.05 至 0.1 卡最常見：細粒秀氣啲、啱疊戴；大粒存在感強，單戴已經夠。"],
          ["疊戴", "想同求婚戒一齊戴，戒圈闊度同金屬顏色最好配返，師傅可以按你隻求婚戒度身做。"],
        ],
      },
    ],
    faq: [
      { q: "滿鑽排戒可唔可以改圈？", a: "基本上唔可以。滿鑽排戒成圈都係鑽，冇金屬位可以加減，所以訂造前一定要度準手寸；如果擔心手寸會變，可以揀半圈排戒。", link: { label: "戒圈尺寸點度", href: "/custom" } },
      { q: "一隻滿鑽排戒要幾多粒鑽？", a: "視乎手寸同每粒大細。以每粒約 0.08 卡（約 2.7 毫米）計，一般手寸大約要 18 至 22 粒，手指粗啲就要多幾粒，總卡數亦會多啲。" },
      { q: "滿鑽排戒同半圈排戒有咩分別？", a: "滿鑽成圈都有鑽，轉到邊面都閃，但唔可以改圈、價錢高啲；半圈只係正面有鑽，平啲、可以改圈，戴落底部亦冇鑽頂住手指。" },
      { q: "排戒可唔可以同求婚戒疊戴？", a: "可以，好多人都咁戴。闊約 3 毫米嘅排戒疊喺求婚戒旁邊唔會搶位；金屬顏色同戒圈弧度最好配返，師傅可以按你隻求婚戒度身做。" },
      { q: "碎鑽有冇證書？", a: "碎鑽一般唔帶證書，因為每粒太細，逐粒出證書唔划算。工坊出貨附省檢證書，驗金屬材質同鑽石係培育；顏色淨度由師傅揀石時配對。" },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。每粒大細、滿鑽定半圈、18K 白金、黃金或玫瑰金都可以揀，按你嘅手寸同預算訂造。" },
    ],
    video: { youtubeId: "f2oBQ-Uk-5A", poster: "/images/cases/full-eternity-band-round-18k-white-gold-video.webp", uploadDate: "2026-10-31", duration: "PT20S", seconds: 20 },
    guides: [
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第六章 訂造流程", href: "/custom" },
      { label: "第四章 4C 選石", href: "/4c" },
    ],
    images: [
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-1.webp", alt: "滿鑽培育鑽石排戒，圓鑽排滿一圈，18K 白金" },
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-2.webp", alt: "滿鑽培育鑽石排戒戴喺左手無名指", worn: true },
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-3.webp", alt: "滿鑽排戒正面，一排圓鑽兩邊細金邊" },
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-4.webp", alt: "滿鑽排戒側面，鑽石排滿成個戒圈" },
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-5.webp", alt: "滿鑽排戒內圈，每粒鑽底開小圓孔透光" },
      { src: "/images/cases/full-eternity-band-round-18k-white-gold-6.webp", alt: "滿鑽排戒圓鑽同共用細爪近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "pear-stud-earrings-1-5ct-18k-white-gold",
    category: "earrings",
    title: "1.5 卡水滴耳釘一對・18K 白金三爪",
    h1: "1.5 卡梨形培育鑽石耳釘・一對・三爪鑲",
    seoTitle: "1.5卡梨形培育鑽石耳釘一對｜D VVS2・18K白金三爪",
    description: "1.5 卡梨形培育鑽石耳釘一對：每粒 1.5 卡，D 色 VVS2、2EX，18K 白金三爪鑲，螺絲耳堵唔易甩。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "梨形培育鑽石一對，每粒 1.5 卡，D 色 VVS2，2EX",
    metal: "18K 白金",
    duration: "同類款式一般約 7–10 日",
    story: "呢對係 1.5 卡梨形培育鑽石耳釘：兩粒梨形鑽每粒 1.5 卡，D 色、VVS2，拋光同對稱都係 Excellent，兩粒配對揀過大細同顏色。18K 白金三爪鑲，尖頭一隻爪、圓頭兩隻爪，背後係螺絲耳堵。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["每粒 1.5 卡", "D 色", "VVS2", "2EX", "18K 白金"],
    specs: [
      ["主石", "培育鑽石，梨形，每粒 1.5 卡，一對"],
      ["顏色淨度", "D 色，VVS2"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["大小", "每粒約 9.5 × 6.3 毫米（按一般比例估算）"],
      ["鑲法", "三爪：尖頭一爪、圓頭兩爪"],
      ["耳背", "螺絲耳堵"],
      ["金屬", "18K 白金"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 7–10 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "耳釘最緊要係兩粒「似」：大細、比例、顏色都要配對，戴喺兩邊耳先睇唔出分別。呢對兩粒都係 1.5 卡、D 色 VVS2、2EX，梨形長闊比例亦揀到一樣。",
          "鑲法用三爪：尖頭一隻爪護住最易崩嘅尖位，圓頭兩隻爪扣穩，金屬用得最少，正面差唔多全部都係鑽。尖頭向上戴，線條向上收，睇落面型顯得修長。背後用螺絲耳堵，扭實先會鬆，戴住瞓覺、除衫都唔易甩。",
        ],
      },
      {
        h: "戴落有幾大",
        p: ["每粒 1.5 卡嘅梨形鑽，按一般比例大約 9.5 × 6.3 毫米，戴喺耳珠上差唔多佔耳珠高度一半：日常返工唔會太誇張，晚宴亦夠存在感。想低調啲，0.5 至 1 卡一對都好常見。"],
      },
      {
        h: "揀鑽石耳釘要諗嘅嘢",
        list: [
          ["三爪定四爪", "梨形用三爪最自然，金屬少、睇落大；圓形一般用四爪或六爪。爪要包住尖位，防止撞崩。"],
          ["耳堵", "大卡數耳釘建議用螺絲耳堵或者加大耳堵，比普通耳迫穩陣，唔易甩。"],
          ["配對", "兩粒鑽要大細、顏色、比例都接近；買裸石嘅話要叫師傅幫手配對。"],
          ["每粒幾大", "0.5 卡秀氣、1 卡日常最多人揀、1.5 卡以上就好有存在感。"],
        ],
      },
    ],
    faq: [
      { q: "1.5 卡梨形鑽耳釘戴落有幾大？", a: "每粒大約 9.5 × 6.3 毫米，戴喺耳珠上差唔多佔耳珠高度一半。日常戴唔會太誇張，晚宴亦夠閃。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "梨形耳釘尖頭向上定向下戴？", a: "一般尖頭向上戴，線條向上收，面型睇落修長啲；尖頭向下就似水滴，較為柔和。訂造時可以叫師傅按你想要嘅方向做爪位。" },
      { q: "螺絲耳堵同普通耳迫有咩分別？", a: "螺絲耳堵要扭實先會鬆，戴住瞓覺、除衫都唔易甩，適合大卡數耳釘；普通耳迫戴除方便，但用耐咗會鬆，要定期收緊。" },
      { q: "耳釘鑽石要唔要證書？", a: "每粒 0.5 卡以上建議要證書，方便核對兩粒等級。呢類耳釘可以揀 IGI 或 GIA 證書，或者唔要大證平啲。", link: { label: "第三章 證書", href: "/certificate" } },
      { q: "D 色 VVS2 嘅耳釘值唔值得揀？", a: "耳釘離眼遠，G、H 色同 VS 淨度戴落已經好白好乾淨；揀 D 色 VVS2 係追求最白最通透，預算有限可以揀低兩級，慳落嚟嘅錢可以揀大啲。", link: { label: "第四章 4C 選石", href: "/4c" } },
      { q: "可唔可以做一對差唔多嘅？", a: "可以做類似款。每粒大細、形狀、三爪定四爪、18K 白金、黃金或玫瑰金都可以揀，按你預算訂造。" },
    ],
    video: { youtubeId: "HKM5i1BXXtI", poster: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-video.webp", uploadDate: "2026-10-31", duration: "PT18S", seconds: 18 },
    guides: [
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第三章 證書", href: "/certificate" },
    ],
    images: [
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-1.webp", alt: "1.5 卡梨形培育鑽石耳釘一對，18K 白金三爪鑲" },
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-2.webp", alt: "1.5 卡梨形培育鑽石耳釘戴喺耳珠上，尖頭向上", worn: true },
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-3.webp", alt: "梨形培育鑽石耳釘正面，三爪鑲" },
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-4.webp", alt: "梨形鑽石耳釘背面，見到三爪托、耳針同螺絲耳堵" },
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-5.webp", alt: "梨形鑽石耳釘側面，見到爪高同耳針長度" },
      { src: "/images/cases/pear-stud-earrings-1-5ct-18k-white-gold-6.webp", alt: "梨形培育鑽石同三爪近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "oval-three-stone-3-49ct-18k-white-gold",
    category: "engagement-rings",
    title: "3.49 卡橢圓三石求婚戒指・18K 白金",
    h1: "3.49 卡橢圓培育鑽石三石戒・梨形副石・雙爪鑲",
    seoTitle: "3.49卡橢圓培育鑽石三石求婚戒指｜E VS1・梨形副石・18K白金",
    description: "3.49 卡橢圓培育鑽石三石求婚戒指：主石 E 色 VS1、2EX，四組雙爪鑲，左右各配一粒梨形副石，光面 18K 白金戒臂。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "3.49 卡 橢圓 E VS1，2EX；梨形副石一對",
    metal: "18K 白金",
    duration: "同類款式一般約 10–12 日",
    story: "呢隻係 3.49 卡橢圓培育鑽石三石求婚戒指：主石 E 色、VS1，拋光同對稱都係 Excellent，用四組雙爪鑲穩；左右各配一粒梨形副石，圓頭貼住主石、尖頭向外，令成個戒面顯得更長更大。戒臂係光面 18K 白金，冇碎鑽。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["3.49 卡", "E 色", "VS1", "三石", "18K 白金"],
    sizeGuide: {
      shape: "oval",
      stone: [12, 8.4],
      finger: 17,
      caption: "按真實比例畫（尺上每格 1 毫米）：3.49 卡橢圓主石按一般比例估算約 12 × 8.4 毫米，圖中未畫兩邊梨形副石；無名指以約 17 毫米闊計。實際尺寸以證書同你隻手為準。",
    },
    specs: [
      ["主石", "培育鑽石，橢圓形，3.49 卡"],
      ["顏色淨度", "E 色，VS1"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["副石", "梨形培育鑽石一對，圓頭向主石、尖頭向外"],
      ["鑲法", "主石四組雙爪（共 8 爪），副石各三爪，底下籃式托"],
      ["金屬", "18K 白金，光面戒臂"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 10–12 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "三石戒嘅重點係比例：兩粒梨形副石大約係主石五分之一大，圓頭貼住橢圓、尖頭順住戒臂向外，三粒連埋成一條流線，戴落手指會顯得修長，主石亦睇落大過實際卡數。",
          "主石用四組雙爪：每個位兩隻爪並排，即使一隻爪磨損，另一隻仍然扣住，3 卡幾嘅大石更穩陣；底下係直柱籃式托，光可以由側面入石。戒臂刻意做光面冇碎鑽，焦點全部留俾三粒石。",
        ],
      },
      {
        h: "戴喺手上有幾大",
        figure: "size",
        p: ["3.49 卡橢圓主石，按一般比例大約 12 × 8.4 毫米，順住手指戴差唔多遮住無名指一半闊；加埋兩粒梨形副石，成個戒面橫向會闊過手指少少，好有存在感。"],
      },
      {
        h: "揀三石戒要諗嘅嘢",
        list: [
          ["副石大細", "副石一般係主石四分一至五分一，太大會搶主石，太細就睇唔出三石效果。"],
          ["副石形狀", "梨形副石令線條向外延伸、手指顯長；圓形或梯方副石就比較傳統、穩重。"],
          ["雙爪定單爪", "大卡數主石建議用雙爪，一隻爪鬆咗仲有另一隻頂住；單爪金屬少啲、睇落更通透。"],
          ["疊戴", "三石戒戒面闊，配結婚對戒時最好預留弧位，師傅可以按呢隻戒度身做。"],
        ],
      },
    ],
    faq: [
      { q: "3.49 卡橢圓培育鑽石戴喺手上有幾大？", a: "主石大約 12 × 8.4 毫米，順住手指戴差唔多遮住無名指一半闊；加埋兩邊梨形副石，戒面會闊過手指少少。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "三石戒有咩意思？", a: "三石戒常被解作「過去、現在、將來」，亦有人當係兩個人加埋將來。款式上，三粒石連成一條線，令主石睇落更大、手指更修長。" },
      { q: "雙爪鑲有咩好處？", a: "每個爪位有兩隻爪並排，就算一隻磨損或者鬆咗，另一隻仍然扣住主石，大卡數主石用雙爪會穩陣啲；代價係金屬多少少。" },
      { q: "橢圓形培育鑽石值唔值得揀？", a: "值得。橢圓同卡數睇落比圓形大，又顯手指長，係近年香港求婚戒最受歡迎嘅形狀之一。揀嗰陣留意長闊比（一般 1.3 至 1.5 最順眼）同中間有冇明顯「領結」暗位。", link: { label: "第五章 形狀款式", href: "/styles" } },
      { q: "主石要唔要證書？", a: "3 卡以上主石建議要證書，方便核對顏色、淨度同尺寸。可以揀 IGI 或 GIA，亦可以唔要大證平啲。", link: { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" } },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。主石卡數、副石形狀同大細、雙爪定單爪、18K 白金、黃金或鉑金都可以揀，按你預算同手寸訂造。" },
    ],
    video: { youtubeId: "2TzN6WqBElU", poster: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-video.webp", uploadDate: "2026-11-02", duration: "PT22S", seconds: 22 },
    guides: [
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
    ],
    images: [
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-1.webp", alt: "3.49 卡橢圓培育鑽石三石求婚戒指，梨形副石，18K 白金雙爪鑲" },
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-2.webp", alt: "3.49 卡橢圓培育鑽石三石戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-3.webp", alt: "橢圓三石戒正面，主石兩邊各一粒梨形副石" },
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-4.webp", alt: "橢圓三石戒側面，見到籃式托同雙爪高度" },
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-5.webp", alt: "由斜後方睇三石戒，見到副石爪同主石底托" },
      { src: "/images/cases/oval-three-stone-3-49ct-18k-white-gold-6.webp", alt: "橢圓主石四組雙爪近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "round-halo-1-06ct-18k-white-gold",
    category: "engagement-rings",
    title: "1.06 卡圓鑽光環求婚戒指・18K 白金",
    h1: "1.06 卡圓形培育鑽石求婚戒指・碎鑽光環",
    seoTitle: "1.06卡圓形培育鑽石求婚戒指｜D VVS2 3EX・光環・18K白金",
    description: "1.06 卡圓形培育鑽石求婚戒指：D 色 VVS2、3EX，外圍一圈碎鑽光環，戒臂上半圈微鑲碎鑽，18K 白金。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "1.06 卡 圓形 D VVS2，3EX",
    metal: "18K 白金",
    duration: "同類款式一般約 10–12 日",
    story: "呢隻係 1.06 卡圓形培育鑽石求婚戒指：主石 D 色、VVS2，切工、拋光、對稱都係 Excellent（3EX），四爪鑲；外圍一圈碎鑽光環，戒臂上半圈再排一行微鑲碎鑽，金屬係 18K 白金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["1.06 卡", "D 色", "VVS2", "3EX", "18K 白金"],
    sizeGuide: {
      shape: "round",
      stone: [6.5, 6.5],
      halo: [9, 9],
      finger: 17,
      caption: "按真實比例畫（尺上每格 1 毫米）：1.06 卡圓形主石約 6.5 毫米，加光環約 9 毫米；無名指以約 17 毫米闊計。實際尺寸以證書同你隻手為準。",
    },
    specs: [
      ["主石", "培育鑽石，圓形，1.06 卡"],
      ["顏色淨度", "D 色，VVS2"],
      ["切工", "切工、拋光、對稱 Excellent（3EX）"],
      ["鑲法", "主石四爪，外圍一圈碎鑽光環，底下籃式托"],
      ["戒臂", "上半圈微鑲碎鑽，下半圈光金"],
      ["金屬", "18K 白金"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 10–12 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "1 卡圓鑽係最經典嘅求婚戒，加一圈碎鑽光環，正面睇成個戒面大約 9 毫米，視覺上差唔多大一個碼。主石揀 D 色、VVS2、3EX，切工三項都係最高級，閃度最好。",
          "戒臂只係上半圈鑲碎鑽，下半圈留光金：戴落正面同兩側都閃，但手指底部冇碎鑽，唔會頂手，日後改圈亦容易啲。主石底下係籃式托，側面睇得到爪同光環嘅承托。",
        ],
      },
      {
        h: "戴喺手上有幾大",
        figure: "size",
        p: ["1.06 卡圓形主石直徑約 6.5 毫米，佔中等手指闊度大約四成；加埋光環約 9 毫米，就差唔多遮住半隻手指，睇落好似 1.5 卡至 2 卡嘅效果。"],
      },
      {
        h: "揀光環款要諗嘅嘢",
        list: [
          ["光環大細", "光環碎鑽越細越密，主石越突出；碎鑽大粒啲就整體更閃，但主石會顯得細少少。"],
          ["戒臂碎鑽", "半圈碎鑽最實用：正面閃、底部唔頂手、可以改圈；全圈就最閃但改唔到圈。"],
          ["顏色配對", "主石 D 色，光環碎鑽都要揀白嘅，唔係會襯到主石偏黃。"],
          ["疊戴", "光環戒面闊，配結婚對戒時對戒可以做直身，或者預留弧位。"],
        ],
      },
    ],
    faq: [
      { q: "1 卡圓形培育鑽石加光環戴落有幾大？", a: "主石約 6.5 毫米，加光環約 9 毫米，差唔多遮住半隻無名指，睇落好似 1.5 至 2 卡嘅效果。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "3EX 係咩意思？", a: "3EX 即切工（Cut）、拋光（Polish）、對稱（Symmetry）三項都係 Excellent，係圓形鑽石切工最高評級，閃度同火彩最好。" },
      { q: "D 色 VVS2 值唔值得揀？", a: "D 色係最白嘅無色級，VVS2 喺 10 倍放大鏡下都好難搵到內含物。追求最好可以揀；預算有限，G、H 色同 VS 淨度鑲好之後肉眼都好難分。", link: { label: "求婚預算點計", href: "/occasions/proposal-budget" } },
      { q: "1 卡培育鑽石求婚戒指大概幾錢？", a: "視乎渠道、4C 同戒托。以 2026 年香港網店或工廠直訂價計，1 卡簡單款約 HK$6,500 起，加光環同戒臂碎鑽會再多啲。", link: { label: "1 卡培育鑽石價錢", href: "/price/1-carat-price" } },
      { q: "光環戒指會唔會易甩碎鑽？", a: "正常佩戴唔會。碎鑽用細珠爪鑲穩，建議每半年至一年俾師傅檢查一次爪位，做運動或者搬重嘢時除低。", link: { label: "第九章 保養", href: "/care" } },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。主石卡數、光環大細、戒臂碎鑽半圈定全圈、18K 白金、黃金或鉑金都可以揀，按你預算同手寸訂造。" },
    ],
    video: { youtubeId: "5QLfDMU7UvU", poster: "/images/cases/round-halo-1-06ct-18k-white-gold-video.webp", uploadDate: "2026-11-02", duration: "PT18S", seconds: 18 },
    guides: [
      { label: "1 卡培育鑽石價錢", href: "/price/1-carat-price" },
      { label: "求婚預算點計", href: "/occasions/proposal-budget" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
    ],
    images: [
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-1.webp", alt: "1.06 卡圓形培育鑽石求婚戒指，碎鑽光環，18K 白金" },
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-2.webp", alt: "1.06 卡圓形培育鑽石光環戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-3.webp", alt: "圓鑽光環戒指正面，主石四爪同一圈碎鑽光環" },
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-4.webp", alt: "圓鑽光環戒指側面，見到籃式托同戒臂碎鑽" },
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-5.webp", alt: "戒臂上半圈微鑲碎鑽近景" },
      { src: "/images/cases/round-halo-1-06ct-18k-white-gold-6.webp", alt: "圓形主石同碎鑽光環近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "sunflower-pendant-0-70ct-platinum",
    category: "pendants",
    title: "太陽花鑽石項鏈・0.70 卡主石・鉑金",
    h1: "太陽花培育鑽石項鏈・0.70 卡主石配八粒副石",
    seoTitle: "太陽花培育鑽石項鏈｜0.70卡 D VVS2 3EX・八粒副石・鉑金",
    description: "太陽花培育鑽石項鏈：中間一粒 0.70 卡圓鑽，D 色 VVS2、3EX，外圈八粒圓鑽圍成一朵花，PT950 鉑金，鏈直接接喺花兩側。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "0.70 卡 圓形 D VVS2，3EX；外圈圓鑽八粒",
    metal: "PT950 鉑金",
    duration: "同類款式一般約 10–12 日",
    story: "呢條係太陽花培育鑽石項鏈：中間一粒 0.70 卡圓鑽，D 色、VVS2，切工、拋光、對稱都係 Excellent（3EX）；外圈八粒圓鑽緊貼圍住，砌成一朵花，整朵大約 1 厘米闊。條鏈直接接喺花左右兩邊，戴落唔會反轉；鏈尾有龍蝦扣、吊牌同延長鏈，金屬係 PT950 鉑金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["0.70 卡主石", "D 色", "VVS2", "3EX", "PT950 鉑金"],
    specs: [
      ["主石", "培育鑽石，圓形，0.70 卡"],
      ["顏色淨度", "D 色，VVS2"],
      ["切工", "切工、拋光、對稱 Excellent（3EX）"],
      ["副石", "圓形培育鑽石八粒，圍成一圈"],
      ["大小", "整朵花約 1 厘米闊（按一般比例估算）"],
      ["鏈", "鏈直接接喺花兩側；龍蝦扣、吊牌、延長鏈"],
      ["金屬", "PT950 鉑金"],
      ["證書", "主石可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 10–12 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "太陽花款嘅原理係「圍石顯大」：一粒 0.70 卡主石直徑大約 5.7 毫米，外圈八粒圓鑽一圍，成朵花大約 1 厘米闊，正面睇落好似一粒 2 卡幾嘅大石，但價錢遠低過真係 2 卡。",
          "條鏈唔係用吊環掛住，而係直接接喺花左右兩邊，戴落朵花會一直平平哋向前，唔會反轉或者打側。金屬用 PT950 鉑金，白色唔會褪，唔使電金；鏈尾有延長鏈，可以調長短配唔同領口。",
        ],
      },
      {
        h: "揀鑽石吊墜項鏈要諗嘅嘢",
        list: [
          ["鏈接法", "鏈直接接喺吊墜兩邊，吊墜唔會反轉；用吊環就可以換鏈，但會轉來轉去。"],
          ["長度", "一般 40 至 45 厘米，吊墜落喺鎖骨中間；有延長鏈就可以配圓領同 V 領。"],
          ["鉑金定 18K 白金", "鉑金唔使電金、白色唔褪；18K 白金輕啲、平啲，幾年要重新電金。"],
          ["主石大細", "圍石款主石唔使太大，0.5 至 1 卡配外圈副石，已經有 2 卡以上嘅視覺效果。"],
        ],
      },
    ],
    faq: [
      { q: "太陽花項鏈戴落有幾大？", a: "整朵花大約 1 厘米闊，落喺鎖骨中間下面少少。主石 0.70 卡加外圈八粒副石，正面睇落好似一粒 2 卡幾嘅大石。" },
      { q: "點解太陽花款睇落咁大？", a: "外圈副石緊貼主石，令成個鑽面闊咗差唔多一倍，光亦會喺副石之間反射，所以同樣預算，圍石款比單粒大石顯大好多。" },
      { q: "項鏈用鉑金定 18K 白金好？", a: "鉑金天然白色、唔使電金，日日戴都唔會褪色，但貴啲重啲；18K 白金輕啲平啲，表面嘅銠金幾年要重新電。" },
      { q: "項鏈可以調長短嗎？", a: "呢條鏈尾有延長鏈，扣喺唔同位置就可以調長短，配圓領同 V 領都得。訂造時亦可以按你嘅頸圍定長度。" },
      { q: "主石要唔要證書？", a: "0.5 卡以上主石建議要證書，可以揀 IGI 或 GIA；外圈副石一般唔帶證書。", link: { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" } },
      { q: "可唔可以做一條差唔多嘅？", a: "可以做類似款。主石大細、外圈粒數、鉑金或 18K 金、鏈長都可以揀，按你預算訂造。" },
    ],
    video: { youtubeId: "_aYbSJqLcck", poster: "/images/cases/sunflower-pendant-0-70ct-platinum-video.webp", uploadDate: "2026-11-02", duration: "PT14S", seconds: 14 },
    guides: [
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" },
      { label: "第九章 保養", href: "/care" },
    ],
    images: [
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-1.webp", alt: "太陽花培育鑽石項鏈，0.70 卡主石配八粒副石，鉑金" },
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-2.webp", alt: "太陽花培育鑽石項鏈戴喺頸上，落喺鎖骨中間", worn: true },
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-3.webp", alt: "太陽花吊墜正面，中間主鑽同外圈八粒副石" },
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-4.webp", alt: "太陽花吊墜斜角，見到主鑽高度同爪" },
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-5.webp", alt: "項鏈鏈尾，龍蝦扣、吊牌同延長鏈" },
      { src: "/images/cases/sunflower-pendant-0-70ct-platinum-6.webp", alt: "手指提起太陽花項鏈，見到實際大細" },
    ],
    date: "2026-11",
    consent: true,
  },
  {
    slug: "princess-4-88ct-18k-yellow-gold",
    category: "engagement-rings",
    title: "4.88 卡公主方菱形鑲戒指・18K 黃金",
    h1: "4.88 卡公主方培育鑽石戒指・菱形鑲・風箏副石",
    seoTitle: "4.88卡公主方培育鑽石戒指｜E VVS2・菱形鑲・18K黃金",
    description: "4.88 卡公主方培育鑽石戒指：E 色 VVS2、2EX，主石斜 45° 菱形鑲，四隻 V 爪護角，分叉戒臂各夾一粒風箏形副石，18K 黃金。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "4.88 卡 公主方 E VVS2，2EX；風箏形副石一對",
    metal: "18K 黃金",
    duration: "同類款式一般約 12–15 日",
    story: "呢隻係 4.88 卡公主方培育鑽石戒指：主石 E 色、VVS2，拋光同對稱都係 Excellent，斜 45° 擺成菱形，四個角用 V 爪包住。戒臂由兩邊分叉，每邊中間夾一粒風箏形副石，線條好幾何；金屬係 18K 黃金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["4.88 卡", "E 色", "VVS2", "菱形鑲", "18K 黃金"],
    specs: [
      ["主石", "培育鑽石，公主方，4.88 卡"],
      ["顏色淨度", "E 色，VVS2"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["大小", "約 9.4 × 9.4 毫米（按一般比例估算）"],
      ["鑲法", "斜 45° 菱形鑲，四隻 V 爪護角"],
      ["副石", "風箏形培育鑽石一對，夾喺分叉戒臂中間"],
      ["金屬", "18K 黃金"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 12–15 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "公主方通常四正擺，呢隻刻意斜 45° 擺成菱形：一個角向指尖、一個角向手掌，同卡數睇落更長更大，亦即刻有設計感。公主方四個角最易崩，所以每個角都用 V 爪包住。",
          "戒臂由兩邊分叉成兩條，中間各夾一粒風箏形副石，尖頭指向主石，配合菱形主石成個戒面係一組幾何線條。金屬揀 18K 黃金，暖色襯白鑽，對比更強，亦更唔易撞款。",
        ],
      },
      {
        h: "揀公主方要諗嘅嘢",
        list: [
          ["四正定菱形", "四正擺比較經典；斜擺成菱形顯大、有設計感，但寬度會多約四成。"],
          ["護角", "公主方四個尖角最易撞崩，一定要用 V 爪或者包角。"],
          ["每卡價錢", "切公主方損耗少啲，同等級每卡一般平過圓形。"],
          ["黃金定白金", "黃金襯白鑽對比強、復古；白金或鉑金就更清爽，鑽石睇落更白。"],
        ],
      },
    ],
    faq: [
      { q: "4.88 卡公主方鑽石有幾大？", a: "按一般比例大約 9.4 × 9.4 毫米；斜擺成菱形，由角到角大約 13 毫米，戴落差唔多蓋住成隻無名指。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "公主方斜擺有咩好處？", a: "斜 45° 擺成菱形，角對角嘅長度比邊長多約四成，所以睇落更大、更長，又有設計感；缺點係戒面闊咗，同對戒疊戴要預位。" },
      { q: "公主方鑽石會唔會易崩角？", a: "四個尖角係最脆弱嘅位置，所以要用 V 爪或者包角保護。呢隻每個角都用 V 爪包住。" },
      { q: "黃金配白鑽會唔會令鑽石睇落黃？", a: "高顏色嘅鑽石（例如 E 色）配黃金，鑽石會反射少少暖色，但整體對比反而更突出；想鑽石睇落最白，就揀白金或鉑金。" },
      { q: "公主方同墊形有咩分別？", a: "公主方係尖角正方形，線條利落、現代；墊形係圓角，柔和復古、火彩大。兩款都係方形明亮式切工。", link: { label: "培育鑽石形狀總覽", href: "/styles/shapes-overview" } },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。主石卡數、四正定菱形、副石形狀、黃金白金或鉑金都可以揀，按你預算同手寸訂造。" },
    ],
    guides: [
      { label: "培育鑽石形狀總覽", href: "/styles/shapes-overview" },
      { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" },
      { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" },
    ],
    images: [
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-1.webp", alt: "4.88 卡公主方培育鑽石戒指，菱形鑲，風箏形副石，18K 黃金" },
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-2.webp", alt: "4.88 卡公主方培育鑽石戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-3.webp", alt: "公主方戒指正面，菱形主石同四隻 V 爪" },
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-4.webp", alt: "公主方戒指側面，見到分叉戒臂同副石" },
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-5.webp", alt: "公主方戒指斜側，見到戒頭下面嘅幾何斜撐" },
      { src: "/images/cases/princess-4-88ct-18k-yellow-gold-6.webp", alt: "公主方主石同 V 爪近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "emerald-cut-5-16ct-18k-white-gold",
    category: "engagement-rings",
    title: "5.16 卡祖母綠形梯方鑽戒指・18K 白金",
    h1: "5.16 卡祖母綠形培育鑽石戒指・兩邊漸變梯方",
    seoTitle: "5.16卡祖母綠形培育鑽石戒指｜D VS1・漸變梯方副石・18K白金",
    description: "5.16 卡祖母綠形培育鑽石戒指：D 色 VS1、2EX，四爪鑲，兩邊各一排由大到小嘅梯方鑽，18K 白金。鄒三山工坊東莞訂造，可 WhatsApp 問類似款報價。",
    stone: "5.16 卡 祖母綠形 D VS1，2EX；梯方副石兩排",
    metal: "18K 白金",
    duration: "同類款式一般約 12–15 日",
    story: "呢隻係 5.16 卡祖母綠形培育鑽石戒指：主石 D 色、VS1，拋光同對稱都係 Excellent，四爪鑲，順手指方向擺。兩邊肩位各有一排梯方鑽，由主石旁邊最闊開始，一粒比一粒細，順住戒臂向下收窄；金屬係 18K 白金。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["5.16 卡", "D 色", "VS1", "漸變梯方", "18K 白金"],
    specs: [
      ["主石", "培育鑽石，祖母綠形（階梯切工），5.16 卡"],
      ["顏色淨度", "D 色，VS1"],
      ["拋光對稱", "Excellent，Excellent（2EX）"],
      ["大小", "約 11.5 × 8.5 毫米（按一般比例估算）"],
      ["鑲法", "主石四爪，順手指方向"],
      ["副石", "梯方培育鑽石兩排，由大到小，槽鑲"],
      ["金屬", "18K 白金"],
      ["證書", "可選 IGI／GIA，或唔要大證（訂造時揀）"],
      ["工期", "同類款式一般約 12–15 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "祖母綠形係階梯切工：刻面一級級好似樓梯，光暗分明，好似「一面鏡」，冇明亮式咁閃，但線條乾淨、好有質感。正因為睇得透，主石揀咗 D 色、VS1，成粒石通透冇雜色。",
          "兩邊肩位用梯方鑽，同主石一樣係階梯切工，風格統一：最闊嗰粒貼住主石，之後一粒比一粒細，順住戒臂收窄，成個戒面好似由主石流落嚟嘅一條光帶。梯方用槽鑲，兩邊金屬夾住，冇爪勾衫。",
        ],
      },
      {
        h: "揀祖母綠形要諗嘅嘢",
        list: [
          ["淨度顏色要揀高", "階梯切工枱面大、睇得透，內含物同底色比較明顯，建議 VS1、G 色或以上。"],
          ["長闊比", "一般 1.3 至 1.5 最經典；長身啲更修長，短身啲更接近阿斯切嘅方形感。"],
          ["副石配搭", "梯方副石同主石同屬階梯切工，最協調；配圓鑽就會多啲閃但風格唔同。"],
          ["戒面闊度", "兩排梯方令戒面好闊，同對戒疊戴要預位，或者對戒做直身。"],
        ],
      },
    ],
    faq: [
      { q: "5.16 卡祖母綠形鑽石戴落有幾大？", a: "按一般比例大約 11.5 × 8.5 毫米，順手指方向戴差唔多遮住半隻手指；加埋兩排梯方，成個戒面闊過手指。", link: { label: "1 卡戴喺手上有幾大", href: "/4c/carat-size-on-hand" } },
      { q: "祖母綠形鑽石係咪冇圓鑽咁閃？", a: "係，階梯切工主要係大塊光暗反射，冇圓形明亮式咁多細碎閃光；但線條乾淨、通透，好多人鍾意佢嘅低調高級感。" },
      { q: "祖母綠形要揀幾高淨度？", a: "建議 VS1 或以上。階梯切工枱面大，好似一面鏡，內含物比明亮式容易睇到。" },
      { q: "梯方鑽係咩？", a: "梯方（baguette）係長方或者梯形嘅階梯切工細鑽，常用嚟做副石；呢隻用由大到小嘅梯形梯方，令兩邊線條順住戒臂收窄。" },
      { q: "祖母綠形同阿斯切有咩分別？", a: "兩款都係切角嘅階梯切工；祖母綠係長方形，阿斯切係正方形、帶 Art Deco 復古感。", link: { label: "培育鑽石形狀總覽", href: "/styles/shapes-overview" } },
      { q: "可唔可以做一隻差唔多嘅？", a: "可以做類似款。主石卡數、長闊比、副石粒數同大細、白金黃金或鉑金都可以揀，按你預算同手寸訂造。" },
    ],
    guides: [
      { label: "培育鑽石形狀總覽", href: "/styles/shapes-overview" },
      { label: "第四章 4C 選石", href: "/4c" },
      { label: "IGI 定 GIA", href: "/certificate/igi-or-gia" },
    ],
    images: [
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-1.webp", alt: "5.16 卡祖母綠形培育鑽石戒指，兩邊漸變梯方鑽，18K 白金" },
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-2.webp", alt: "5.16 卡祖母綠形培育鑽石戒指戴喺左手無名指", worn: true },
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-3.webp", alt: "祖母綠形戒指正面，階梯切工主石同兩排梯方" },
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-4.webp", alt: "祖母綠形戒指側面，見到四爪同戒臂" },
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-5.webp", alt: "戒臂梯方鑽由大到小排列近景" },
      { src: "/images/cases/emerald-cut-5-16ct-18k-white-gold-6.webp", alt: "祖母綠形主石階梯刻面近鏡特寫" },
    ],
    date: "2026-10",
    consent: true,
  },
  {
    slug: "oval-tennis-bracelet-18k-white-gold",
    category: "bracelets",
    title: "橢圓鑽網球手鏈・每粒約 0.25 卡・18K 白金",
    h1: "橢圓培育鑽石網球手鏈・每粒約 0.25 卡・四爪鑲",
    seoTitle: "橢圓培育鑽石網球手鏈｜每粒約 0.25 卡・D–E 色・18K白金",
    description: "橢圓培育鑽石網球手鏈：一排橢圓培育鑽石，每粒約 0.25 卡，D–E 色、VS–VVS，18K 白金四爪鑲，鏈節靈活貼手。鄒三山工坊東莞訂造，可按手腕尺寸訂造，WhatsApp 問類似款報價。",
    stone: "橢圓培育鑽石一排，每粒約 0.25 卡，D–E 色，VS–VVS",
    metal: "18K 白金",
    duration: "同類款式一般約 12–15 日",
    story: "呢條係橢圓培育鑽石網球手鏈：一粒粒大細一樣嘅橢圓培育鑽石排成一條，每粒約 0.25 卡，D 至 E 色、VS 至 VVS 淨度。每粒用四隻細爪鑲，盡量少金屬遮擋，正面睇差唔多全部都係鑽；每粒自成一節，鏈身靈活，戴落貼住手腕。金屬係 18K 白金，扣藏喺底。由鄒三山工坊港工師傅喺東莞廠房訂造。",
    highlights: ["橢圓鑽一排", "每粒約 0.25 卡", "D–E 色", "VS–VVS", "18K 白金"],
    specs: [
      ["鑽石", "橢圓培育鑽石，每粒約 0.25 卡（約 5 × 3.5 毫米），一條約三十多粒"],
      ["顏色淨度", "D–E 色，VS–VVS"],
      ["鑲法", "每粒四爪，獨立鏈節，橢圓打橫排"],
      ["扣", "藏喺鏈底"],
      ["金屬", "18K 白金"],
      ["長度", "按手腕尺寸訂造，粒數跟住加減"],
      ["證書", "碎鑽一般唔帶證書；出貨附省檢證書"],
      ["工期", "同類款式一般約 12–15 日"],
    ],
    sections: [
      {
        h: "呢件作品點做",
        p: [
          "網球手鏈睇落簡單，最難係「齊」：三十幾粒鑽大細、顏色、比例都要配到一樣，排落去先唔會有一粒特別黃或者特別細。呢條用每粒約 0.25 卡嘅橢圓鑽，D 至 E 色，成條睇落一樣白。",
          "每粒四隻細爪，金屬盡量少，橢圓打橫排，正面睇落係一條連續嘅光帶；每粒自成一個鏈節，鏈身好軟，戴落會順住手腕弧度。扣藏喺鏈底，戴落正面睇唔到。",
        ],
      },
      {
        h: "揀網球手鏈要諗嘅嘢",
        list: [
          ["長度", "手腕圍加 1 至 1.5 厘米最舒服；太鬆會轉來轉去，太緊會頂住手腕。粒數會跟長度加減。"],
          ["每粒大細", "0.1 卡秀氣、啱日日戴；0.25 卡開始好有存在感；0.5 卡以上就係晚宴級。"],
          ["圓形定橢圓", "圓鑽最經典；橢圓同卡數睇落大啲，打橫排光帶更闊。"],
          ["扣", "網球手鏈一定要有穩陣嘅扣，最好加安全扣，防止扣鬆咗甩落地。"],
        ],
      },
    ],
    faq: [
      { q: "網球手鏈點解叫網球手鏈？", a: "相傳 1980 年代網球手 Chris Evert 比賽時鑽石手鏈甩咗，停賽搵手鏈，之後呢種一排鑽嘅手鏈就叫 tennis bracelet。" },
      { q: "網球手鏈要幾長？", a: "一般係手腕圍加 1 至 1.5 厘米。度手腕最簡單係用軟尺圍一圈，訂造時話俾師傅知，粒數會按長度加減。" },
      { q: "一條網球手鏈要幾多粒鑽？", a: "視乎長度同每粒大細。以每粒約 5 毫米長嘅 0.25 卡橢圓計，一條 17 厘米左右嘅手鏈大約要三十幾粒。" },
      { q: "網球手鏈日常可以戴住嗎？", a: "可以，但做運動、搬重嘢或者沖涼最好除低，避免撞到或者扣被拉開。定期檢查爪同扣，發現鬆咗就搵師傅執。", link: { label: "第九章 保養", href: "/care" } },
      { q: "碎鑽有冇證書？", a: "每粒 0.25 卡嘅配石一般唔逐粒出證書，由師傅揀石時配對顏色淨度。工坊出貨附省檢證書，驗金屬材質同鑽石係培育。" },
      { q: "可唔可以做一條差唔多嘅？", a: "可以做類似款。長度、每粒大細、圓形定橢圓、18K 白金、黃金或玫瑰金都可以揀，按你手腕同預算訂造。" },
    ],
    video: { youtubeId: "ePGUPbbjCA0", poster: "/images/cases/oval-tennis-bracelet-18k-white-gold-video.webp", uploadDate: "2026-11-02", duration: "PT18S", seconds: 18 },
    guides: [
      { label: "第五章 形狀款式", href: "/styles" },
      { label: "第九章 保養", href: "/care" },
      { label: "第四章 4C 選石", href: "/4c" },
    ],
    images: [
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-1.webp", alt: "橢圓培育鑽石網球手鏈，18K 白金四爪鑲" },
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-2.webp", alt: "橢圓培育鑽石網球手鏈戴喺左手腕", worn: true },
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-3.webp", alt: "網球手鏈正面，一排橢圓鑽四爪鑲" },
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-4.webp", alt: "網球手鏈側面，見到鑲口高度同鏈節" },
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-5.webp", alt: "網球手鏈提起自然彎曲，鏈節靈活" },
      { src: "/images/cases/oval-tennis-bracelet-18k-white-gold-6.webp", alt: "橢圓培育鑽石同四爪近鏡特寫" },
    ],
    date: "2026-10",
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
