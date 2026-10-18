import type { Metadata } from "next";
import Link from "@/components/link";
import { setRequestLocale } from "next-intl/server";
import { CaseCard } from "@/components/cases";
import { Breadcrumbs } from "@/components/site";
import { CASES, isDemoCases } from "@/config/cases";
import { SITE, localizeHref } from "@/config/site";
import { robotsFor } from "@/lib/indexing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = localizeHref("/cases", locale);
  const title = `作品案例｜${SITE.name}`;
  const description = "鄒三山工坊真實做過嘅培育鑽石首飾：款式、主石、金屬、價錢區間同工期，全部經客人同意公開。";
  return {
    title,
    description,
    alternates: { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } },
    // 未有真實作品之前唔俾收錄
    robots: robotsFor(CASES.length > 0 && !isDemoCases),
    openGraph: { title, description, url: `${SITE.url}${url}` },
  };
}

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="bb-cases-page">
      <Breadcrumbs items={[{ label: "首頁", href: localizeHref("/", locale) }, { label: "作品案例" }]} />
      <h1 className="bb-page__title bb-display">作品案例</h1>
      {CASES.length > 0 ? (
        <>
          <p className="bb-page__lead">工坊真實做過嘅作品，每件都寫明主石、金屬同工期，相片同資料經客人同意公開。</p>
          {isDemoCases && <p className="bb-draft">而家顯示嘅係<strong>示例</strong>：相片係 AI 示意圖，規格全部待填，換上真實作品後會自動消失。</p>}
          <div className="bb-cases">
            {CASES.map((c) => (
              <CaseCard key={c.slug} item={c} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 420px" />
            ))}
          </div>
        </>
      ) : (
        <div className="bb-cases-empty">
          <p className="bb-page__lead">第一批作品相片整理緊。每件會寫明款式、主石、金屬、價錢區間同工期，全部係工坊真實做過、經客人同意公開嘅作品。</p>
          <p>
            整理期間，可以先睇
            <Link className="bb-link" href={localizeHref("/basics/vs-natural-moissanite", locale)}>
              培育鑽石同天然鑽石、莫桑石有咩分別
            </Link>
            ，或者
            <Link className="bb-link" href={localizeHref("/4c/carat-size-on-hand", locale)}>
              1 卡戴喺手上有幾大
            </Link>
            。
          </p>
        </div>
      )}
    </main>
  );
}
