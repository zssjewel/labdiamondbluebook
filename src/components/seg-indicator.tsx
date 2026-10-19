"use client";

import { useEffect, useRef } from "react";

/**
 * 蘋果式分段選擇器嘅「滑動底色」：放喺 .bb-seg 入面做第一個子元素。
 * 會自動搵已選項目（aria-pressed="true" 或 aria-current="page"），將深色膠囊滑過去。
 * 冇 JS 時，已選項目本身有底色，一樣睇得清。
 * key 變咗（例如揀咗另一個分類）就重新定位。
 */
export function SegIndicator({ active }: { active?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useEffect(() => {
    const ind = ref.current;
    const box = ind?.parentElement;
    if (!ind || !box) return;
    const place = () => {
      const on = box.querySelector<HTMLElement>('[aria-pressed="true"], [aria-current="page"]');
      if (!on) return;
      ind.style.width = `${on.offsetWidth}px`;
      ind.style.transform = `translateX(${on.offsetLeft}px)`;
      if (!placed.current) {
        // 第一次定位唔做動畫；揀中嗰個喺畫面外就捲過去（手機分類好多個時）
        placed.current = true;
        box.scrollLeft = Math.max(0, on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2);
        requestAnimationFrame(() => box.classList.add("is-live", "is-ready"));
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => ro.disconnect();
  }, [active]);

  return <span ref={ref} className="bb-seg__ind" aria-hidden="true" />;
}
