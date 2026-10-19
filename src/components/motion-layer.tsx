"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { FILL, SQUARES } from "./how-data";
import "./motion.css";

const EASE = "cubic-bezier(0.28, 0.11, 0.32, 1)";
// 伺服器構建時冇 layout effect，用返 useEffect 避免警告
const useBeforePaint = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * 動效補位：
 * 1. 進場：只俾「開頁時喺畫面以下」嘅 data-reveal 元素，碌到時一次過升起淡入（按時間播，碌動時唔使逐格計，手機唔會卡）。
 * 2. 首頁流程圖排隊（見 sortDiagram）。
 * 3. 站內換頁：新頁面輕輕淡入升起，唔再一下跳過去。第一次開頁唔做，唔影響首屏速度。
 * 冇 JS 或者揀咗減少動畫時，全部內容照常即刻顯示。
 */
export default function MotionLayer() {
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
    sortDiagram();
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

/** 「資料好亂？」流程圖：幫要郁嘅方塊加上出發點同時間（CSS 碌動動畫負責播），唔支援就保持靜止最終樣 */
function sortDiagram() {
  if (typeof CSS === "undefined" || !CSS.supports("animation-timeline: view()")) return;
  document.querySelectorAll<SVGSVGElement>(".bb-how__svg").forEach((svg) => {
    const vertical = svg.classList.contains("bb-how__svg--v");
    const rects = svg.querySelectorAll("rect");
    SQUARES.forEach((s, i) => {
      const r = rects[i];
      if (!s.move || !r) return;
      const m = s.move;
      r.style.setProperty("--fx", `${vertical ? m.fy : m.fx}px`);
      r.style.setProperty("--fy", `${vertical ? m.fx : m.fy}px`);
      r.style.setProperty("--a", `${m.a}%`);
      r.style.setProperty("--b", `${m.b}%`);
      r.style.setProperty("--f0", FILL[s.from ?? s.tone]);
      r.classList.add("m");
    });
  });
}
