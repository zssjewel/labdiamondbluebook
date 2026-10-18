"use client";

import { useEffect } from "react";

/**
 * 進場動畫：只俾「開頁時喺畫面以下」嘅 data-reveal 元素做淡入。
 * 畫面內嘅內容一開始就顯示，唔使等 JS，開頁更快；冇 JS 時全部照常顯示。
 */
export function MotionLayer() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el.getBoundingClientRect().top > vh);
    items.forEach((el) => el.classList.add("is-pending"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
