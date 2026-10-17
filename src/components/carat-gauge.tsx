"use client";

import Link from "next/link";
import { useState } from "react";
import { isExternal, localizeHref, waHref } from "@/config/site";

/** 標準圓形明亮式切工，卡數對應的大約直徑（毫米） */
const SIZES = [
  { ct: "0.5", mm: 5.1 },
  { ct: "1", mm: 6.4 },
  { ct: "1.5", mm: 7.3 },
  { ct: "2", mm: 8.1 },
  { ct: "3", mm: 9.3 },
];
const COIN_MM = 25.5; // 港幣一元硬幣直徑
const K = 120 / COIN_MM; // 每毫米 = 幾多 SVG 單位
const COIN = { cx: 76, cy: 100, r: 60 };
const STONE = { cx: 166, cy: 100 };
const BASE_MM = 6.4;

function stonePaths(r: number) {
  const pt = (radius: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(STONE.cx + radius * Math.cos(a)).toFixed(2)},${(STONE.cy + radius * Math.sin(a)).toFixed(2)}`;
  };
  const table: string[] = [];
  const star: string[] = [];
  for (let i = 0; i < 8; i++) {
    table.push(pt(r * 0.56, i * 45 + 22.5));
    star.push(pt(r, i * 45), pt(r * 0.56, i * 45 + 22.5));
  }
  return { table: table.join(" "), star: star.join(" ") };
}

export function CaratGauge({ locale }: { locale: string }) {
  const [index, setIndex] = useState(1);
  const size = SIZES[index];
  const baseR = (BASE_MM * K) / 2;
  const scale = size.mm / BASE_MM;
  const { table, star } = stonePaths(baseR);
  const ask = waHref(`你好，想問 ${size.ct} 卡培育鑽石大概幾錢？`);
  const askProps = isExternal(ask) ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const growth = Math.round((size.mm / BASE_MM - 1) * 100);

  return (
    <section className="bb-gauge" aria-labelledby="gauge-title">
      <div className="bb-gauge__plate" data-reveal>
        <div className="bb-gauge__square">
          <svg viewBox="0 0 200 200" role="img" aria-label={`一元硬幣同 ${size.ct} 卡圓形培育鑽石，按實際比例`}>
            <circle cx={COIN.cx} cy={COIN.cy} r={COIN.r} fill="#c3c9d4" />
            <circle cx={COIN.cx} cy={COIN.cy} r={COIN.r - 5} fill="#cfd4de" />
            <g
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${STONE.cx}px ${STONE.cy}px`,
                transition: "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
            >
              <circle cx={STONE.cx} cy={STONE.cy} r={baseR} fill="#ffffff" stroke="#1c3d8c" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
              <polygon points={star} fill="#eef2fa" stroke="#1c3d8c" strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
              <polygon points={table} fill="#ffffff" stroke="#1c3d8c" strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </div>
      </div>

      <div className="bb-gauge__panel">
        <div className="bb-gauge__tabs" role="group" aria-label="揀卡數" data-reveal>
          {SIZES.map((s, i) => (
            <button key={s.ct} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
              {s.ct} 卡
            </button>
          ))}
        </div>

        <div data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          <h2 id="gauge-title" className="bb-gauge__title bb-display">
            {size.ct} 卡有幾大？
          </h2>
          <p className="bb-gauge__desc" aria-live="polite">
            {size.ct} 卡圓形培育鑽石，直徑大約 {size.mm} 毫米；左邊係港幣一元硬幣（25.5 毫米），兩樣按同一比例畫。
            {growth > 0 ? ` 同 1 卡比，直徑只係大咗約 ${growth}%，唔係大一倍。` : ""}
            {growth < 0 ? ` 同 1 卡比，直徑細咗約 ${Math.abs(growth)}%。` : ""}
          </p>
          <p className="bb-gauge__list">
            參考直徑：{SIZES.map((s) => `${s.ct} 卡約 ${s.mm} 毫米`).join("，")}。實際尺寸視乎切工比例。
          </p>
        </div>

        <div className="bb-gauge__cells" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          <Link href={localizeHref("/4c", locale)}>第四章：卡數同視覺大小</Link>
          <a href={ask} {...askProps}>
            問 {size.ct} 卡培育鑽石價錢
          </a>
        </div>
      </div>
    </section>
  );
}
