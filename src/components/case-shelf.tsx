"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/link";
import { imgProps } from "@/lib/images";
import { SegIndicator } from "@/components/seg-indicator";

export type ShelfItem = {
  /** 作品頁網址 */
  h: string;
  /** 標題 */
  t: string;
  /** 分類 slug */
  c: string;
  /** 封面圖 */
  s: string;
  /** 封面圖 alt */
  a: string;
  /** 示例作品（卡片印「示例」） */
  d?: boolean;
  /** 滑鼠移上去換成嘅相（戴喺手上），冇就唔換 */
  s2?: string;
};

type Tab = { slug: string; name: string; count: number };

/**
 * 蘋果官網式作品貨架：上面一行分類（左右滑），下面一排卡片（左右滑、自動對齊）。
 * 揀分類即刻換卡片，唔使轉頁；電腦有左右箭咀，手機用手指滑。
 */
export function CaseShelf({
  items,
  all,
  tabs,
  catNames,
  allHref,
  catHref,
  moreLabel,
  label,
  demo,
  inset = false,
}: {
  /** 全部作品（分類用） */
  items: ShelfItem[];
  /** 「全部」時顯示嘅作品次序（href 列表）；唔傳就用 items 次序 */
  all?: string[];
  tabs?: Tab[];
  catNames: Record<string, string>;
  /** 最尾「睇全部」卡連去邊 */
  allHref: string;
  /** 分類頁網址樣板，{c} 會換成分類 slug */
  catHref?: string;
  /** 最尾出口卡嘅字；唔傳就用「睇全部 N 件作品」（N 要同目的地一致，所以只啱首頁用） */
  moreLabel?: string;
  label: string;
  demo: boolean;
  /** 放喺正文欄入面（章節、文章頁）：卡片細啲，唔貼邊 */
  inset?: boolean;
}) {
  const [cat, setCat] = useState("all");
  const [picked, setPicked] = useState(false);
  // 相片等成頁載完、瀏覽器得閒先載，唔同首屏搶頻寬（貨架喺第一屏以下）
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(() => setReady(true), { timeout: 1500 }) : window.setTimeout(() => setReady(true), 200));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ prev: false, next: true });

  const byHref = new Map(items.map((i) => [i.h, i]));
  const shown =
    cat === "all" ? (all ? all.map((h) => byHref.get(h)).filter((x): x is ShelfItem => Boolean(x)) : items) : items.filter((i) => i.c === cat);
  const moreHref = cat !== "all" && catHref ? catHref.replace("{c}", cat) : allHref;
  const moreCount = cat === "all" ? items.length : shown.length;

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const pick = (slug: string) => {
    setCat(slug);
    setPicked(true);
    track.current?.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(update);
  };

  // 同蘋果官網一樣：撳一下箭咀滑一張卡（卡闊 + 間距），配合對齊落喺下一張卡
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("li");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`bb-shelf${inset ? " bb-shelf--inset" : ""}`}>
      {tabs && tabs.length > 1 && (
        <div className="bb-shelf__tabs bb-seg" role="group" aria-label="作品分類">
          <SegIndicator active={cat} />
          {[{ slug: "all", name: "所有產品" }, ...tabs].map((t) => (
            <button key={t.slug} type="button" aria-pressed={cat === t.slug} onClick={() => pick(t.slug)}>
              {t.name}
            </button>
          ))}
        </div>
      )}
      {/* 蘋果式：卡片排成一行左右滑，左右兩邊有浮喺卡片上面嘅圓形箭咀 */}
      <div className="bb-shelf__stage">
        <ul className="bb-shelf__track" ref={track} aria-label={label} data-picked={picked || undefined}>
          {shown.map((item, i) => (
            <li key={`${cat}:${item.h}`} style={{ "--n": Math.min(i, 6) } as React.CSSProperties}>
              <Link href={item.h} className="bb-shelf__card">
                <span className="bb-shelf__img">
                  {ready && (
                    <img {...imgProps(item.s, inset ? "(max-width: 760px) 62vw, 260px" : "(max-width: 760px) 78vw, 400px")} alt={item.a} width={1000} height={1000} loading="lazy" decoding="async" fetchPriority="low" />
                  )}
                  {ready && item.s2 && <img {...imgProps(item.s2, inset ? "260px" : "400px")} className="bb-shelf__alt" alt="" aria-hidden="true" width={1000} height={1000} loading="lazy" decoding="async" fetchPriority="low" />}
                </span>
                <CardText cat={catNames[item.c]} title={item.t} demo={item.d ?? demo} />
              </Link>
            </li>
          ))}
          <li key={`${cat}:end`} className="bb-shelf__end" style={{ "--n": Math.min(shown.length, 6) } as React.CSSProperties}>
            <Link href={moreHref} className="bb-shelf__card bb-shelf__card--all">
              <strong>{cat !== "all" ? `睇全部${catNames[cat]}` : (moreLabel ?? `睇全部 ${moreCount} 件作品`)}</strong>
              <span aria-hidden="true">›</span>
            </Link>
          </li>
        </ul>
        <button type="button" className="bb-shelf__paddle bb-shelf__paddle--prev" onClick={() => page(-1)} disabled={!edge.prev} aria-label="上一組">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 2.5 4.5 8l5.5 5.5" />
          </svg>
        </button>
        <button type="button" className="bb-shelf__paddle bb-shelf__paddle--next" onClick={() => page(1)} disabled={!edge.next} aria-label="下一組">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m6 2.5 5.5 5.5L6 13.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** 卡片下面嘅字：分類（細灰字）→ 款式名（粗）→ 金屬等變化（細灰字）。標題「・」後面嗰段拆出嚟做第三行，唔使擠埋一齊斷行 */
export function CardText({ cat, title, demo }: { cat?: string; title: string; demo: boolean }) {
  const [name, variant] = title.split("・");
  return (
    <span className="bb-shelf__body">
      <span className="bb-shelf__cat">
        {cat}
        {demo && <span className="bb-demo">示例</span>}
      </span>
      <strong>{name}</strong>
      {/* 冇金屬變化嘅款（例如手鏈）都留返一行位，換分類時卡片高度唔變，下面內容唔會跳 */}
      {variant ? <span className="bb-shelf__variant">{variant}</span> : <span className="bb-shelf__variant" aria-hidden="true">{"\u00a0"}</span>}
    </span>
  );
}
