import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { CaratTool } from "@/components/carat-on-hand";
import { HowDiagram } from "@/components/how-diagram";
import { JsonLd, SmartLink } from "@/components/site";
import { ContinueReading } from "@/components/reading";
import { CHAPTERS } from "@/config/chapters";
import { getAllArticles } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { SITE, localizeHref, waHref } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = localizeHref("/", locale);
  return {
    title: SITE.homeTitle,
    description: SITE.description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    openGraph: { title: SITE.homeTitle, description: SITE.description, url: `${SITE.url}${url}`, images: ["/og.png"] },
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = await getAllArticles(locale as Locale);
  const latest = articles.slice(0, 5);
  const pendingCount = CHAPTERS.reduce((n, c) => n + c.topics.filter((t) => !articles.some((a) => a.metadata.title === t)).length, 0);
  const chapterOf = (slug: string) => CHAPTERS.find((c) => c.slug === slug);

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
    <main>
      <JsonLd data={webSite} />
      <JsonLd data={faqData} />

      {/* 刊頭拼貼 */}
      <div className="bb-mosaic">
        <div className="t-pale">
          <img decoding="async" style={{ objectPosition: "50% 18%" }} src={`${R}/ring-oval-pale.webp`} alt="鉑金四爪橢圓形培育鑽石戒指（3D 示意）" width={1000} height={1000} />
        </div>
        <div className="t-blue span2r" />
        <div className="t-steel span2c">
          <img decoding="async" src={`${R}/bracelet-steel.webp`} alt="培育鑽石網球手鏈（3D 示意）" width={1400} height={700} />
        </div>
        <div className="t-white hide-sm">
          <img decoding="async" style={{ objectPosition: "50% 30%" }} src={`${R}/pendant-yg-white.webp`} alt="黃金四爪培育鑽石吊墜（3D 示意）" width={1000} height={1000} />
        </div>
        <div className="t-rose hide-sm" />
        <div className="t-steel">
          <img decoding="async" src={`${R}/band-rg-steel.webp`} alt="玫瑰金排鑽結婚戒指（3D 示意）" width={1000} height={1000} />
        </div>
        <div className="t-pale">
          <img decoding="async" style={{ objectPosition: "50% 15%" }} src={`${R}/halo-rg-pale.webp`} alt="玫瑰金光環培育鑽石戒指（3D 示意）" width={1000} height={1000} />
        </div>
        <div className="t-rose hide-sm" />
        <div className="t-blue hide-sm" />
        <div className="t-ink hide-sm">
          <img decoding="async" src={`${R}/macro-ink.webp`} alt="培育鑽石六爪鑲嵌特寫（3D 示意）" width={1000} height={1000} loading="lazy" />
        </div>
      </div>

      {/* 標題 */}
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
          <SmartLink href={waHref()} className="bb-btn bb-btn--accent">
            WhatsApp 問師傅
          </SmartLink>
          <Link href="#routes" className="bb-btn bb-btn--ghost">
            由邊度開始睇
          </Link>
        </div>
        <ContinueReading />
      </section>

      {/* 宣言 */}
      <section className="bb-tiles" aria-label="關於本書">
        <div className="bb-tiles__a" data-reveal>
          <p className="bb-display">
            做嘢嘅人
            <br />
            寫嘅書
          </p>
        </div>
        <div className="bb-tiles__b" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          <p className="bb-display">九章</p>
        </div>
        <div className="bb-tiles__c" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          <img decoding="async" style={{ objectPosition: "50% 20%" }} src={`${R}/solitaire-yg-steel.webp`} alt="黃金四爪單粒培育鑽石戒指（3D 示意）" width={1000} height={800} loading="lazy" />
        </div>
        <div className="bb-tiles__d">
          <div data-reveal>
            <p>
              《培育鑽石藍皮書》由香港鄒三山工坊編著。客人問得最多嘅問題，就係呢本書嘅目錄：價錢點計、證書點睇、邊啲錢值得畀、邊啲錢唔使畀，同埋老實講，培育鑽石唔保值。
            </p>
            <p>
              講揀商家嗰章會比較品牌店、工廠、網購同深圳水貝，當中包括我哋自己。呢點一開始就講明，你睇完自己判斷。
            </p>
          </div>
        </div>
      </section>

      {/* 閱讀路線 */}
      <section className="bb-routes" id="routes" aria-labelledby="routes-title">
        <h2 id="routes-title" className="bb-sechead bb-display" data-reveal>
          由邊度開始睇？
        </h2>
        <p className="bb-secsub" data-reveal style={{ "--d": "60ms" } as React.CSSProperties}>
          按你而家嘅情況揀一條路線，跟住次序睇就得。
        </p>
        <ol className="bb-routes__list">
          {ROUTES.map((r, i) => (
            <li key={r.name} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
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
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 目錄 */}
      <section className="bb-contents" id="contents" aria-labelledby="contents-title">
        <h2 id="contents-title" className="bb-sechead bb-display" data-reveal>
          九章，由入門到戴上手
        </h2>
        <p className="bb-secsub" data-reveal style={{ "--d": "60ms" } as React.CSSProperties}>
          已出 {articles.length} 篇 · 撰寫中 {pendingCount} 篇
        </p>
        <div className="bb-contents__body">
          <div className="bb-contents__fig" data-reveal>
            <img decoding="async" src={`${R}/princess-wg-white.webp`} alt="白金公主方形培育鑽石戒指（3D 示意）" width={1000} height={1000} loading="lazy" />
          </div>
          <div>
            <ol className="bb-toc bb-group" data-reveal aria-label="目錄">
              {CHAPTERS.map((c) => (
                <li key={c.slug}>
                  <Link href={localizeHref(`/${c.slug}`, locale)}>
                    <span className="bb-toc__num">{c.number}</span>
                    <span className="bb-toc__title">{c.title}</span>
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
            <li data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              <strong>問師傅</strong>
              <p>預算、手寸、款式傳過嚟，傾到收窄做一兩個方案。</p>
            </li>
            <li data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              <strong>訂造</strong>
              <p>揀石、3D 圖、蠟版、鑲石，做出你嗰一隻。</p>
            </li>
          </ol>
        </div>
      </section>

      {/* 卡數戴喺手上有幾大（互動） */}
      <CaratTool locale={locale} />

      {/* 問答 */}
      <section className="bb-faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="bb-sechead bb-display" data-reveal>
          常見問題
        </h2>
        <dl className="bb-faq__list">
          {FAQ.map((f, i) => (
            <div key={f.q} className="bb-faq__item" data-reveal style={{ "--d": `${(i % 2) * 60}ms` } as React.CSSProperties}>
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
        <h2 id="close-title" className="bb-display" data-reveal>
          睇完未決定？
          <br />
          直接問師傅
        </h2>
        <div className="bb-close__foot" data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
          <p>傳張款式圖、講個預算，師傅用 WhatsApp 直接答你，唔使先落訂。</p>
          <SmartLink href={waHref("你好，我睇咗培育鑽石藍皮書，想問：")} className="bb-btn bb-btn--accent">
            WhatsApp 問師傅
          </SmartLink>
        </div>
      </section>
    </main>
  );
}
