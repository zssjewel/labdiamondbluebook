import Link from "next/link";
import { localizeHref } from "@/config/site";

export default function NotFoundPage() {
  return (
    <main className="bb-page">
      <aside className="bb-page__side" />
      <div className="bb-page__main">
        <h1 className="bb-page__title bb-display">找不到這一頁</h1>
        <p className="bb-page__lead">這頁可能搬了位置，或者文章仍在撰寫中。</p>
        <Link className="bb-btn bb-btn--ink" href={`${localizeHref("/")}#contents`}>
          返回目錄
        </Link>
      </div>
    </main>
  );
}
