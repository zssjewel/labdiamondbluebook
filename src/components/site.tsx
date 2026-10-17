import Link from "next/link";
import { CHAPTERS } from "@/config/chapters";
import { HEADER_LINKS } from "@/config/navigation";
import { SITE, isExternal, localizeHref, waHref } from "@/config/site";

export { localizeHref };

/** 站內用 Link，外部（WhatsApp）用 a */
export function SmartLink({ href, className, children, ...rest }: { href: string; className?: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function SiteHeader({ locale }: { locale: string }) {
  return (
    <header className="bb-header">
      <Link href={localizeHref("/", locale)} className="bb-header__mark">
        {SITE.name}
      </Link>
      <nav className="bb-header__tab" aria-label="主要導覽">
        {HEADER_LINKS.map((item) => (
          <Link key={item.path} href={localizeHref(item.path, locale)}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href={localizeHref("/#contents", locale)} className="bb-header__menu">
        目錄
      </Link>
      <span className="bb-header__spacer" />
      <SmartLink href={waHref()} className="bb-btn bb-btn--accent bb-header__action">
        WhatsApp 問師傅
      </SmartLink>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="麵包屑">
      <ol className="bb-crumbs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AskMaster({ topic }: { topic?: string }) {
  const message = topic ? `你好，我睇咗《${topic}》，想問：` : "你好，我想問培育鑽石訂造：";
  return (
    <section className="bb-ask" aria-label="問師傅">
      <h2 className="bb-display">睇完仲有問題？直接問師傅</h2>
      <p>傳張款式圖、講個預算或者手寸，師傅會用 WhatsApp 直接答你。好多人問嘅問題，我哋會整理成新文章，唔會公開你嘅資料。</p>
      <SmartLink href={waHref(message)} className="bb-btn bb-btn--accent">
        WhatsApp 問師傅
      </SmartLink>
    </section>
  );
}

export function SiteFooter({ locale }: { locale: string }) {
  const first = CHAPTERS.slice(0, 5);
  const rest = CHAPTERS.slice(5);
  return (
    <footer className="bb-footer">
      <p className="bb-footer__mark bb-display">{SITE.name}</p>
      <div className="bb-footer__row">
        <ul className="bb-footer__places">
          <li>
            <SmartLink href={waHref()}>WhatsApp 問師傅</SmartLink>
          </li>
          <li>鄒三山工坊 · 香港</li>
        </ul>
        <div className="bb-footer__cols">
          <ul aria-label="第一至五章">
            {first.map((c) => (
              <li key={c.slug}>
                <Link href={localizeHref(`/${c.slug}`, locale)}>{`${c.number} ${c.title}`}</Link>
              </li>
            ))}
          </ul>
          <ul aria-label="第六至九章">
            {rest.map((c) => (
              <li key={c.slug}>
                <Link href={localizeHref(`/${c.slug}`, locale)}>{`${c.number} ${c.title}`}</Link>
              </li>
            ))}
          </ul>
          <ul aria-label="關於本書">
            <li>
              <Link href={localizeHref("/about", locale)}>關於本書</Link>
            </li>
            <li>
              <Link href={`${localizeHref("/about", locale)}#disclosure`}>編著聲明</Link>
            </li>
            <li>
              <Link href={localizeHref("/privacy-policy", locale)}>私隱政策</Link>
            </li>
            <li>
              <Link href={localizeHref("/terms-of-service", locale)}>使用條款</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="bb-footer__legal">
        <p>
          © {new Date().getFullYear()} {SITE.publisher}。本書由鄒三山工坊編著，比較及推薦內容包括工坊自己。網站上的首飾圖片為 3D 示意圖。
        </p>
        <a href="#top">返回頂部</a>
      </div>
    </footer>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
