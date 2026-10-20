import type { Metadata } from "next";
import Link from "@/components/link";
import { setRequestLocale } from "next-intl/server";
import { CaratTool } from "@/components/carat-on-hand";
import { HowDiagram } from "@/components/how-diagram";
import { JsonLd, SmartLink } from "@/components/site";
import { ContinueReading } from "@/components/reading";
import { CHAPTERS } from "@/config/chapters";
import { getAllArticles } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { SITE, hasContact, localizeHref, waHref } from "@/config/site";
import { CASES, mixed, visibleCategories } from "@/config/cases";
import { HomeShelf } from "@/components/cases";
import { imgProps } from "@/lib/images";
import { robotsFor } from "@/lib/indexing";
import { PROMISES } from "@/config/promises";
import { shareImages } from "@/lib/share";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = localizeHref("/", locale);
  return {
    title: SITE.homeTitle,
    description: SITE.description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    robots: robotsFor(true),
    openGraph: { title: SITE.homeTitle, description: SITE.description, url: `${SITE.url}${url}`, images: shareImages().ogImages },
    twitter: shareImages().twitter,
  };
}

const R = "/images/renders";

const FAQ = [
  {
    q: "培育鑽石係咪真鑽石？",
    more: "/basics",
    a: "係。成分同天然鑽石一樣係碳結晶，硬度同樣係 10，折射同火彩都一樣；莫桑石同鋯石就唔係鑽石。",
  },
  {
    q: "肉眼分唔分到培育同天然？",
    more: "/basics",
    a: "分唔到，連一般鑽石測試筆都分唔到，要靠化驗所儀器。正規證書嘅石，腰部會有激光刻字對返證書號碼。",
  },
  {
    q: "培育鑽石保唔保值？",
    more: "/price",
    a: "唔保值。轉手一般只值零售價一至三成，甚至更低。當首飾買嚟戴最實際，唔好當投資。",
  },
  {
    q: "價錢仲會唔會跌？",
    more: "/price",
    a: "大顆嘅仲喺度跌。業內批發價數據顯示，今年按年跌約一成三，2 卡跌約兩成，1 卡就大致企穩。",
  },
  {
    q: "IGI 同 GIA 證書有咩分別？",
    more: "/certificate",
    a: "GIA 由 2025 年 10 月起唔再為培育鑽石逐項評 4C，只分 Premium、Standard 兩級；IGI 仍然逐項評 4C。第三章會詳細講點揀。",
  },
  {
    q: "培育鑽石會唔會變色？",
    more: "/4c",
    a: "正常唔會。有啲 CVD 石出爐後做過顏色處理，證書會註明；寫住 As Grown 即係冇做生長後處理。",
  },
  {
    q: "CVD 同 HPHT 邊種好啲？",
    more: "/basics",
    a: "兩種都係真培育鑽石，好壞要睇返每粒石嘅 4C 同證書，唔係睇用邊種方法整。",
  },
  {
    q: "訂造要幾耐？",
    more: "/custom",
    a: "由揀石、3D 設計、蠟版到鑲石，時間視乎款式同工序，第六章會逐步講；你個款要幾耐，可以直接問師傅。",
  },
  {
    q: "喺香港訂定去深圳訂？",
    more: "/choose",
    a: "兩邊都有好有唔好，價錢、溝通、驗貨同售後方式都唔同。第七章會逐項比較，你睇完再揀。",
  },
  {
    q: "你哋喺邊度做？",
    more: "/about#story",
    a: "東莞廠房，做咗 25 年；師傅係九十年代港資廠出身，工齡 20 年以上，堅持港工。做好之後全港送貨上門。",
  },
  {
    q: "唔滿意點算？",
    more: "/about#promise",
    a: "送貨上門，見面睇貨滿意先付尾款；唔滿意即場退返全數訂金，刻咗字都照退。",
  },
  {
    q: "點證明材質冇問題？",
    more: "/certificate",
    a: "出貨附廣東省質量監督金銀珠寶檢驗站（GDTC）省檢證書，驗金屬材質同鑽石係培育定天然，支持全球複檢；如有不符，按成交價賠十倍。",
  },
  {
    q: "你哋會唔會推薦自己？",
    more: "/about#disclosure",
    a: "會。本書由鄒三山工坊編著，推薦名單包括我哋自己；比較嘅章節只比渠道，唔點名評同行。",
  },
];

