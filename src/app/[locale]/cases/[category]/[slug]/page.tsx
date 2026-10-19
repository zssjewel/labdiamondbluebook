import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/link";
import { setRequestLocale } from "next-intl/server";
import { CaseGallery } from "@/components/case-gallery";
import { RelatedShelf } from "@/components/cases";
import { Demo } from "@/components/demo";
import { Breadcrumbs, JsonLd, SmartLink } from "@/components/site";
import { CASES, casesIn, categoryOf, isDemoCases, mixed, visibleCategories } from "@/config/cases";
import { SITE, hasContact, localizeHref, waHref } from "@/config/site";
import { routing } from "@/i18n/routing";
import { robotsFor } from "@/lib/indexing";
import { PROMISE_SHORT } from "@/config/promises";
import { shareImages } from "@/lib/share";

type Params = { locale: string; category: string; slug: string };

export function generateStaticParams() {
  const shown = new Set(visibleCategories().map((c) => c.slug));
  return routing.locales.flatMap((locale) => CASES.filter((c) => shown.has(c.category)).map((c) => ({ locale, category: c.category, slug: c.slug })));
}

function find(category: string, slug: string) {
  return CASES.find((c) => c.category === category && c.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const item = find(category, slug);
  if (!item) return {};
  const cat = categoryOf(category);
  const url = localizeHref(`/cases/${category}/${slug}`, locale);
  const title = `${item.title}｜培育鑽石${cat?.name ?? ""}作品｜${SITE.name}`;
  const description = `${item.title}：主石 ${item.stone}；金屬 ${item.metal}。${item.story}`.slice(0, 150);
  const image = item.images[0];
  const share = shareImages(image ? { url: image.src, width: 1000, height: 1000, alt: image.alt } : undefined);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    robots: robotsFor(!isDemoCases),
    openGraph: { title, description, url: `${SITE.url}${url}`, images: share.ogImages },
    twitter: share.twitter,
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);
  const item = find(category, slug);
  const cat = categoryOf(category);
  if (!item || !cat) notFound();
  const same = casesIn(category).filter((c) => c.slug !== slug);
  const other = mixed(undefined, 8, slug).filter((c) => c.category !== category);
  const placeholders = isDemoCases && item.images.length < 3 ? ["戴喺手上嘅相（待補）", "細節或者證書相（待補）"].slice(0, 3 - item.images.length) : [];
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
  const specs: [string, string | undefined][] = [
    ["主石", item.stone],
    ["金屬", item.metal],
    ["價錢", item.priceRange],
    ["工期", item.duration],
    ["完成", item.date.replace("-", " 年 ") + " 月"],
  ];
  return (
    <main id="main" tabIndex={-1} className="bb-case-page">
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs items={crumbs} />
      <div className="bb-case-page__grid">
        <div className="bb-case-page__media">
          <CaseGallery images={item.images} placeholders={placeholders} />
        </div>
        <div className="bb-case-page__info">
          <p className="bb-case-page__cat">
            <Link href={localizeHref(`/cases/${category}`, locale)}>{cat.name}</Link>
            <Demo show={isDemoCases} />
          </p>
          <h1 className="bb-page__title bb-display">{item.title}</h1>
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
              {cat.guides.map((g) => (
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
      <RelatedShelf locale={locale} list={same} title={`其他${cat.name}`} moreHref={localizeHref(`/cases/${category}`, locale)} moreLabel={`睇全部${cat.name}`} />
      <RelatedShelf locale={locale} list={other} title="其他類別" />
    </main>
  );
}
