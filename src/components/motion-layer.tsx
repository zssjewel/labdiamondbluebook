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
 * 2. 首頁流程圖：去到畫面時方塊排隊（見 sortDiagram）。
 * 3. 站內換頁：新頁面輕輕淡入升起，唔再一下跳過去。第一次開頁唔做，唔影響首屏速度。
 * 冇 JS 或者揀咗減少動畫時，全部內容照常即刻顯示。
 */
export default function MotionLayer() {
  const pathname = usePathname();
  const first = useRef(true);
  const prev = useRef(pathname);

  // 換頁淡入：喺新頁畫出嚟之前開始，唔會閃一下
  useBeforePaint(() => {
    if (first.current) {
      first.current = false;
      prev.current = pathname;
      return;
    }
    const from = prev.current;
    prev.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 作品列表之間換分類：分類列唔郁，淨係卡片由右邊逐張滑入（同首頁換分類一樣）
    const isList = (p: string) => /\/cases(\/[^/]+)?\/?$/.test(p);
    if (isList(from) && isList(pathname)) {
      document.querySelectorAll<HTMLElement>(".bb-casegrid > li").forEach((li, i) => {
        li.animate([{ opacity: 0, transform: "translate3d(32px, 0, 0)" }, { opacity: 1, transform: "none" }], { duration: 620, delay: Math.min(i, 6) * 45, easing: EASE, fill: "backwards" });
      });
      return;
    }
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
    const stopSort = sortDiagram();
    if (!("IntersectionObserver" in window)) return;
    const vh = window.innerHeight;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el.getBoundingClientRect().top > vh);
    items.forEach((el) => el.classList.add("is-pending"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("is-in");
            io.unobserve(el);
            // 播完之後拎走進場 class，滑鼠移上去等回饋即刻恢復正常速度
            const i = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
            window.setTimeout(() => el.classList.remove("is-pending", "is-in"), 1900 + i * 110);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      stopSort?.();
    };
  }, [pathname]);

  return null;
}

/**
 * 「資料好亂？」流程圖：仲未碌到嘅話，先將要郁嘅方塊擺返去左邊亂堆（is-ready），
 * 去到畫面時加 is-sorting，逐粒按次序排入隊、排成方陣。已經喺畫面入面就唔郁。
 */
function sortDiagram(): (() => void) | undefined {
  if (!("IntersectionObserver" in window)) return;
  const svgs = Array.from(document.querySelectorAll<SVGSVGElement>(".bb-how__svg")).filter((svg) => svg.getBoundingClientRect().top > window.innerHeight);
  if (!svgs.length) return;
  svgs.forEach((svg) => {
    const vertical = svg.classList.contains("bb-how__svg--v");
    const rects = svg.querySelectorAll("rect");
    SQUARES.forEach((s, i) => {
      const r = rects[i];
      if (!s.move || !r) return;
      const m = s.move;
      r.style.setProperty("--fx", `${vertical ? m.fy : m.fx}px`);
      r.style.setProperty("--fy", `${vertical ? m.fx : m.fy}px`);
      r.style.setProperty("--d", `${Math.round((m.a - 5) * 34)}ms`);
      r.style.setProperty("--f0", FILL[s.from ?? s.tone]);
      r.classList.add("m");
    });
    svg.classList.add("is-ready");
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-sorting");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.45 },
  );
  svgs.forEach((svg) => io.observe(svg));
  return () => io.disconnect();
}