/** 按讀者情況的閱讀路線（借鑑同類藍皮書的「按目標進入」） */
const ROUTES = [
  {
    name: "準備求婚，第一次買",
    who: "未買過鑽石首飾，想由頭了解，唔想中伏。",
    path: ["basics", "4c", "styles", "custom"],
  },
  {
    name: "已經有心水款，想問價",
    who: "知道想要咩款，想知合理價錢同點揀商家。",
    path: ["price", "certificate", "choose"],
  },
  {
    name: "未決定買唔買培育鑽石",
    who: "想知同天然鑽石有咩分別、值唔值得。",
    path: ["basics", "price"],
  },
];

/** 首屏三條快答：只連去已經寫好嘅文章；章節未寫好就如實標「撰寫中」 */
const ANSWERS = [
  {
    q: "培育鑽石係咪真鑽石？",
    a: "係。同天然鑽石一樣係碳結晶，硬度 10；莫桑石同鋯石就唔係鑽石。",
    href: "/basics/vs-natural-moissanite",
    label: "睇四種石點分",
  },
  {
    q: "1 卡戴喺手上有幾大？",
    a: "直徑約 6.4 毫米，大概佔手指闊度四成；2 卡約 8.1 毫米，唔係大一倍。",
    href: "/4c/carat-size-on-hand",
    label: "拉一拉睇大細",
  },
  {
    q: "IGI 定 GIA 證書？",
    a: "GIA 由 2025 年 10 月起只分 Premium、Standard 兩級；IGI 仍然逐項評 4C。",
    href: "/certificate",
    label: "睇第三章 證書",
  },
];

