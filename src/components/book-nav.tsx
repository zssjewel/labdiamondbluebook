import Link from "next/link";
import { CHAPTERS } from "@/config/chapters";
import { localizeHref } from "@/config/site";
import type { ContentItem } from "@/lib/content";

/** 全書目錄：九章，當前章節展開列出文章 */
export function BookNav({ book, locale, currentChapter, currentSlug, className }: { book: ContentItem[]; locale: string; currentChapter: string; currentSlug?: string; className?: string }) {
  return (
    <nav className={`bb-booknav ${className ?? ""}`} aria-label="全書目錄">
      <p>全書目錄</p>
      <ol>
        {CHAPTERS.map((c) => {
          const items = book.filter((i) => i.contentType === c.slug);
          const open = c.slug === currentChapter;
          return (
            <li key={c.slug} className={open ? "is-open" : undefined}>
              <Link href={localizeHref(`/${c.slug}`, locale)} aria-current={open && !currentSlug ? "page" : undefined}>
                {c.number} {c.title}
                {items.length > 0 && <span className="bb-booknav__count">{items.length}</span>}
              </Link>
              {open && items.length > 0 && (
                <ol>
                  {items.map((i) => (
                    <li key={i.slug}>
                      <Link href={localizeHref(`/${c.slug}/${i.slug}`, locale)} aria-current={i.slug === currentSlug ? "page" : undefined}>
                        {i.metadata.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 上一篇／下一篇（全書順序） */
export function PrevNext({ book, locale, contentType, slug }: { book: ContentItem[]; locale: string; contentType: string; slug: string }) {
  const index = book.findIndex((i) => i.contentType === contentType && i.slug === slug);
  const prev = index > 0 ? book[index - 1] : undefined;
  const next = index >= 0 && index < book.length - 1 ? book[index + 1] : undefined;
  if (!prev && !next) return null;
  return (
    <nav className="bb-prevnext" aria-label="上一篇及下一篇">
      {prev ? (
        <Link href={localizeHref(`/${prev.contentType}/${prev.slug}`, locale)} rel="prev">
          <span>上一篇</span>
          <strong>{prev.metadata.title}</strong>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={localizeHref(`/${next.contentType}/${next.slug}`, locale)} rel="next" className="is-next">
          <span>下一篇</span>
          <strong>{next.metadata.title}</strong>
        </Link>
      )}
    </nav>
  );
}
