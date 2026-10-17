import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AskMaster, Breadcrumbs, JsonLd } from "@/components/site";
import { CHAPTERS, getChapter } from "@/config/chapters";
import { CONTENT_TYPES } from "@/config/navigation";
import { SITE, localizeHref } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";
import { getAllContent, getAllContentPaths, getBookOrder, getContent } from "@/lib/content";
import { BookNav, PrevNext } from "@/components/book-nav";
import { ReadingTracker } from "@/components/reading";

type Params = { locale: Locale; slug: string[] };

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
  const { locale, slug } = await params;
  const chapter = getChapter(slug[0]);
  if (!chapter) return { title: "找不到頁面" };
  if (slug.length === 1) {
    const title = `${chapter.number}：培育鑽石${chapter.title}｜${SITE.name}`;
    return {
      title,
      description: chapter.intro,
      alternates: alternates(`/${chapter.slug}`, locale),
      openGraph: { title, description: chapter.intro, url: `${SITE.url}${localizeHref(`/${chapter.slug}`, locale)}` },
    };
  }
  const item = await getContent(slug[0], slug.slice(1), locale);
  if (!item) return { title: "找不到頁面" };
  const pathname = `/${slug.join("/")}`;
  const title = `${item.metadata.title}｜${SITE.name}`;
  return {
    title,
    description: item.metadata.description,
    alternates: alternates(pathname, locale),
    openGraph: { type: "article", title, description: item.metadata.description, url: `${SITE.url}${localizeHref(pathname, locale)}`, images: ["/og.png"] },
  };
}

export default async function SlugPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
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

  return (
    <main className="bb-page">
      <JsonLd data={listData} />
      <JsonLd data={crumbData} />
      <aside className="bb-page__side">
        <Breadcrumbs items={[{ label: "首頁", href: localizeHref("/", locale) }, { label: chapter.number }]} />
        <dl className="bb-meta">
          <dt>本章答你</dt>
          <dd>{chapter.answers}</dd>
          <dt>文章</dt>
          <dd>{items.length > 0 ? `已出 ${items.length} 篇，撰寫中 ${pending.length} 篇` : `撰寫中 ${pending.length} 篇`}</dd>
        </dl>
        <BookNav book={await getBookOrder(locale)} locale={locale} currentChapter={slug} className="bb-only-wide" />
      </aside>
      <div className="bb-page__main">
        <h1 className="bb-page__title bb-display">
          {chapter.number}　{chapter.title}
        </h1>
        <p className="bb-page__lead">{chapter.intro}</p>

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

        <AskMaster topic={`${chapter.number} ${chapter.title}`} />

        <nav className="bb-chapnav" aria-label="上下章">
          {prev && (
            <Link className="bb-link" href={localizeHref(`/${prev.slug}`, locale)}>
              ← {prev.number} {prev.title}
            </Link>
          )}
          {next && (
            <Link className="bb-link" href={localizeHref(`/${next.slug}`, locale)}>
              {next.number} {next.title} →
            </Link>
          )}
        </nav>
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
    ...(item.metadata.image ? { image: `${SITE.url}${item.metadata.image}` } : {}),
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
    <main className="bb-page">
      <JsonLd data={articleData} />
      <JsonLd data={crumbData} />
      <aside className="bb-page__side">
        <Breadcrumbs
          items={[
            { label: "首頁", href: localizeHref("/", locale) },
            { label: chapter.number, href: localizeHref(`/${contentType}`, locale) },
            { label: "本文" },
          ]}
        />
        <dl className="bb-meta">
          <dt>編著</dt>
          <dd>{author}</dd>
          <dt>更新</dt>
          <dd>{item.metadata.lastModified ?? item.metadata.date}</dd>
          <dt>師傅核對</dt>
          <dd>{item.metadata.verifiedDate ? `${item.metadata.verifiedBy ?? "工坊師傅"}，${item.metadata.verifiedDate}` : "待核對"}</dd>
        </dl>
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
        <BookNav book={book} locale={locale} currentChapter={contentType} currentSlug={item.slug} className="bb-only-wide" />
      </aside>
      <article className="bb-page__main">
        <ReadingTracker path={localizeHref(pathname, locale)} title={item.metadata.title} chapter={chapter.number} />
        <h1 className="bb-page__title bb-display">{item.metadata.title}</h1>
        {item.metadata.summary && <p className="bb-page__lead">{item.metadata.summary}</p>}
        {item.metadata.draft && (
          <p className="bb-draft">
            <strong>初稿：</strong>本文由編輯整理，正等工坊師傅逐項核對，內容可能仍會修改。
          </p>
        )}
        <div className="bb-prose">
          <item.MDXContent />
        </div>

        <div className="bb-author">
          <strong>關於編著</strong>
          《{SITE.name}》由{SITE.publisher}編著。本書比較及推薦的內容包括工坊自己，詳見
          <Link href={`${localizeHref("/about", locale)}#disclosure`}>編著聲明</Link>。
        </div>

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
          <Link className="bb-link" href={localizeHref(`/${contentType}`, locale)}>
            ← 返回{chapter.number} {chapter.title}
          </Link>
        </nav>
        <BookNav book={book} locale={locale} currentChapter={contentType} currentSlug={item.slug} className="bb-only-narrow" />
      </article>
    </main>
  );
}
