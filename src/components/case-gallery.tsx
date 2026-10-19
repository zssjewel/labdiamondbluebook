"use client";

import { useEffect, useRef, useState } from "react";
import { imgProps } from "@/lib/images";

/** 作品相：左右滑一張張睇（自動對齊），下面有頁碼點；電腦有左右箭咀 */
export function CaseGallery({ images, placeholders = [] }: { images: { src: string; alt: string }[]; placeholders?: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const total = images.length + placeholders.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setAt(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="bb-gallery">
      {/* 同首頁作品貨架一樣：左右滑，兩邊有浮喺相上面嘅圓形箭咀（滑鼠移入先出現），下面有頁碼點 */}
      <div className="bb-shelf__stage bb-gallery__stage">
        <div className="bb-gallery__track" ref={track} tabIndex={0} aria-label={`作品相，共 ${total} 張，可以左右滑`}>
          {images.map((im, i) => (
            <figure key={im.src + i} className="bb-gallery__slide">
              <img {...imgProps(im.src, "(max-width: 960px) 100vw, 560px")} alt={im.alt} width={1000} height={1000} loading={i === 0 ? undefined : "lazy"} decoding="async" />
            </figure>
          ))}
          {placeholders.map((p) => (
            <figure key={p} className="bb-gallery__slide bb-gallery__slide--ph">
              <span>
                {p}
                <span className="bb-demo">示例</span>
              </span>
            </figure>
          ))}
        </div>
        {total > 1 && (
          <>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="上一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 2.5 4.5 8l5.5 5.5" />
              </svg>
            </button>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--next" onClick={() => go(at + 1)} disabled={at >= total - 1} aria-label="下一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m6 2.5 5.5 5.5L6 13.5" />
              </svg>
            </button>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="bb-gallery__dots">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" aria-label={`第 ${i + 1} 張`} aria-current={at === i ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
