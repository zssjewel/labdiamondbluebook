import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/link";
import { setRequestLocale } from "next-intl/server";
import { CaseGrid, CategoryNav } from "@/components/cases";
import { Breadcrumbs, JsonLd } from "@/components/site";
import { casesIn, categoryOf, isDemoCases, visibleCategories } from "@/config/cases";
import { SITE, localizeHref } from "@/config/site";
import { routing } from "@/i18n/routing";
import { robotsFor } from "@/lib/indexing";

type Params = { locale: string; category: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => visibleCategories().map((c) => ({ locale, category: c.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categoryOf(category);
  if (!cat) return {};
  const url = localizeHref(`/cases/${category}`, locale);
  const title = `培育鑽石${cat.name}作品｜${SITE.name}`;
  const description = `${cat.intro}每件寫明主石、金屬、價錢區間同工期。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    robots: robotsFor(!isDemoCases),
    openGraph: { title, description, url: `${SITE.url}${url}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = categoryOf(category);
  if (!cat) notFound();
  const list = casesIn(category);
  const crumbs = [
    { label: "首頁", href: localizeHref("/", locale) },
    { label: "作品案例", href: localizeHref("/cases", locale) },
    { label: cat.name },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${SITE.url}${c.href}` } : {}) })),
  };
  return (
    <main className="bb-cases-page">
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs items={crumbs} />
      <h1 className="bb-page__title bb-display">{cat.name}</h1>
      <p className="bb-page__lead">{cat.intro}</p>
      {isDemoCases && <p className="bb-draft">而家顯示嘅係<strong>示例</strong>：相片係 AI 或 3D 示意圖，規格全部待填。</p>}
      <CategoryNav locale={locale} current={category} />
      <CaseGrid list={list} locale={locale} />
      <aside className="bb-guides" aria-label="訂造前可以先睇">
        <h2>訂{cat.name}之前，可以先睇</h2>
        <ul>
          {cat.guides.map((g) => (
            <li key={g.href}>
              <Link className="bb-link" href={localizeHref(g.href, locale)}>
                {g.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
