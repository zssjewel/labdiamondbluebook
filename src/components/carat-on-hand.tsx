"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isExternal, localizeHref, waHref } from "@/config/site";

/**
 * 卡數戴喺手上有幾大。
 * 手係平面插圖，主石係 3D 渲染（正上方望落），兩樣按同一比例尺畫：
 * 中等手指（戒圈內徑約 16.5 毫米）= 110 個 SVG 單位。
 */

/** 標準圓形明亮式切工：卡數 → 大約直徑（毫米），中間按直線插值 */
const CHART: [number, number][] = [
  [0.25, 4.1],
  [0.5, 5.1],
  [0.75, 5.8],
  [1, 6.4],
  [1.25, 6.9],
  [1.5, 7.4],
  [1.75, 7.8],
  [2, 8.1],
  [2.5, 8.7],
  [3, 9.3],
];

export function diameterOf(ct: number) {
  if (ct <= CHART[0][0]) return CHART[0][1];
  for (let i = 1; i < CHART.length; i++) {
    const [c1, d1] = CHART[i];
    const [c0, d0] = CHART[i - 1];
    if (ct <= c1) return Math.round((d0 + ((ct - c0) / (c1 - c0)) * (d1 - d0)) * 10) / 10;
  }
  return CHART[CHART.length - 1][1];
}

export const FINGERS = [
  { id: "slim", label: "手指幼", mm: 15.5 },
  { id: "mid", label: "中等", mm: 16.5 },
  { id: "wide", label: "手指粗", mm: 18 },
] as const;

const MID_MM = 16.5;
const UNIT = 110 / MID_MM; // 每毫米幾多 SVG 單位
/** 渲染圖裡主石腰圍約佔圖片闊度 94%（另外 6% 係爪） */
const SPRITE = { src: "/images/hand/stone-top.webp", girdle: 0.94, ratio: 503 / 520 };

const fmtCt = (ct: number) => (Number.isInteger(ct) ? String(ct) : String(Number(ct.toFixed(2))));
const pctOf = (mm: number, finger: number) => Math.round((mm / finger) * 100);

type FingerShape = { cx: number; tip: number; top: number; base: number };
const BOTTOM = 520;
const RING_FINGER: FingerShape = { cx: 200, tip: 46, top: 100, base: 118 };
const OTHERS: FingerShape[] = [
  { cx: 84, tip: 10, top: 104, base: 122 },
  { cx: 314, tip: 146, top: 86, base: 102 },
];
const RING_Y = 372;

function fingerPath(f: FingerShape, dx = 0, shrink = 0) {
  const t = (f.top - shrink) / 2;
  const b = (f.base - shrink) / 2;
  const cx = f.cx + dx;
  const y = f.tip + t + shrink / 2;
  return `M${cx - t},${y} A${t},${t} 0 0 1 ${cx + t},${y} L${cx + b},${BOTTOM} L${cx - b},${BOTTOM} Z`;
}
function widthAt(f: FingerShape, y: number) {
  const y0 = f.tip + f.top / 2;
  return f.top + ((y - y0) / (BOTTOM - y0)) * (f.base - f.top);
}

