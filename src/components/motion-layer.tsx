"use client";

import { useEffect } from "react";

/**
 * 進場動畫：帶 data-reveal 的元素進入畫面時加上 is-in。
 * 沒有 JS 或使用者要求減少動態時，CSS 會直接顯示內容。
 */
export function MotionLayer() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
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
