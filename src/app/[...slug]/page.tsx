import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AskMaster, Breadcrumbs, JsonLd } from "@/components/site";
import { CHAPTERS, getChapter } from "@/config/chapters";
import { CONTENT_TYPES } from "@/config/navigation";
import { SITE, localizeHref, orDemo } from "@/config/site";
import { Demo } from "@/components/demo";
import { routing, type Locale } from "@/i18n/routing";
import { getAllArticles, getAllContent, getAllContentPaths, getBookOrder, getContent } from "@/lib/content";
import { coverProps, imgProps } from "@/lib/images";
import { articleReady, robotsFor } from "@/lib/indexing";
import { BookNav, PrevNext } from "@/components/book-nav";
import { RelatedShelf } from "@/components/cases";
import { shareImages } from "@/lib/share";
import { casesForChapter } from "@/config/cases";
import { ReadingTracker } from "@/components/reading";

type Params = { slug: string[] };

function alternates(pathname: string, locale: string) {
  const url = localizeHref(pathname, locale);
  return { canonical: url, languages: { [SITE.htmlLang]: url, "x-default": url } };
}

export async function generateStaticParams() {
  const paths = await getAllContentPaths(routing.defaultLocale);
  const listingPages = CONTENT_TYPES.map((ct) => ({ slug: [ct] }));
  return [...listingPages, ...paths.map((item) => ({ slug: [item.contentType, ...item.slug] }))];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = SITE.locale as Locale;
  const chapter = getChapter(slug[0]);
  if (!chapter) return { title: "找不到頁面" };
  if (slug.length === 1) {
    const title = `${chapter.number}：培育鑽石${chapter.title}｜${SITE.name}`;
    const items = await getAllContent(chapter.slug, locale);
    return {
      title,
      description: chapter.intro,
      alternates: alternates(`/${chapter.slug}`, locale),
      // 冇一篇核對完成嘅文章，章節頁唔收錄
      robots: robotsFor(items.some((i) => articleReady(i.metadata))),
      // 章節圖係 1000×1000 正方形，分享圖標明尺寸，唔好當橫圖
      openGraph: { title, description: chapter.intro, url: `${SITE.url}${localizeHref(`/${chapter.slug}`, locale)}`, images: shareImages({ url: chapter.image, width: 1000, height: 1000, alt: chapter.imageAlt }).ogImages },
      twitter: shareImages({ url: chapter.image, width: 1000, height: 1000, alt: chapter.imageAlt }).twitter,
    };
  }
  const item = await getContent(slug[0], slug.slice(1), locale);
  if (!item) return { title: "找不到頁面" };
  const pathname = `/${slug.join("/")}`;
  const title = `${item.metadata.title}｜${SITE.name}`;
  const shareImage = {
    url: item.metadata.image ?? chapter.image,
    width: item.metadata.imageWidth ?? 1000,
    height: item.metadata.imageHeight ?? 1000,
    alt: item.metadata.imageAlt ?? (item.metadata.image ? item.metadata.title : chapter.imageAlt),
  };
  return {
    title,
    description: item.metadata.description,
    alternates: alternates(pathname, locale),
    // 初稿、未經師傅核對嘅文章唔收錄
    robots: robotsFor(articleReady(item.metadata)),
    openGraph: { type: "article", title, description: item.metadata.description, url: `${SITE.url}${localizeHref(pathname, locale)}`, images: [shareImage] },
    // 分享卡同 og:image 用同一張圖（唔再沿用全站 og.png）
    twitter: { card: "summary_large_image", images: [shareImage] },
  };
}

export default async function SlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const locale = SITE.locale as Locale;
  setRequestLocale(locale);
  if (!CONTENT_TYPES.includes(slug[0])) notFound();
  if (slug.length === 1) return <ChapterPage locale={locale} slug={slug[0]} />;
  return <ArticlePage locale={locale} contentType={slug[0]} rest={slug.slice(1)} />;
}