/** 「點解揀鄒三山工坊」嘅 AI 寫實示意圖（workshop-v2，每張有 480/800/1200 三個闊度）。唔係工坊、客人或檢驗機構實拍 */
const W2 = "/images/workshop-v2";
function workshopImg(name: string, widths: number[], sizes: string) {
  const top = widths[widths.length - 1];
  return { src: `${W2}/${name}-${top}.webp`, srcSet: widths.map((w) => `${W2}/${name}-${w}.webp ${w}w`).join(", "), sizes };
}
const WHY_FIGS: Record<string, { name: string; alt: string; cap: string }> = {
  price: { name: "factory-direct-v2", alt: "工坊師傅把單件戒指禮盒裝箱出貨（AI 示意圖）", cap: "工坊直接出貨" },
  cert: { name: "quality-certificate-v2", alt: "珠寶品質檢驗報告的示意樣本，並非真實證書（AI 生成）", cap: "質檢報告示意" },
  delivery: { name: "doorstep-handover-v2", alt: "工作人員送貨到家，與顧客當面開盒驗看戒指（AI 示意圖）", cap: "上門交付驗貨" },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = await getAllArticles(locale as Locale);
  // 示例大綱唔計入「已出」同最新文章
  const articles = all.filter((a) => !a.metadata.placeholder);
  const latest = articles.slice(0, 5);
  const pendingCount = CHAPTERS.reduce((n, c) => n + c.topics.filter((t) => !articles.some((a) => a.metadata.title === t)).length, 0);
  const chapterOf = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
  const countOf = (slug: string) => articles.filter((a) => a.contentType === slug).length;

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `${SITE.url}${localizeHref("/", locale)}`,
    inLanguage: SITE.htmlLang,
    description: SITE.description,
    publisher: { "@type": "Organization", name: SITE.publisher },
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd data={webSite} />
      <JsonLd data={faqData} />

      {/* 刊頭拼貼：8 張 AI 示意圖 + 兩格品牌色 */}
      <div className="bb-mosaic">
        <div className="t-white">
          <img decoding="async" {...imgProps(`${R}/ring-oval-pale.webp`, "(max-width: 760px) 34vw, 17vw")} alt="銀白色四爪橢圓主石戒指，暖白背景（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-blue span2r" />
        <div className="t-white span2c">
          <img decoding="async" fetchPriority="high" {...imgProps(`${R}/bracelet-steel.webp`, "(max-width: 760px) 34vw, 34vw")} alt="銀白色圓鑽網球手鏈，橢圓形平放展示（AI 示意圖）" width={1400} height={700} />
        </div>
        <div className="t-white hide-sm">
          <img decoding="async" loading="lazy" style={{ objectPosition: "50% 70%" }} {...imgProps(`${R}/pendant-yg-white.webp`, "(max-width: 760px) 34vw, 17vw")} alt="黃金色四爪單鑽吊墜與細鏈（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-white hide-sm">
          <img decoding="async" loading="lazy" {...imgProps(`${R}/solitaire-yg-steel.webp`, "(max-width: 760px) 34vw, 17vw")} alt="黃金色四爪單石戒指，暖白背景（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-white">
          <img decoding="async" {...imgProps(`${R}/halo-rg-pale.webp`, "(max-width: 760px) 34vw, 17vw")} alt="玫瑰金色光環主石戒指（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-white hide-sm">
          <img decoding="async" loading="lazy" {...imgProps(`${R}/band-rg-steel.webp`, "(max-width: 760px) 34vw, 17vw")} alt="玫瑰金色排鑽戒指，側前方展示（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-rose hide-sm" />
        <div className="t-white hide-sm">
          <img decoding="async" loading="lazy" {...imgProps(`${R}/princess-wg-white.webp`, "(max-width: 760px) 34vw, 17vw")} alt="銀白色四爪公主方形主石戒指（AI 示意圖）" width={1000} height={1000} />
        </div>
        <div className="t-ink">
          <img decoding="async" {...imgProps(`${R}/macro-ink.webp`, "(max-width: 760px) 34vw, 17vw")} alt="深藍背景下的六爪鑽石鑲嵌特寫（AI 示意圖）" width={1000} height={1000} />
        </div>
      </div>

      {/* 標題 + 三條快答 */}
      <section className="bb-hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="bb-hero__title bb-display">
          <span className="bb-line">
            <span>培育鑽石</span>
          </span>
          <span className="bb-line">
            <span>訂造攻略</span>
          </span>
        </h1>
        <p className="bb-hero__stand bb-after-title">鄒三山工坊編著。價錢點計、證書點睇、訂造點做，師傅將行內做法一次講清。</p>
        <div className="bb-hero__actions bb-after-title">
          {hasContact ? (
            <SmartLink href={waHref()} className="bb-btn bb-btn--accent">
              WhatsApp 問師傅
            </SmartLink>
          ) : (
            <Link href="#routes" className="bb-btn bb-btn--accent">
              由邊度開始睇
            </Link>
          )}
          <Link href={hasContact ? "#routes" : "#contents"} className="bb-btn bb-btn--ghost">
            {hasContact ? "由邊度開始睇" : "睇九章目錄"}
          </Link>
        </div>
        <ul className="bb-trust bb-after-title" aria-label="工坊承諾">
          {PROMISES.map((p) => (
            <li key={p.key}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3.5 8.5 3 3 6-7" />
              </svg>
              {p.badge}
            </li>
          ))}
        </ul>
        <ContinueReading />
        <ul className="bb-answers bb-after-title" aria-label="快答">
          {ANSWERS.map((x) => (
            <li key={x.q}>
              <Link href={localizeHref(x.href, locale)}>
                <strong>{x.q}</strong>
                <span>{x.a}</span>
                <em>{x.label}</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 工坊作品：蘋果式左右滑貨架，上面分類 */}
      {CASES.length > 0 && (
        <section className="bb-works" id="works" aria-labelledby="works-title">
          <div className="bb-works__head">
            <h2 id="works-title" className="bb-sechead bb-display" data-reveal>
              工坊作品
            </h2>
            <p className="bb-secsub" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              按類別左右滑，撳入去睇主石、金屬同工期。
            </p>
          </div>
          <HomeShelf locale={locale} featured={mixed(undefined, 12)} />
        </section>
      )}

      {/* 閱讀路線 */}
      <section className="bb-routes" id="routes" aria-labelledby="routes-title">
        <h2 id="routes-title" className="bb-sechead bb-display" data-reveal>
          由邊度開始睇？
        </h2>
        <p className="bb-secsub" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          按你而家嘅情況揀一條路線，跟住次序睇就得。
        </p>
        <ol className="bb-routes__list">
          {ROUTES.map((r, i) => (
            <li key={r.name} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <div className="bb-routes__card">
                <h3>{r.name}</h3>
                <p>{r.who}</p>
                <ol className="bb-routes__path">
                  {r.path.map((slug, j) => {
                    const c = chapterOf(slug);
                    if (!c) return null;
                    return (
                      <li key={slug}>
                        <span className="bb-routes__step">{j + 1}</span>
                        <Link href={localizeHref(`/${slug}`, locale)}>{`${c.number} ${c.title}`}</Link>
                        {countOf(slug) === 0 && <span className="bb-tag">撰寫中</span>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 卡數戴喺手上有幾大（互動） */}
      <CaratTool locale={locale} worksHref={visibleCategories().some((c) => c.slug === "engagement-rings") ? localizeHref("/cases/engagement-rings", locale) : undefined} />

      {/* 目錄 */}
      <section className="bb-contents" id="contents" aria-labelledby="contents-title">
        <h2 id="contents-title" className="bb-sechead bb-display" data-reveal>
          九章，由入門到戴上手
        </h2>
        <p className="bb-secsub" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          已出 {articles.length} 篇 · 撰寫中 {pendingCount} 篇
        </p>
        <div className="bb-contents__body">
          <div className="bb-contents__list">
            <ol className="bb-toc bb-group" data-reveal aria-label="目錄">
              {CHAPTERS.map((c) => (
                <li key={c.slug}>
                  <Link href={localizeHref(`/${c.slug}`, locale)}>
                    <span className="bb-toc__num">{c.number}</span>
                    <span className="bb-toc__title">
                      {c.title}
                      <span className="bb-tag">{countOf(c.slug) > 0 ? `${countOf(c.slug)} 篇` : "撰寫中"}</span>
                    </span>
                    <span className="bb-toc__ans">{c.answers}</span>
                  </Link>
                </li>
              ))}
            </ol>
            {latest.length > 0 && (
              <div className="bb-latest" data-reveal>
                <h3>最新文章</h3>
                <ul className="bb-group">
                  {latest.map((a) => (
                    <li key={`${a.contentType}/${a.slug}`}>
                      <Link href={localizeHref(`/${a.contentType}/${a.slug}`, locale)}>
                        <span className="bb-latest__title">{a.metadata.title}</span>
                        <span className="bb-latest__meta">
                          {chapterOf(a.contentType)?.number} · {a.metadata.lastModified ?? a.metadata.date}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* 書模放右邊，排喺目錄之後：讀屏同鍵盤先到目錄；手機隱藏 */}
          <figure className="bb-contents__fig" data-reveal="panel">
            <span className="bb-contents__frame">
              <img
                src="/images/contents/bluebook-model-1000.webp"
                srcSet="/images/contents/bluebook-model-480.webp 480w, /images/contents/bluebook-model-720.webp 720w, /images/contents/bluebook-model-1000.webp 1000w"
                sizes="min(34vw, 440px)"
                alt="培育鑽石藍皮書精裝立體書概念模型，藍色封面與書脊印有書名，封面附鑽石及選購主題（AI 示意圖）"
                width={1000}
                height={1250}
                loading="lazy"
                decoding="async"
              />
            </span>
            <figcaption>
              書籍概念示意<span className="bb-demo">AI 示意</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 點解揀鄒三山工坊：四個承諾 */}
      <section className="bb-why" aria-labelledby="why-title">
        <h2 id="why-title" className="bb-sechead bb-display" data-reveal>
          點解揀鄒三山工坊
        </h2>
        <p className="bb-secsub" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          《培育鑽石藍皮書》由鄒三山工坊編著。講揀商家嗰章會比較埋我哋自己，你睇完自己判斷。
          <Link className="bb-link bb-why__terms" href={localizeHref("/about", locale) + "#promise"}>
            四項承諾完整條款
          </Link>
        </p>
        <div className="bb-why__grid">
          <div className="bb-why__a" data-reveal="panel">
            <h3 className="bb-display">
              <span className="bb-nobreak">25 年東莞老廠，</span>
              <span className="bb-nobreak">港工老師傅</span>
            </h3>
            <div className="bb-why__foot">
              <p>{PROMISES[0].body}</p>
            <Link className="bb-link bb-link--on-dark" href={localizeHref("/about", locale) + "#story"}>
              工坊故事
            </Link>
            </div>
          </div>
          <figure className="bb-why__img" data-reveal="panel" style={{ "--i": 1 } as React.CSSProperties}>
            <img
              {...workshopImg("workshop-interior-v2", [480, 800, 1200], "(max-width: 860px) 100vw, min(42vw, 570px)")}
              alt="珠寶工坊內師傅、工作台與工具的場景（AI 寫實示意圖）"
              width={1200}
              height={1200}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              工坊場景<span className="bb-demo">AI 示意</span>
            </figcaption>
          </figure>
          {PROMISES.slice(1).map((p, i) => (
            <div key={p.key} className={`bb-why__card bb-why__card--${p.key}`} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              {WHY_FIGS[p.key] && (
                <figure className="bb-why__fig">
                  <img
                    {...workshopImg(WHY_FIGS[p.key].name, [480, 800, 1200], "(max-width: 860px) calc(100vw - 80px), min(29vw, 400px)")}
                    alt={WHY_FIGS[p.key].alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    {WHY_FIGS[p.key].cap}
                    <span className="bb-demo">AI 示意</span>
                  </figcaption>
                </figure>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 多變一 */}
      <section className="bb-how" aria-labelledby="how-title">
        <div className="bb-how__intro" data-reveal>
          <h2 id="how-title" className="bb-how__head bb-display">
            <span className="bb-nobreak">資料好亂？</span>
            <span className="bb-nobreak">收窄成一隻戒指</span>
          </h2>
          <p>4C、證書、價錢、款式一次過湧埋嚟，好易亂。先睇書有個底，再同師傅傾到收窄，最後先落單。</p>
        </div>
        <div className="bb-how__layout">
          <HowDiagram />
          <ol className="bb-how__steps">
            <li data-reveal>
              <strong>睇書</strong>
              <p>4C、證書、價錢先有個底，知道邊度值得畀錢。</p>
            </li>
            <li data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <strong>問師傅</strong>
              <p>預算、手寸、款式傳過嚟，傾到收窄做一兩個方案。</p>
            </li>
            <li data-reveal style={{ "--i": 2 } as React.CSSProperties}>
              <strong>訂造</strong>
              <p>揀石、3D 圖、蠟版、鑲石，做出你嗰一隻。</p>
            </li>
          </ol>
          <p className="bb-how__note">圖片為 AI 寫實示意圖</p>
        </div>
      </section>

      {/* 問答 */}
      <section className="bb-faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="bb-sechead bb-display" data-reveal>
          常見問題
        </h2>
        <dl className="bb-faq__list">
          {FAQ.map((f, i) => (
            <div key={f.q} className="bb-faq__item" data-reveal style={{ "--i": i % 2 } as React.CSSProperties}>
              <dt>{f.q}</dt>
              <dd>
                <p>{f.a}</p>
                <Link className="bb-faq__more" href={localizeHref(f.more, locale)}>
                  延伸閱讀
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 結尾 */}
      <section className="bb-close" aria-labelledby="close-title">
        <h2 id="close-title" className="bb-display" data-reveal="light">
          睇完未決定？
          {hasContact && (
            <>
              <br />
              直接問師傅
            </>
          )}
        </h2>
        <div className="bb-close__foot" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {hasContact ? (
            <>
              <p>傳張款式圖、講個預算，師傅用 WhatsApp 直接答你。</p>
              <SmartLink href={waHref("你好，我睇咗培育鑽石藍皮書，想問：")} className="bb-btn bb-btn--accent">
                WhatsApp 問師傅
              </SmartLink>
            </>
          ) : (
            <>
              <p>問師傅嘅聯絡方式籌備中，開通後會喺呢度公佈。可以先由第一章睇起。</p>
              <Link href={localizeHref("/basics", locale)} className="bb-btn bb-btn--accent">
                由第一章開始睇
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
