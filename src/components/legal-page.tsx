import { Breadcrumbs } from "@/components/site";
import { localizeHref } from "@/config/site";

export function LegalPage({ title, side, children }: { title: string; side?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="bb-page">
      <aside className="bb-page__side">
        <Breadcrumbs items={[{ label: "首頁", href: localizeHref("/") }, { label: title }]} />
        {side}
      </aside>
      <article className="bb-page__main">
        <h1 className="bb-page__title bb-display">{title}</h1>
        <div className="bb-prose">{children}</div>
      </article>
    </main>
  );
}
