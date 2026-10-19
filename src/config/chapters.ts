/**
 * 藍皮書九章。slug 就是網址和 content/zh-hk/ 下的資料夾名。
 * topics 是本章規劃中的文章，未寫好前在章節頁顯示為「撰寫中」。
 */
export type Chapter = {
  slug: string;
  number: string;
  title: string;
  answers: string;
  /** 「鄒三山工坊嘅做法」小框：講工坊自己點做，同中立內容分開 */
  ourWay?: string;
  intro: string;
  topics: string[];
  /** 章節封面（3D 示意圖） */
  image: string;
  imageAlt: string;
};

export const CHAPTERS: Chapter[] = [
  {
    slug: "basics",
    image: "/images/renders/macro-ink.webp",
    imageAlt: "深藍背景下的六爪鑽石鑲嵌特寫（AI 示意圖）",
    number: "第一章",
    title: "入門",
    answers: "係咪真鑽石、點樣分辨",
    intro: "培育鑽石係咩、點樣整出嚟、同天然鑽石、莫桑石、鋯石有咩分別，先搞清楚呢幾樣，後面先唔會畀人呃。",
    topics: [
      "培育鑽石同天然鑽石、莫桑石、鋯石有咩分別",
      "CVD 同 HPHT 有咩分別",
      "培育鑽石驗唔驗到出嚟",
      "培育鑽石會唔會變色、變黃",
      "培育鑽石環保嗎？道德問題",
    ],
  },
  {
    slug: "price",
    ourWay: "工廠直出，冇中間商，訂一件都係出廠價。主石可以揀唔帶證書，會平啲。",
    image: "/images/renders/princess-wg-white.webp",
    imageAlt: "銀白色四爪公主方形主石戒指（AI 示意圖）",
    number: "第二章",
    title: "價錢",
    answers: "1 卡幾錢、會唔會跌、保唔保值",
    intro: "價錢點計、點解咁平、仲會唔會跌、轉手值幾多。呢章會老實講：培育鑽石唔保值，買嚟戴先最實際。",
    topics: [
      "1 卡培育鑽石價錢",
      "2 卡培育鑽石價錢",
      "培育鑽石點解咁平",
      "培育鑽石價錢走勢",
      "培育鑽石保唔保值、回收價",
      "預算點分配：主石 vs 戒托",
    ],
  },
  {
    slug: "certificate",
    ourWay: "出貨附廣東省質量監督金銀珠寶檢驗站（GDTC）省檢證書，驗金屬材質同鑽石係培育定天然，支持全球複檢；如有不符，按成交價賠十倍。主石可以揀帶證書（IGI 或 GIA）或者唔帶證書（平啲）；碎鑽一般唔帶證書。",
    image: "/images/renders/certificate-verification-ivory.webp",
    imageAlt: "圓形鑽石、珠寶放大鏡與無品牌報告紙，示意證書核驗（AI 示意圖）",
    number: "第三章",
    title: "證書",
    answers: "IGI 定 GIA、證書點睇",
    intro: "GIA 由 2025 年 10 月起改咗培育鑽石嘅評級方法，好多人仲未知。呢章講兩間化驗所點揀、證書點睇、刻字點核對。",
    topics: [
      "GIA 培育鑽石新制：Premium / Standard 點睇",
      "IGI 定 GIA？培育鑽石證書點揀",
      "點睇培育鑽石證書",
      "激光刻字點核對",
      "鑲好之後點驗證",
    ],
  },
  {
    slug: "4c",
    image: "/images/renders/princess-macro-white.webp",
    imageAlt: "公主方形培育鑽石刻面特寫（3D 示意）",
    number: "第四章",
    title: "4C 選石",
    answers: "切工、顏色、淨度、卡數",
    intro: "4C 每一項邊度值得畀錢、邊度可以慳，同埋培育鑽石獨有嘅生長紋同後處理問題。",
    topics: ["切工：3EX、八心八箭", "顏色", "淨度", "螢光", "卡數同視覺大小：1 卡戴喺手上有幾大", "培育鑽石生長紋同後處理"],
  },
  {
    slug: "styles",
    image: "/images/renders/halo-rg-pale.webp",
    imageAlt: "玫瑰金色光環主石戒指（AI 示意圖）",
    number: "第五章",
    title: "形狀款式",
    answers: "形狀、求婚戒、對戒、手鏈",
    intro: "六種常見形狀嘅優缺點，求婚戒指、結婚對戒、網球手鏈、耳環、吊墜點揀，同埋 18K 金同鉑金點揀。",
    topics: [
      "培育鑽石形狀總覽",
      "圓形、橢圓、梨形、祖母綠、雷地恩、墊形",
      "培育鑽石求婚戒指款式",
      "六爪 vs 四爪",
      "光環、隱藏光環",
      "三石戒",
      "培育鑽石結婚對戒、排鑽",
      "培育鑽石網球手鏈",
      "培育鑽石耳環、吊墜項鏈、男戒",
      "18K 白金、黃金、玫瑰金 vs Pt950",
    ],
  },
  {
    slug: "custom",
    ourWay: "傾好規格先開工，按傾好嘅做，唔摻假、唔虛標。全港任何地區送貨上門，見面睇貨滿意先付尾款；唔滿意即場退返全數訂金，刻咗字都照退。",
    image: "/images/renders/custom-ring-wax-ivory.webp",
    imageAlt: "綠色單石戒指蠟模與戒指設計草圖，示意訂造設計階段（AI 示意圖）",
    number: "第六章",
    title: "訂造流程",
    answers: "由問價到交貨、手寸、刻字",
    intro: "由第一次問價、揀石、3D 設計、蠟版到鑲石交貨，每一步做咩、要幾耐，同埋手寸、刻字、改圈、舊金改造。",
    topics: [
      "培育鑽石訂造流程",
      "工期同訂金",
      "戒圈尺寸點度",
      "求婚前點偷偷度戒圈",
      "刻字",
      "改圈",
      "舊金、舊鑽改造",
      "內地及海外客人遠程訂造",
    ],
  },
  {
    slug: "choose",
    ourWay: "我哋係東莞廠房直出、香港送貨上門：工坊做咗 25 年，師傅係九十年代港資廠出身，工齡 20 年以上。比較渠道嘅時候我哋都喺入面，你睇完自己判斷。",
    image: "/images/renders/stud-wg-blue.webp",
    imageAlt: "白金六爪培育鑽石耳釘（3D 示意）",
    number: "第七章",
    title: "揀商家",
    answers: "品牌店、工廠、網購、深圳",
    intro: "品牌店、工廠直訂、網購同深圳水貝各有咩好壞，揀商家要問嘅十條問題。呢章只比較渠道，唔點名評同行；我哋自己亦喺其中一個選擇。",
    topics: [
      "品牌店、工廠、網購、深圳水貝：四種渠道比較",
      "香港訂定深圳訂",
      "揀商家必問 10 條問題",
      "保養保修條款要睇咩",
      "消委會提醒你嘅事",
    ],
  },
  {
    slug: "occasions",
    image: "/images/renders/oval-pt-ink.webp",
    imageAlt: "橢圓形培育鑽石鉑金求婚戒指（3D 示意）",
    number: "第八章",
    title: "場景",
    answers: "求婚、第一次買、周年",
    intro: "求婚預算點計、第一次買點樣唔中伏、周年禮物同買俾自己，按場景講應該點揀。",
    topics: ["求婚預算點計", "第一次買培育鑽石戒指", "周年禮物", "買俾自己"],
  },
  {
    slug: "care",
    image: "/images/renders/bracelet-close-pale.webp",
    imageAlt: "培育鑽石網球手鏈（3D 示意）",
    number: "第九章",
    title: "保養",
    answers: "清潔、超聲波、日常佩戴",
    intro: "點樣清潔、可唔可以用超聲波洗、沖涼同做運動要唔要除，戴得耐啲嘅小習慣。",
    topics: ["點清潔", "可唔可以用超聲波洗", "沖涼同做運動要唔要除"],
  },
];

export const CHAPTER_SLUGS = CHAPTERS.map((c) => c.slug);

export function getChapter(slug: string) {
  return CHAPTERS.find((c) => c.slug === slug);
}
