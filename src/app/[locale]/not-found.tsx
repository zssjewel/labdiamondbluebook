import type { Metadata } from "next";
import Link from "@/components/link";
import { localizeHref } from "@/config/site";

export const metadata: Metadata = {
  title: "找不到這一頁｜培育鑽石藍皮書",
  robots: { index: false, follow: true },
};

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
