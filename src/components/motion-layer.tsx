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

  // 站內轉頁返首頁時，React 重新畫出嘅刊頭相仲係透明佔位（嗰段 inline script 唔會再行），喺度補返
  useEffect(() => {
    document.querySelectorAll<HTMLImageElement>(".bb-mosaic img.is-late").forEach((i) => {
      if (i.dataset.src && !i.src.endsWith(i.dataset.src) && !i.currentSrc.includes("/images/")) {
        if (i.dataset.sizes) i.sizes = i.dataset.sizes;
        if (i.dataset.srcset) i.srcset = i.dataset.srcset;
        i.src = i.dataset.src;
      }
      i.classList.add("is-in");
    });
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stopSort = sortDiagram();
    const stopBook = openBook();
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
      stopBook?.();
    };
  }, [pathname]);

  return null;
}

/**
 * 「資料好亂？」流程圖：仲未碌到嘅話，先將要郁嘅方塊擺返去左邊亂堆、三張圖收埋（is-ready）；
 * 去到畫面、三張圖解碼好之後加 is-sorting：方塊逐粒排入隊、排成方陣，
 * 方塊去到邊一區，嗰區嘅寫實圖就升起淡入，該區方塊隨即淡出。播完拎走 class，回到靜態（只見三張圖）。
 * 已經喺畫面入面、圖載唔到、或者中途轉頁，都直接顯示靜態內容。
 */
// 三區方塊幾時淡出（ms，由 is-sorting 起計）：一區＝左邊亂堆，二區＝中間收窄帶，三區＝右邊方陣
const ZONE_OUT = [450, 1750, 2450];
const SORT_DONE = 3200;

function sortDiagram(): (() => void) | undefined {
  if (!("IntersectionObserver" in window)) return;
  const stages = Array.from(document.querySelectorAll<HTMLElement>(".bb-how__stage")).filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  if (!stages.length) return;
  const timers: number[] = [];
  let alive = true;
  const reset = (stage: Element) => stage.classList.remove("is-ready", "is-sorting");
  // 準備：方塊同收埋嘅圖，等舞台去到離畫面一屏以內先做（開頁時唔使畫 300 幾粒方塊）
  const prepped = new WeakSet<Element>();
  const prep = (stage: Element) => {
    if (prepped.has(stage)) return;
    prepped.add(stage);
    stage.querySelectorAll<SVGSVGElement>(".bb-how__svg").forEach((svg) => {
      if (!svg.getClientRects().length) return; // 只畫而家顯示緊嗰個方向
      const vertical = svg.classList.contains("bb-how__svg--v");
      // 方塊唔喺 HTML 入面，播動畫前先畫（最終位置；直版 x/y 對調）
      if (!svg.querySelector("rect")) {
        const NS = "http://www.w3.org/2000/svg";
        const frag = document.createDocumentFragment();
        SQUARES.forEach((sq) => {
          const r = document.createElementNS(NS, "rect");
          r.setAttribute("x", String(vertical ? sq.y : sq.x));
          r.setAttribute("y", String(vertical ? sq.x : sq.y));
          r.setAttribute("width", "11");
          r.setAttribute("height", "11");
          r.setAttribute("fill", FILL[sq.tone]);
          frag.appendChild(r);
        });
        svg.appendChild(frag);
      }
      const rects = svg.querySelectorAll("rect");
      SQUARES.forEach((s, i) => {
        const r = rects[i];
        if (!r) return;
        if (!s.move) {
          r.style.setProperty("--o", `${ZONE_OUT[0]}ms`);
          return;
        }
        const m = s.move;
        r.style.setProperty("--fx", `${vertical ? m.fy : m.fx}px`);
        r.style.setProperty("--fy", `${vertical ? m.fx : m.fy}px`);
        r.style.setProperty("--d", `${Math.round((m.a - 5) * 34)}ms`);
        r.style.setProperty("--f0", FILL[s.from ?? s.tone]);
        r.style.setProperty("--o", `${ZONE_OUT[s.x < 600 ? 1 : 2]}ms`);
        r.classList.add("m");
      });
    });
    stage.classList.add("is-ready");
  };
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          near.unobserve(e.target);
          prep(e.target);
        }
      }
    },
    { rootMargin: "0px 0px 100% 0px" },
  );
  stages.forEach((stage) => near.observe(stage));
  const play = (stage: Element) => {
    prep(stage);
    const imgs = Array.from(stage.querySelectorAll("img"));
    const decoded = Promise.all(imgs.map((img) => (img.decode ? img.decode() : Promise.resolve())));
    const late = new Promise<never>((_, no) => timers.push(window.setTimeout(() => no(new Error("late")), 2500)));
    Promise.race([decoded, late]).then(
      () => {
        if (!alive) return;
        // 下一格先開始過渡，確保收埋狀態已經畫咗出嚟
        requestAnimationFrame(() => {
          if (!alive) return;
          stage.classList.add("is-sorting");
          timers.push(window.setTimeout(() => reset(stage), SORT_DONE));
        });
      },
      () => reset(stage),
    );
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          play(e.target);
        }
      }
    },
    { threshold: 0.45 },
  );
  stages.forEach((stage) => io.observe(stage));
  return () => {
    alive = false;
    near.disconnect();
    io.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
    stages.forEach(reset);
  };
}

/**
 * 首頁目錄嗰本書（學蘋果 iPhone Duo 折疊屏）：仲未碌到就先合埋（is-closed）；
 * 書去到畫面約四成，就自己慢慢打開（is-opening，約 2 秒），唔使跟住碌。播完拎走 class，回到預設打開狀態。
 * 手機、減少動畫、已經喺畫面入面（例如撳「目錄」直接跳過嚟）：直接係打開咗嘅書。
 */
function openBook(): (() => void) | undefined {
  if (!("IntersectionObserver" in window) || window.matchMedia("(max-width: 960px)").matches) return;
  const books = Array.from(document.querySelectorAll<HTMLElement>(".bb-book")).filter((b) => b.getBoundingClientRect().top > window.innerHeight);
  if (!books.length) return;
  const timers: number[] = [];
  books.forEach((b) => b.classList.add("is-closed"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const b = e.target as HTMLElement;
        io.unobserve(b);
        requestAnimationFrame(() => {
          b.classList.add("is-opening");
          b.classList.remove("is-closed");
          timers.push(window.setTimeout(() => b.classList.remove("is-opening"), 3600));
        });
      }
    },
    { threshold: 0.4 },
  );
  books.forEach((b) => io.observe(b));
  // 撳「目錄」跳過嚟：唔好俾佢由合埋開始等
  const skip = () => {
    if (window.location.hash !== "#contents") return;
    books.forEach((b) => {
      io.unobserve(b);
      b.classList.remove("is-closed", "is-opening");
    });
  };
  skip();
  window.addEventListener("hashchange", skip);
  return () => {
    io.disconnect();
    window.removeEventListener("hashchange", skip);
    timers.forEach((t) => window.clearTimeout(t));
    books.forEach((b) => b.classList.remove("is-closed", "is-opening"));
  };
}
