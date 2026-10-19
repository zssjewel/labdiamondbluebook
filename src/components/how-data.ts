/**
 * 「多變一」流程圖嘅方塊位置（伺服器同瀏覽器共用，用固定種子，每次一樣）。
 * 碌到呢段時：中間同右邊嘅方塊由左邊亂堆度出發，逐粒排入隊、再排成整齊方陣（色由粉轉藍）。
 * fx/fy = 出發點相對最終位置嘅距離；a/b = 喺碌動進度入面幾時開始、幾時到位。
 */
export type Move = { fx: number; fy: number; a: number; b: number };
export type Sq = { x: number; y: number; tone: "a" | "b" | "c"; from?: "a" | "b"; move?: Move };

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

export const SQUARES = buildSquares();
export const FILL = { a: "#cfb3a6", b: "#e6d0c5", c: "#34508f" } as const;

