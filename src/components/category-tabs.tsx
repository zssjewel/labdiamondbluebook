"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "@/components/link";
import { SegIndicator } from "@/components/seg-indicator";

/**
 * 作品列表頁嘅分類：同首頁一樣嘅蘋果式分段選擇器。
 * 撳落即刻將藍色膠囊滑去新分類，滑完先換頁（唔跳返頁頂），睇落同首頁即時切換一樣。
 * 每個分類仍然係真連結（有自己網址，搜尋器同冇 JS 都用得）。
 */
export function CategoryTabs({ items, current }: { items: { key: string; href: string; label: string }[]; current: string }) {
  const router = useRouter();
  const [sel, setSel] = useState(current);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, key: string, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (key === sel) return;
    setSel(key);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push(href, { scroll: false }), reduce ? 0 : 280);
  };

  return (
    <nav className="bb-shelf__tabs bb-shelf__tabs--links bb-seg" aria-label="作品分類">
      <SegIndicator active={sel} />
      {items.map((t) => (
        <Link key={t.key} href={t.href} aria-current={sel === t.key ? "page" : undefined} onClick={(e) => go(e, t.key, t.href)}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
