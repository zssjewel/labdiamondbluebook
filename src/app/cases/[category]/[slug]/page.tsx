import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/link";
import { setRequestLocale } from "next-intl/server";
import { CaseGallery } from "@/components/case-gallery";
import { CaseSize } from "@/components/case-size";
import { RelatedShelf } from "@/components/cases";
import { Demo } from "@/components/demo";
import { Breadcrumbs, JsonLd, SmartLink } from "@/components/site";
import { CASES, casesIn, categoryOf, mixed, visibleCategories } from "@/config/cases";
import { SITE, hasContact, localizeHref, waHref } from "@/config/site";
import { robotsFor } from "@/lib/indexing";
import { PROMISE_SHORT } from "@/config/promises";
import { shareImages } from "@/lib/share";

type Params = { category: string; slug: string };

/** 訂造五步（同第六章〈訂造流程〉一致）；唔寫每步幾多日，總工期跟作品資料 */
const CUSTOM_STEPS: [string, string][] = [
  ["傾需求同預算", "WhatsApp 講款式、預算同手寸"],
  ["揀石", "按預算揀主石，睇證書同影片"],
  ["3D 設計同蠟版", "確認款式、比例先開工"],
  ["鑄造、鑲石、執模", "港工師傅逐粒鑲、拋光"],
  ["交貨同售後", "附省檢證書，送貨上門"],
];

export function generateStaticParams() {
  const shown = new Set(visibleCategories().map((c) => c.slug));
  return CASES.filter((c) => shown.has(c.category)).map((c) => ({ category: c.category, slug: c.slug }));
}

