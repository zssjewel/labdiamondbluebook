/**
 * 「多變一」流程圖：左邊散亂的方塊（一堆資料）→ 中間收窄成一條帶（同師傅傾）→ 右邊排好（做出嚟）。
 * 方塊位置用固定種子計算，每次構建都一樣。
 */
type Sq = { x: number; y: number; tone: "a" | "b" | "c" };

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
  for (let col = 0; col < 22; col++) {
    for (let row = 0; row < 3; row++) {
      out.push({ x: 300 + col * 13.5, y: 82 + row * 13.5, tone: col < 11 ? "b" : "a" });
    }
  }
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      out.push({ x: 640 + col * 21, y: 46 + row * 30, tone: "c" });
    }
  }
  return out;
}

const SQUARES = buildSquares();
const FILL = { a: "#8fa6d8", b: "#b9c8e9", c: "#e8b53c" } as const;

export function HowDiagram() {
  return (
    <>
      <svg className="bb-how__svg bb-how__svg--h" viewBox="0 0 900 200" aria-hidden="true">
        {SQUARES.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={11} height={11} fill={FILL[s.tone]} />
        ))}
      </svg>
      <svg className="bb-how__svg bb-how__svg--v" viewBox="0 0 200 900" aria-hidden="true">
        {SQUARES.map((s, i) => (
          <rect key={i} x={s.y} y={s.x} width={11} height={11} fill={FILL[s.tone]} />
        ))}
      </svg>
    </>
  );
}
