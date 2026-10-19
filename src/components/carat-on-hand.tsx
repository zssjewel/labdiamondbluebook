"use client";

import Link from "@/components/link";
import { useEffect, useId, useRef, useState } from "react";
import { hasContact, isExternal, localizeHref, waHref } from "@/config/site";

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

function widthAt(f: FingerShape, y: number) {
  const y0 = f.tip + f.top / 2;
  return f.top + ((y - y0) / (BOTTOM - y0)) * (f.base - f.top);
}

/**
 * 手指輪廓：指尖係略扁嘅圓弧，第一節關節（DIP）微微收窄，第二節（PIP）略闊，再順住落到指根。
 * 闊度仍然跟 widthAt()（戒指位置嘅闊度唔變，比例基準唔變）。
 */
function fingerPath(f: FingerShape) {
  const { cx, tip, top } = f;
  const h = (y: number) => widthAt(f, y) / 2;
  const yTip = tip + top * 0.55;
  const yDip = tip + top * 1.25;
  const yPip = tip + top * 2.3;
  const ht = top / 2;
  const hd = h(yDip) * 0.985;
  const hp = h(yPip) * 1.012;
  const hb = h(BOTTOM);
  const r = (x: number) => x.toFixed(1);
  return [
    `M${r(cx - ht)},${r(yTip)}`,
    // 指尖
    `C${r(cx - ht)},${r(tip + top * 0.02)} ${r(cx + ht)},${r(tip + top * 0.02)} ${r(cx + ht)},${r(yTip)}`,
    // 右邊：指尖 → DIP → PIP → 指根
    `C${r(cx + ht)},${r((yTip + yDip) / 2)} ${r(cx + hd)},${r(yDip - top * 0.2)} ${r(cx + hd)},${r(yDip)}`,
    `C${r(cx + hd)},${r(yDip + top * 0.35)} ${r(cx + hp)},${r(yPip - top * 0.35)} ${r(cx + hp)},${r(yPip)}`,
    `C${r(cx + hp)},${r(yPip + 60)} ${r(cx + hb)},${r(BOTTOM - 80)} ${r(cx + hb)},${BOTTOM}`,
    `L${r(cx - hb)},${BOTTOM}`,
    // 左邊：返上去
    `C${r(cx - hb)},${r(BOTTOM - 80)} ${r(cx - hp)},${r(yPip + 60)} ${r(cx - hp)},${r(yPip)}`,
    `C${r(cx - hp)},${r(yPip - top * 0.35)} ${r(cx - hd)},${r(yDip + top * 0.35)} ${r(cx - hd)},${r(yDip)}`,
    `C${r(cx - hd)},${r(yDip - top * 0.2)} ${r(cx - ht)},${r((yTip + yDip) / 2)} ${r(cx - ht)},${r(yTip)}`,
    "Z",
  ].join(" ");
}

/** 指甲：圓頭、兩邊微微收窄、甲根圓弧，比之前細少少 */
function nailPath(f: FingerShape) {
  const w = f.top * 0.25;
  const wb = w * 0.9;
  const top = f.tip + f.top * 0.13;
  const bottom = f.tip + f.top * 0.74;
  const cx = f.cx;
  const r = (x: number) => x.toFixed(1);
  return [
    `M${r(cx - wb)},${r(bottom - wb * 0.55)}`,
    `C${r(cx - w * 1.02)},${r((top + bottom) / 2)} ${r(cx - w)},${r(top + w * 0.6)} ${r(cx - w)},${r(top + w * 0.8)}`,
    `C${r(cx - w)},${r(top - w * 0.2)} ${r(cx + w)},${r(top - w * 0.2)} ${r(cx + w)},${r(top + w * 0.8)}`,
    `C${r(cx + w)},${r(top + w * 0.6)} ${r(cx + w * 1.02)},${r((top + bottom) / 2)} ${r(cx + wb)},${r(bottom - wb * 0.55)}`,
    `C${r(cx + wb)},${r(bottom + wb * 0.15)} ${r(cx - wb)},${r(bottom + wb * 0.15)} ${r(cx - wb)},${r(bottom - wb * 0.55)}`,
    "Z",
  ].join(" ");
}

