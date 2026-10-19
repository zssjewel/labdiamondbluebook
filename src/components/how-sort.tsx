"use client";

import { useEffect } from "react";
import { FILL, SQUARES } from "./how-data";

/**
 * 流程圖排隊動畫：瀏覽器支援碌動動畫、又冇揀減少動畫，先幫要郁嘅方塊加上出發點同時間。
 * 唔支援就保持靜止嘅最終樣。
 */
export function HowSort() {
  useEffect(() => {
    if (typeof CSS === "undefined" || !CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, []);
  return null;
}
