/**
 * 「多變一」流程圖：左邊散亂的方塊（一堆資料）→ 中間收窄成一條帶（同師傅傾）→ 右邊排好（做出嚟）。
 * 方塊位置用固定種子計算，每次構建都一樣。
 */
/**
 * 碌到呢段時：中間同右邊嘅方塊由左邊亂堆度出發，逐粒排入隊、再排成整齊方陣（色由粉轉藍）。
 * fx/fy = 出發點相對最終位置嘅距離；a/b = 喺碌動進度入面幾時開始、幾時到位。
 * 唔支援碌動動畫嘅瀏覽器，或者揀咗減少動畫，就直接顯示最終排好嘅樣。
 */
type Move = { fx: number; fy: number; a: number; b: number };
type Sq = { x: number; y: number; tone: "a" | "b" | "c"; from?: "a" | "b"; move?: Move };

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildSquares(): Sq[] {
  const rand = seeded(20261017);
  const out: Sq[] = [];
  for (let i = 0; i < 42; i++) {
    out.push({ x: 8 + rand() * 262, y: 14 + rand() * 162, tone: rand() > 0.5 ? "a" : "b" });
  }
  // 出發點：用另一個固定種子喺左邊亂堆範圍入面揀
  const start = seeded(20261019);
  const from = () => ({ sx: 8 + start() * 262, sy: 14 + start() * 162 });
  const r = (n: number) => Math.round(n * 10) / 10;
  for (let col = 0; col < 22; col++) {
    for (let row = 0; row < 3; row++) {
      const x = 300 + col * 13.5;
      const y = 82 + row * 13.5;
      const { sx, sy } = from();
      const a = 5 + col * 0.5 + row * 0.4;
      const tone = col < 11 ? "b" : "a";
      out.push({ x, y, tone, from: tone, move: { fx: r(sx - x), fy: r(sy - y), a: r(a), b: r(a + 16) } });
    }
  }
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      const x = 640 + col * 21;
      const y = 46 + row * 30;
      const { sx, sy } = from();
      const a = 16 + col * 0.8 + row * 1.0;
      out.push({ x, y, tone: "c", from: start() > 0.5 ? "a" : "b", move: { fx: r(sx - x), fy: r(sy - y), a: r(a), b: r(a + 18) } });
    }
  }
  return out;
}

const SQUARES = buildSquares();
const FILL = { a: "#cfb3a6", b: "#e6d0c5", c: "#34508f" } as const;

function moveStyle(m: Move, fill: string, vertical: boolean) {
  return {
    "--fx": `${vertical ? m.fy : m.fx}px`,
    "--fy": `${vertical ? m.fx : m.fy}px`,
    "--a": `${m.a}%`,
    "--b": `${m.b}%`,
    "--f0": fill,
  } as React.CSSProperties;
}

export function HowDiagram() {
  return (
    <>
      <svg className="bb-how__svg bb-how__svg--h" viewBox="0 0 900 200" aria-hidden="true">
        {SQUARES.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={11}
            height={11}
            fill={FILL[s.tone]}
            className={s.move ? "m" : undefined}
            style={s.move ? moveStyle(s.move, FILL[s.from ?? s.tone], false) : undefined}
          />
        ))}
      </svg>
      <svg className="bb-how__svg bb-how__svg--v" viewBox="0 0 200 900" aria-hidden="true">
        {SQUARES.map((s, i) => (
          <rect
            key={i}
            x={s.y}
            y={s.x}
            width={11}
            height={11}
            fill={FILL[s.tone]}
            className={s.move ? "m" : undefined}
            style={s.move ? moveStyle(s.move, FILL[s.from ?? s.tone], true) : undefined}
          />
        ))}
      </svg>
    </>
  );
}