async function ChapterPage({ locale, slug }: { locale: Locale; slug: string }) {
  const chapter = getChapter(slug);
  if (!chapter) notFound();
  const items = await getAllContent(slug, locale);
  const written = new Set(items.map((i) => i.metadata.title));
  const pending = chapter.topics.filter((t) => !written.has(t));
  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];
  const pageUrl = `${SITE.url}${localizeHref(`/${slug}`, locale)}`;

  const listData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${chapter.number} ${chapter.title}`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}${localizeHref(`/${slug}/${item.slug}`, locale)}`,
      name: item.metadata.title,
    })),
  };
  const crumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE.url}${localizeHref("/", locale)}` },
      { "@type": "ListItem", position: 2, name: `${chapter.number} ${chapter.title}`, item: pageUrl },
    ],
  };

  const others = items.length === 0 ? (await getAllArticles(locale)).slice(0, 4) : [];

  return (
    <main id="main" tabIndex={-1} className="bb-page">
      {items.length > 0 && <JsonLd data={listData} />}
      <JsonLd data={crumbData} />
      <aside className="bb-page__side bb-only-wide" aria-label="章節導覽">
        <figure className="bb-chapfig">
          <img decoding="async" {...imgProps(chapter.image, "240px")} alt={chapter.imageAlt} width={1000} height={1000} />
        </figure>
        <BookNav book={await getBookOrder(locale)} locale={locale} currentChapter={slug} />
      </aside>
      <div className="bb-page__main">
        <Breadcrumbs items={[{ label: "首頁", href: localizeHref("/", locale) }, { label: chapter.number }]} />
        <h1 className="bb-page__title bb-display">
          {chapter.number}　{chapter.title}
        </h1>
        <p className="bb-page__lead">{chapter.intro}</p>
        <p className="bb-metaline">
          <span>本章答你：{chapter.answers}</span>
          <span>{items.length > 0 ? `已出 ${items.length} 篇，撰寫中 ${pending.length} 篇` : `全章撰寫中，共 ${pending.length} 篇`}</span>
        </p>

        {items.length > 0 && (
          <ul className="bb-list">
            {items.map((item) => (
              <li key={item.slug}>
                <Link href={localizeHref(`/${slug}/${item.slug}`, locale)}>
                  <strong>{item.metadata.title}</strong>
                  <span>{item.metadata.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {items.length === 0 && others.length > 0 && (
          <div className="bb-note bb-note--plain">
            <p>呢章文章仲寫緊，下面係已經寫好、可以先睇嘅內容：</p>
            <ul className="bb-list bb-list--compact">
              {others.map((a) => (
                <li key={`${a.contentType}/${a.slug}`}>
                  <Link href={localizeHref(`/${a.contentType}/${a.slug}`, locale)}>
                    <strong>{a.metadata.title}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pending.length > 0 && (
          <>
            <h2 className="bb-subhead">撰寫中</h2>
            <ul className="bb-list">
              {pending.map((t) => (
                <li key={t} className="pending">
                  <strong>{t}</strong>
                </li>
              ))}
            </ul>
          </>
        )}

        {chapter.ourWay && (
          <aside className="bb-note bb-ourway" aria-label="鄒三山工坊嘅做法">
            <p className="bb-note__label">鄒三山工坊嘅做法</p>
            <p>{chapter.ourWay}</p>
            <Link className="bb-link" href={localizeHref("/about", locale) + "#promise"}>
              睇完整條款
            </Link>
          </aside>
        )}
        <RelatedShelf locale={locale} list={casesForChapter(slug)} title="相關作品" sub="工坊訂造過嘅款式，撳入去睇主石、金屬同工期。" />
        <AskMaster topic={`${chapter.number} ${chapter.title}`} />

        <nav className="bb-chapnav" aria-label="上下章">
          {prev && (
            <Link className="bb-link bb-link--prev" href={localizeHref(`/${prev.slug}`, locale)}>
              {prev.number} {prev.title}
            </Link>
          )}
          {next && (
            <Link className="bb-link" href={localizeHref(`/${next.slug}`, locale)}>
              {next.number} {next.title}
            </Link>
          )}
        </nav>
        <BookNav book={await getBookOrder(locale)} locale={locale} currentChapter={slug} className="bb-only-narrow" />
      </div>
    </main>
  );
}

async function ArticlePage({ locale, contentType, rest }: { locale: Locale; contentType: string; rest: string[] }) {
  const chapter = getChapter(contentType);
  const item = await getContent(contentType, rest, locale);
  if (!chapter || !item) notFound();
  const pathname = `/${contentType}/${rest.join("/")}`;
  const pageUrl = `${SITE.url}${localizeHref(pathname, locale)}`;
  const author = item.metadata.author || SITE.publisher;
  const siblings = (await getAllContent(contentType, locale)).filter((i) => i.slug !== item.slug).slice(0, 4);
  const book = await getBookOrder(locale);

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.metadata.title,
    description: item.metadata.description,
    inLanguage: SITE.htmlLang,
    datePublished: item.metadata.date,
    dateModified: item.metadata.lastModified ?? item.metadata.date,
    mainEntityOfPage: pageUrl,
    author: item.metadata.author ? { "@type": "Person", name: item.metadata.author } : { "@type": "Organization", name: SITE.publisher },
    publisher: { "@type": "Organization", name: SITE.publisher },
    image: `${SITE.url}${item.metadata.image ?? chapter.image}`,
  };
  const crumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE.url}${localizeHref("/", locale)}` },
      { "@type": "ListItem", position: 2, name: `${chapter.number} ${chapter.title}`, item: `${SITE.url}${localizeHref(`/${contentType}`, locale)}` },
      { "@type": "ListItem", position: 3, name: item.metadata.title, item: pageUrl },
    ],
  };

  return (
    <main id="main" tabIndex={-1} className="bb-page">
      <JsonLd data={articleData} />
      <JsonLd data={crumbData} />
      <aside className="bb-page__side bb-only-wide" aria-label="文章導覽">
        {item.headings.length > 1 && (
          <nav className="bb-side-toc" aria-label="本文目錄">
            <p>本文目錄</p>
            <ol>
              {item.headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "lvl3" : undefined}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <BookNav book={book} locale={locale} currentChapter={contentType} currentSlug={item.slug} />
      </aside>
      <article className="bb-page__main">
        <ReadingTracker path={localizeHref(pathname, locale)} title={item.metadata.title} chapter={chapter.number} />
        <Breadcrumbs
          items={[
            { label: "首頁", href: localizeHref("/", locale) },
            { label: `${chapter.number} ${chapter.title}`, href: localizeHref(`/${contentType}`, locale) },
            { label: "本文" },
          ]}
        />
        <h1 className="bb-page__title bb-page__title--article bb-display">{item.metadata.title}</h1>
        {item.metadata.summary && <p className="bb-page__lead bb-page__lead--article">{item.metadata.summary}</p>}
        <p className="bb-metaline">
          <span>{author}編著</span>
          <span>更新 {item.metadata.lastModified ?? item.metadata.date}</span>
          <span>
            師傅核對：
            {item.metadata.verifiedDate ? `${item.metadata.verifiedBy ?? "工坊師傅"}，${item.metadata.verifiedDate}` : <strong>待核對</strong>}
          </span>
        </p>
        {item.metadata.placeholder ? (
          <p className="bb-draft">
            <strong>示例大綱：</strong>呢篇暫時只有大綱，用嚟睇全站結構；正文待補，寫好並經師傅核對後會取代。
          </p>
        ) : (
          item.metadata.draft && (
            <p className="bb-draft">
              <strong>初稿：</strong>本文由編輯整理，正等工坊師傅逐項核對，內容可能仍會修改。
            </p>
          )
        )}
        {item.headings.length > 1 && (
          <details className="bb-tocfold">
            <summary>本文目錄（{item.headings.filter((h) => h.level === 2).length} 節）</summary>
            <ol>
              {item.headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "lvl3" : undefined}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </details>
        )}
        {item.metadata.cover !== false &&
          (() => {
            const { wide, ...cover } = coverProps(item.metadata.image ?? chapter.image, "(max-width: 960px) calc(100vw - 32px), 612px");
            return (
          <figure className="bb-artfig">
            {/* 文章題圖通常係手機首屏最大嘅元素（LCP），提早下載；章節圖用預先裁好嘅 16:9 版 */}
            <img
              decoding="async"
              fetchPriority="high"
              {...cover}
              alt={item.metadata.imageAlt ?? (item.metadata.image ? item.metadata.title : chapter.imageAlt)}
              width={wide ? 1000 : (item.metadata.imageWidth ?? 1000)}
              height={wide ? 563 : (item.metadata.imageHeight ?? 1000)}
            />
            <figcaption>{item.metadata.image ? "" : chapter.imageAlt}</figcaption>
          </figure>
            );
          })()}
        <div className="bb-prose">
          <item.MDXContent />
        </div>

        <div className="bb-author">
          <strong>關於編著</strong>
          《{SITE.name}》由{SITE.publisher}編著
          {(SITE.master.name || SITE.demo) && (
            <>
              ，{orDemo(SITE.master.name, "（師傅姓名）")}師傅負責核對工藝同報價內容
              <Demo show={!SITE.master.name} />
            </>
          )}
          。本書比較及推薦的內容包括工坊自己，詳見
          <Link href={`${localizeHref("/about", locale)}#disclosure`}>編著聲明</Link>，師傅資料見
          <Link href={`${localizeHref("/about", locale)}#master`}>師傅介紹</Link>。
        </div>

        <RelatedShelf locale={locale} list={casesForChapter(contentType)} title="同類作品" sub="睇完想睇實物？以下係相關款式。" />
        <PrevNext book={book} locale={locale} contentType={contentType} slug={item.slug} />

        <AskMaster topic={item.metadata.title} />

        {siblings.length > 0 && (
          <>
            <h2 className="bb-subhead">{`${chapter.number}其他文章`}</h2>
            <ul className="bb-list">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link href={localizeHref(`/${contentType}/${s.slug}`, locale)}>
                    <strong>{s.metadata.title}</strong>
                    <span>{s.metadata.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <nav className="bb-chapnav" aria-label="返回">
          <Link className="bb-link bb-link--prev" href={localizeHref(`/${contentType}`, locale)}>
            返回{chapter.number} {chapter.title}
          </Link>
        </nav>
        <BookNav book={book} locale={locale} currentChapter={contentType} currentSlug={item.slug} className="bb-only-narrow" />
      </article>
    </main>
  );
}