function Finger({ f, ids, ring }: { f: FingerShape; ids: Record<string, string>; ring?: boolean }) {
  const crease = (y: number, k: number) => {
    const w = widthAt(f, y) * k;
    return `M${(f.cx - w).toFixed(1)},${y.toFixed(1)} Q${f.cx},${(y + 3).toFixed(1)} ${(f.cx + w).toFixed(1)},${y.toFixed(1)}`;
  };
  const d = fingerPath(f);
  const nail = nailPath(f);
  const dip = f.tip + f.top * 1.25;
  const pip = f.tip + f.top * 2.3;
  return (
    <g data-ring-finger={ring ? "" : undefined}>
      {/* 手指之間嘅柔和陰影 */}
      <path d={d} fill="rgba(92, 60, 44, 0.22)" filter={`url(#${ids.soft})`} transform="translate(2 3)" />
      <path d={d} fill={`url(#${ids.skin})`} />
      <path d={d} fill={`url(#${ids.skinV})`} />
      <path d={d} fill="none" stroke="rgba(120, 82, 64, 0.28)" strokeWidth={0.9} />
      <path d={nail} fill={`url(#${ids.nail})`} />
      <path d={nail} fill="none" stroke="rgba(170, 120, 105, 0.35)" strokeWidth={0.8} />
      <ellipse cx={f.cx - f.top * 0.1} cy={f.tip + f.top * 0.36} rx={f.top * 0.045} ry={f.top * 0.11} fill="#ffffff" opacity={0.45} />
      <path d={crease(dip, 0.14)} fill="none" stroke="rgba(150, 105, 85, 0.32)" strokeWidth={1.1} strokeLinecap="round" />
      <path d={crease(pip - 4, 0.17)} fill="none" stroke="rgba(150, 105, 85, 0.28)" strokeWidth={1} strokeLinecap="round" />
      <path d={crease(pip + 3, 0.12)} fill="none" stroke="rgba(150, 105, 85, 0.22)" strokeWidth={0.9} strokeLinecap="round" />
    </g>
  );
}