function find(category: string, slug: string) {
  return CASES.find((c) => c.category === category && c.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params;
  const locale = SITE.locale;
  const item = find(category, slug);
  if (!item) return {};
  const cat = categoryOf(category);
  const url = localizeHref(`/cases/${category}/${slug}`, locale);
  const title = item.seoTitle ? `${item.seoTitle}｜${SITE.name}` : `${item.title}｜培育鑽石${cat?.name ?? ""}作品｜${SITE.name}`;
  const description = item.description ?? `${item.title}：主石 ${item.stone}；金屬 ${item.metal}。${item.story}`.slice(0, 150);
  const image = item.images[0];
  const share = shareImages(image ? { url: image.src, width: 1000, height: 1000, alt: image.alt } : undefined);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    robots: robotsFor(!item.demo),
    openGraph: { title, description, url: `${SITE.url}${url}`, images: share.ogImages },
    twitter: share.twitter,
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const locale = SITE.locale;
  setRequestLocale(locale);
  const item = find(category, slug);
  const cat = categoryOf(category);
  if (!item || !cat) notFound();
  const same = casesIn(category).filter((c) => c.slug !== slug);
  const other = mixed(undefined, 8, slug).filter((c) => c.category !== category);
  const placeholders = item.demo && item.images.length < 3 ? ["戴喺手上嘅相（待補）", "細節或者證書相（待補）"].slice(0, 3 - item.images.length) : [];
  const crumbs = [
    { label: "首頁", href: localizeHref("/", locale) },
    { label: "作品案例", href: localizeHref("/cases", locale) },
    { label: cat.name, href: localizeHref(`/cases/${category}`, locale) },
    { label: item.title },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${SITE.url}${c.href}` } : {}) })),
  };
  const ask = waHref(`你好，我睇咗作品「${item.title}」，想做類似嘅，想問：`);
  const guides = item.guides ?? cat.guides;
  const productLd = item.demo
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: item.h1 ?? item.title,
        description: item.description ?? item.story,
        image: item.images.map((im) => `${SITE.url}${im.src}`),
        url: `${SITE.url}${localizeHref(`/cases/${category}/${slug}`, locale)}`,
        category: cat.name,
        brand: { "@type": "Brand", name: SITE.publisher },
        manufacturer: { "@type": "Organization", name: SITE.publisher },
        material: item.metal,
        productionDate: item.date,
        additionalProperty: (item.specs ?? [["主石", item.stone], ["金屬", item.metal]]).map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
      };
  const videoLd = item.video
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `${item.h1 ?? item.title}｜實拍影片`,
        description: item.description ?? item.story,
        thumbnailUrl: `${SITE.url}${item.video.poster}`,
        uploadDate: item.video.uploadDate,
        duration: item.video.duration,
        embedUrl: `https://www.youtube.com/embed/${item.video.youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${item.video.youtubeId}`,
      }
    : null;
  const faqLd = item.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: item.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;
  const specs: [string, string | undefined][] = item.specs ? [...item.specs, ["完成", item.date.replace("-", " 年 ") + " 月"]] : [
    ["主石", item.stone],
    ["金屬", item.metal],
    ["價錢", item.priceRange],
    ["工期", item.duration],
    ["完成", item.date.replace("-", " 年 ") + " 月"],
  ];
  return (
    <main id="main" tabIndex={-1} className="bb-case-page">
      <JsonLd data={breadcrumbLd} />
      {productLd && <JsonLd data={productLd} />}
      {faqLd && <JsonLd data={faqLd} />}
      {videoLd && <JsonLd data={videoLd} />}
      <Breadcrumbs items={crumbs} />
      <div className="bb-case-page__grid">
        <div className="bb-case-page__media">
          <CaseGallery
            images={item.images}
            placeholders={placeholders}
            video={item.video ? { id: item.video.youtubeId, poster: item.video.poster, label: `實拍影片 ${Math.floor(item.video.seconds / 60)}:${String(item.video.seconds % 60).padStart(2, "0")}` } : undefined}
          />
        </div>
        <div className="bb-case-page__info">
          <p className="bb-case-page__cat">
            <Link href={localizeHref(`/cases/${category}`, locale)}>{cat.name}</Link>
            <Demo show={!!item.demo} />
          </p>
          <h1 className="bb-page__title bb-display">{item.h1 ?? item.title}</h1>
          {item.highlights && (
            <ul className="bb-case-hl" aria-label="重點規格">
              {item.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <dl className="bb-specs">
            {specs
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          <p className="bb-case-page__story">{item.story}</p>
          <div className="bb-case-page__actions">
            {hasContact && (
              <SmartLink href={ask} className="bb-btn bb-btn--accent">
                想做類似嘅，問師傅
              </SmartLink>
            )}
            <Link href={localizeHref(`/cases/${category}`, locale)} className="bb-btn bb-btn--ghost">
              睇其他{cat.name}
            </Link>
          </div>
          <ul className="bb-trust bb-trust--list" aria-label="工坊承諾">
            {PROMISE_SHORT.map((t) => (
              <li key={t}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
                {t}
              </li>
            ))}
            <li className="bb-trust__more">
              <Link className="bb-link" href={localizeHref("/about", locale) + "#promise"}>
                睇完整條款
              </Link>
            </li>
          </ul>
          <div className="bb-guides bb-guides--inline">
            <h2>訂之前可以先睇</h2>
            <ul>
              {guides.map((g) => (
                <li key={g.href}>
                  <Link className="bb-link" href={localizeHref(g.href, locale)}>
                    {g.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {(item.sections?.length || item.faq?.length) && (
        <div className="bb-case-body">
          {item.sections?.map((sec) => (
            <section key={sec.h} className="bb-case-body__sec">
              <h2>{sec.h}</h2>
              {sec.p?.map((t) => <p key={t}>{t}</p>)}
              {sec.figure === "size" && item.sizeGuide && <CaseSize size={item.sizeGuide} caption={item.sizeGuide.caption} />}
              {sec.list && (
                <dl className="bb-case-cards">
                  {sec.list.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
          {!item.demo && (
            <section className="bb-case-body__sec bb-case-steps">
              <h2>由落單到交貨{item.duration ? `（${item.duration}）` : ""}</h2>
              <ol>
                {CUSTOM_STEPS.map(([k, v], i) => (
                  <li key={k}>
                    <span className="bb-case-steps__n" aria-hidden="true">
                      {i + 1}
                    </span>
                    <strong>{k}</strong>
                    <span>{v}</span>
                  </li>
                ))}
              </ol>
              <p>
                <Link className="bb-link" href={localizeHref("/custom/process", locale)}>
                  睇訂造流程詳細講解
                </Link>
              </p>
            </section>
          )}
          {item.faq && (
            <section className="bb-case-body__sec bb-case-faq">
              <h2>常見問題</h2>
              <dl className="bb-case-faq__list">
                {item.faq.map((f) => (
                  <div key={f.q} className="bb-faq__item">
                    <dt>{f.q}</dt>
                    <dd>
                      <p>
                        {f.a}
                        {f.link && (
                          <>
                            {" "}
                            <Link className="bb-link" href={localizeHref(f.link.href, locale)}>
                              睇〈{f.link.label}〉
                            </Link>
                          </>
                        )}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}
      {hasContact && (
        <div className="bb-buybar">
          <span className="bb-buybar__t">{item.title}</span>
          <SmartLink href={ask} className="bb-btn bb-btn--accent">
            問類似款
          </SmartLink>
        </div>
      )}
      <RelatedShelf locale={locale} list={same} title={`其他${cat.name}`} moreHref={localizeHref(`/cases/${category}`, locale)} moreLabel={`睇全部${cat.name}`} />
      <RelatedShelf locale={locale} list={other} title="其他類別" />
    </main>
  );
}
