import Link from "@/components/link";
import { CardText, CaseShelf, type ShelfItem } from "@/components/case-shelf";
import { Demo } from "@/components/demo";
import { CASE_CATEGORIES, CASES, type Case, caseHref, categoryOf, isDemoCases, visibleCategories } from "@/config/cases";
import { localizeHref } from "@/config/site";
import { imgProps } from "@/lib/images";
import { CategoryTabs } from "@/components/category-tabs";

export const catNames: Record<string, string> = Object.fromEntries(CASE_CATEGORIES.map((c) => [c.slug, c.name]));

export function toShelf(list: Case[], locale: string): ShelfItem[] {
  return list.map((c) => ({ h: localizeHref(caseHref(c), locale), t: c.title, c: c.category, s: c.images[0]?.src ?? "", a: c.images[0]?.alt ?? c.title, d: !!c.demo }));
}

/** 首頁：有分類嘅作品貨架 */
export function HomeShelf({ locale, featured }: { locale: string; featured: Case[] }) {
  const tabs = visibleCategories().map((c) => ({ slug: c.slug, name: c.name, count: c.count }));
  const shownSlugs = new Set(tabs.map((t) => t.slug));
  const items = toShelf(
    CASES.filter((c) => shownSlugs.has(c.category)),
    locale,
  );
  return (
    <CaseShelf
      items={items}
      all={toShelf(featured, locale).map((i) => i.h)}
      tabs={tabs}
      catNames={catNames}
      allHref={localizeHref("/cases", locale)}
      catHref={localizeHref("/cases/{c}", locale)}
      label="工坊作品"
      demo={isDemoCases}
    />
  );
}

/** 章節、文章、作品頁：相關作品（冇分類列） */
/** 出口卡：去分類頁就寫「睇全部＋分類名」，去總表就寫「睇更多作品」，唔寫數字（推薦只係部分作品） */
export function RelatedShelf({ locale, list, title, sub, moreHref, moreLabel = "睇更多作品" }: { locale: string; list: Case[]; title: string; sub?: string; moreHref?: string; moreLabel?: string }) {
  if (list.length === 0) return null;
  return (
    <section className="bb-related" aria-label={title}>
      <div className="bb-related__head">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      <CaseShelf
        items={toShelf(list, locale)}
        catNames={catNames}
        allHref={moreHref ?? localizeHref("/cases", locale)}
        moreLabel={moreLabel}
        label={title}
        demo={isDemoCases}
        inset
      />
    </section>
  );
}

/** 作品列表頁、分類頁：卡片網格 */
export function CaseGrid({ list, locale }: { list: Case[]; locale: string }) {
  return (
    <ul className="bb-casegrid">
      {list.map((c, i) => (
        <li key={c.slug} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
          <Link href={localizeHref(caseHref(c), locale)} className="bb-shelf__card">
            <span className="bb-shelf__img">
              <img
                {...imgProps(c.images[0].src, "(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 360px")}
                alt={c.images[0].alt}
                width={1000}
                height={1000}
                loading={i < 6 ? undefined : "lazy"}
                decoding="async"
              />
            </span>
            <CardText cat={categoryOf(c.category)?.name} title={c.title} demo={!!c.demo} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 分類列：列表頁同分類頁用，效果同首頁一樣（膠囊滑過去先換頁） */
export function CategoryNav({ locale, current }: { locale: string; current?: string }) {
  const items = [{ key: "all", href: localizeHref("/cases", locale), label: "所有產品" }, ...visibleCategories().map((c) => ({ key: c.slug, href: localizeHref(`/cases/${c.slug}`, locale), label: c.name }))];
  return <CategoryTabs items={items} current={current ?? "all"} />;
}