/** 戒圈：同之前一樣嘅位置同闊度，改用銀白金屬漸變、窄高光同貼手指嘅陰影 */
function Band({ ids }: { ids: Record<string, string> }) {
  const w = widthAt(RING_FINGER, RING_Y) + 6;
  const x0 = 200 - w / 2;
  const x1 = 200 + w / 2;
  const top = RING_Y - 7;
  const bottom = RING_Y + 8;
  // 兩頭微微向下彎，好似圍住手指
  const d = `M${x0},${top + 2} Q200,${top - 2} ${x1},${top + 2} L${x1},${bottom - 1} Q200,${bottom + 3} ${x0},${bottom - 1} Z`;
  return (
    <g>
      <ellipse cx={200} cy={bottom + 2} rx={w / 2} ry={4} fill="rgba(92, 60, 44, 0.35)" filter={`url(#${ids.soft})`} />
      <ellipse cx={200} cy={top - 1} rx={w / 2 - 4} ry={2.5} fill="rgba(92, 60, 44, 0.18)" filter={`url(#${ids.soft})`} />
      <path d={d} fill={`url(#${ids.metal})`} />
      <path d={d} fill={`url(#${ids.metalWrap})`} />
      <path d={`M${x0 + 6},${top + 3.2} Q200,${top + 0.4} ${x1 - 6},${top + 3.2}`} fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1.4} strokeLinecap="round" />
      <path d={d} fill="none" stroke="rgba(110, 112, 118, 0.35)" strokeWidth={0.6} />
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
  // 每個組件實例用自己嘅漸變／濾鏡 id，同一頁有幾個都唔會撞
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    skin: `${uid}-skin`,
    skinV: `${uid}-skinv`,
    nail: `${uid}-nail`,
    metal: `${uid}-metal`,
    metalWrap: `${uid}-wrap`,
    soft: `${uid}-soft`,
  };
  // 主石用 HTML 圖片疊喺 SVG 上面：放大縮小交俾 GPU 做，唔使每格重新排版
  const VB = { x: 10, y: 40, w: 380, h: 440 };
  return (
    <div className="bb-hand" role="img" aria-label={label ?? `${fmtCt(ct)} 卡圓形培育鑽石戴喺手指上，按實際比例（直徑約 ${mm} 毫米）`}>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} aria-hidden="true">
        <defs>
          {/* 橫向：手指兩邊暗、中間亮，做出圓柱感 */}
          <linearGradient id={ids.skin} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c99c85" />
            <stop offset="0.16" stopColor="#ddb8a2" />
            <stop offset="0.46" stopColor="#ebcfbd" />
            <stop offset="0.6" stopColor="#e9ccb9" />
            <stop offset="0.86" stopColor="#d8b09a" />
            <stop offset="1" stopColor="#c69882" />
          </linearGradient>
          {/* 直向：指尖略淡，指根略深 */}
          <linearGradient id={ids.skinV} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff7f2" stopOpacity="0.18" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#8a5b45" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={ids.nail} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6e2dc" />
            <stop offset="0.7" stopColor="#efcfc6" />
            <stop offset="1" stopColor="#e6bdb2" />
          </linearGradient>
          {/* 戒圈：上下方向嘅金屬弧面，高光收窄喺上緣 */}
          <linearGradient id={ids.metal} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9bcc2" />
            <stop offset="0.22" stopColor="#f4f5f7" />
            <stop offset="0.36" stopColor="#dfe1e5" />
            <stop offset="0.7" stopColor="#c3c6cc" />
            <stop offset="1" stopColor="#9da1a8" />
          </linearGradient>
          {/* 戒圈兩頭轉入手指側面，暗少少 */}
          <linearGradient id={ids.metalWrap} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a5d64" stopOpacity="0.45" />
            <stop offset="0.14" stopColor="#5a5d64" stopOpacity="0" />
            <stop offset="0.86" stopColor="#5a5d64" stopOpacity="0" />
            <stop offset="1" stopColor="#5a5d64" stopOpacity="0.45" />
          </linearGradient>
          <filter id={ids.soft} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g className="bb-hand__fingers" style={{ transform: `scaleX(${sx})` }}>
          {OTHERS.map((f) => (
            <Finger key={f.cx} f={f} ids={ids} />
          ))}
          <Finger f={RING_FINGER} ids={ids} ring />
          <Band ids={ids} />
        </g>
      </svg>
      <img
        className="bb-hand__stone"
        src={SPRITE.src}
        alt=""
        width={520}
        height={503}
        decoding="async"
        style={{
          left: `${((200 - VB.x) / VB.w) * 100}%`,
          top: `${((RING_Y - VB.y) / VB.h) * 100}%`,
          width: `${(w / VB.w) * 100}%`,
          height: `${(h / VB.h) * 100}%`,
          transform: `translate(-50%, -50%) scale(${mm / 6.4})`,
        }}
      />
    </div>
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
export function CaratTool({ locale, worksHref }: { locale: string; worksHref?: string }) {
  const [ct, setCt] = useState(1);
  const [finger, setFinger] = useState(MID_MM);
  const ask = waHref(`你好，想問 ${fmtCt(ct)} 卡培育鑽石戒指大概幾錢？`);
  const askProps = isExternal(ask) ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <section className="bb-tool" aria-labelledby="tool-title">
      <div className="bb-tool__plate" data-reveal="panel">
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
        <div data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <Controls ct={ct} finger={finger} setCt={setCt} setFinger={setFinger} idPrefix="tool" />
        </div>
        <div className="bb-tool__links" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          <Link href={localizeHref("/4c/carat-size-on-hand", locale)} className="bb-btn bb-btn--blue">
            睇完整比較
          </Link>
          {worksHref && (
            <Link href={worksHref} className="bb-link">
              睇求婚戒指作品
            </Link>
          )}
          {hasContact && (
            <a href={ask} {...askProps} className="bb-link">
              問 {fmtCt(ct)} 卡價錢
            </a>
          )}
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

  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    setLive(true);
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
    <div className={live ? "bb-story is-live" : "bb-story"}>
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