function Finger({ f }: { f: FingerShape }) {
  const nailW = f.top * 0.6;
  const crease = (y: number) => {
    const w = widthAt(f, y) * 0.22;
    return `M${f.cx - w},${y} Q${f.cx},${y + 7} ${f.cx + w},${y}`;
  };
  return (
    <g>
      <path d={fingerPath(f, 4)} fill="var(--skin-shade)" />
      <path d={fingerPath(f, -2, 6)} fill="var(--skin)" />
      <rect x={f.cx - nailW / 2 - 1} y={f.tip + 12} width={nailW} height={f.top * 0.74} rx={nailW / 2} fill="var(--nail)" />
      <rect x={f.cx - nailW / 2 + 7} y={f.tip + 22} width={nailW * 0.22} height={f.top * 0.36} rx={nailW * 0.11} fill="var(--nail-hi)" />
      <path d={crease(f.tip + f.top * 1.25)} fill="none" stroke="var(--skin-shade)" strokeWidth={3} strokeLinecap="round" />
      <path d={crease(f.tip + f.top * 2.3)} fill="none" stroke="var(--skin-shade)" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** 手 + 戒指。ct 決定主石大小，finger 決定手指粗幼（橫向縮放，主石唔跟住縮）。 */
export function HandFigure({ ct, finger, label }: { ct: number; finger: number; label?: string }) {
  const mm = diameterOf(ct);
  const base = 6.4 * UNIT;
  const w = base / SPRITE.girdle;
  const h = w * SPRITE.ratio;
  const sx = finger / MID_MM;
  const bandW = widthAt(RING_FINGER, RING_Y) + 6;
  return (
    <svg className="bb-hand" viewBox="10 40 380 440" role="img" aria-label={label ?? `${fmtCt(ct)} 卡圓形培育鑽石戴喺手指上，按實際比例（直徑約 ${mm} 毫米）`}>
      <g className="bb-hand__fingers" style={{ transform: `scaleX(${sx})` }}>
        {OTHERS.map((f) => (
          <Finger key={f.cx} f={f} />
        ))}
        <Finger f={RING_FINGER} />
        <rect x={200 - bandW / 2} y={RING_Y + 9} width={bandW} height={6} rx={3} fill="var(--skin-shade)" />
        <rect x={200 - bandW / 2} y={RING_Y - 8} width={bandW} height={17} rx={5} fill="var(--metal)" />
        <rect x={200 - bandW / 2 + 4} y={RING_Y - 6} width={bandW - 8} height={5} rx={2.5} fill="var(--metal-hi)" />
      </g>
      <g className="bb-hand__stone" style={{ transform: `scale(${mm / 6.4})` }}>
        <image href={SPRITE.src} x={200 - w / 2} y={RING_Y - h / 2} width={w} height={h} />
      </g>
    </svg>
  );
}

function Readout({ ct, finger }: { ct: number; finger: number }) {
  const mm = diameterOf(ct);
  return (
    <p className="bb-hand__read" aria-live="polite">
      <strong>{fmtCt(ct)} 卡</strong>
      <span>直徑約 {mm} 毫米</span>
      <span>佔手指闊度約 {pctOf(mm, finger)}%</span>
    </p>
  );
}

function Controls({ ct, finger, setCt, setFinger, idPrefix }: { ct: number; finger: number; setCt: (n: number) => void; setFinger: (n: number) => void; idPrefix: string }) {
  return (
    <div className="bb-hand__controls">
      <label htmlFor={`${idPrefix}-ct`} className="bb-hand__label">
        拉動揀卡數
      </label>
      <input
        id={`${idPrefix}-ct`}
        className="bb-hand__range"
        style={{ "--p": `${((ct - 0.25) / 2.75) * 100}%` } as React.CSSProperties}
        type="range"
        min={0.25}
        max={3}
        step={0.05}
        value={ct}
        onChange={(e) => setCt(Number(e.target.value))}
        aria-valuetext={`${fmtCt(ct)} 卡`}
      />
      <div className="bb-hand__ticks" aria-hidden="true">
        {[0.25, 1, 2, 3].map((t) => (
          <span key={t} style={{ left: `${((t - 0.25) / 2.75) * 100}%` }}>
            {t === 3 ? "3 卡" : t}
          </span>
        ))}
      </div>
      <div className="bb-hand__fingers-pick" role="group" aria-label="手指粗幼">
        {FINGERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={finger === f.mm} onClick={() => setFinger(f.mm)}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 首頁：自己拉動試 */
export function CaratTool({ locale }: { locale: string }) {
  const [ct, setCt] = useState(1);
  const [finger, setFinger] = useState(MID_MM);
  const ask = waHref(`你好，想問 ${fmtCt(ct)} 卡培育鑽石戒指大概幾錢？`);
  const askProps = isExternal(ask) ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <section className="bb-tool" aria-labelledby="tool-title">
      <div className="bb-tool__plate" data-reveal>
        <HandFigure ct={ct} finger={finger} />
      </div>
      <div className="bb-tool__panel">
        <div data-reveal>
          <h2 id="tool-title" className="bb-tool__title bb-display">
            戴喺手上
            <br />
            有幾大？
          </h2>
          <Readout ct={ct} finger={finger} />
          <p className="bb-tool__desc">按實際比例畫。重量加倍，直徑只係大約多四分一；同一粒石，手指幼啲會顯得大啲。</p>
        </div>
        <div data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          <Controls ct={ct} finger={finger} setCt={setCt} setFinger={setFinger} idPrefix="tool" />
        </div>
        <div className="bb-tool__links" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          <Link href={localizeHref("/4c/carat-size-on-hand", locale)} className="bb-btn bb-btn--blue">
            睇完整比較
          </Link>
          <a href={ask} {...askProps} className="bb-link">
            問 {fmtCt(ct)} 卡價錢
          </a>
        </div>
      </div>
    </section>
  );
}

type Step = { ct: number; finger: number; title: string; text: string };

const STORY: Step[] = [
  { ct: 0.5, finger: MID_MM, title: "0.5 卡", text: "直徑約 5.1 毫米，大概佔中等手指闊度三成。秀氣，返工日日戴都唔誇張。" },
  { ct: 1, finger: MID_MM, title: "1 卡", text: "直徑約 6.4 毫米，佔手指約四成。重量係 0.5 卡嘅兩倍，直徑只係大咗 1.3 毫米。" },
  { ct: 1.5, finger: MID_MM, title: "1.5 卡", text: "直徑約 7.4 毫米。由呢個大小開始，存在感明顯咗好多。" },
  { ct: 2, finger: MID_MM, title: "2 卡", text: "直徑約 8.1 毫米，差唔多遮住半隻手指。重量係 1 卡兩倍，直徑大約大咗四分一。" },
  { ct: 3, finger: MID_MM, title: "3 卡", text: "直徑約 9.3 毫米，超過手指闊度一半。重量係 1 卡三倍，直徑只係大約 1.45 倍。" },
  { ct: 1, finger: 15.5, title: "同一粒 1 卡，換隻幼手指", text: "戒圈內徑約 15.5 毫米嘅手指，1 卡佔手指約 41%，睇落明顯大啲。" },
  { ct: 1, finger: 18, title: "換隻粗手指", text: "戒圈內徑約 18 毫米，同一粒 1 卡只佔約 36%。手指粗嘅話，想有同樣效果，要揀大少少。" },
];

/** 文章：邊碌邊變（手固定喺一邊，文字逐段經過） */
export function CaratStory() {
  const [active, setActive] = useState(0);
  const [ct, setCt] = useState(1);
  const [finger, setFinger] = useState(MID_MM);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const isTool = active === STORY.length;
  const shown = isTool ? { ct, finger } : STORY[active];

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-55% 0px -40% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bb-story">
      <div className="bb-story__fig">
        <div className="bb-story__sticky">
          <HandFigure ct={shown.ct} finger={shown.finger} />
          <Readout ct={shown.ct} finger={shown.finger} />
        </div>
      </div>
      <ol className="bb-story__steps">
        {STORY.map((s, i) => (
          <li
            key={s.title}
            data-step={i}
            ref={(el) => {
              steps.current[i] = el;
            }}
            className={i === active ? "is-active" : undefined}
          >
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
        <li
          data-step={STORY.length}
          ref={(el) => {
            steps.current[STORY.length] = el;
          }}
          className={isTool ? "is-active bb-story__tool" : "bb-story__tool"}
        >
          <h3>自己試</h3>
          <p>拉動揀卡數，再揀手指粗幼。數字係標準圓形明亮式切工嘅大約直徑。</p>
          <Controls
            ct={ct}
            finger={finger}
            setCt={(n) => {
              setCt(n);
              setActive(STORY.length);
            }}
            setFinger={(n) => {
              setFinger(n);
              setActive(STORY.length);
            }}
            idPrefix="story"
          />
        </li>
      </ol>
    </div>
  );
}
