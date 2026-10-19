"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const EASE = "cubic-bezier(0.28, 0.11, 0.32, 1)";
// 伺服器構建時冇 layout effect，用返 useEffect 避免警告
const useBeforePaint = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * 動效補位：
 * 1. 新瀏覽器（Chrome、Edge、Safari 26 起）用 CSS 碌動動畫做進場，隨手指碌動，唔使 JS；
 *    舊瀏覽器先用呢度嘅 IntersectionObserver，只俾「開頁時喺畫面以下」嘅 data-reveal 元素淡入。
 * 2. 站內換頁：新頁面輕輕淡入升起，唔再一下跳過去。第一次開頁唔做，唔影響首屏速度。
 * 冇 JS 或者揀咗減少動畫時，全部內容照常即刻顯示。
 */
export function MotionLayer() {
  const pathname = usePathname();
  const first = useRef(true);

  // 換頁淡入：喺新頁畫出嚟之前開始，唔會閃一下
  useBeforePaint(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main || typeof main.animate !== "function") return;
    main.animate(
      [
        { opacity: 0, transform: "translate3d(0, 16px, 0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 520, easing: EASE },
    );
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (!("IntersectionObserver" in window)) return;
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
  }, [pathname]);

  return null;
}
