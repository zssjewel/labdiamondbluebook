/**
 * 文章「形狀總覽」用：十種常見形狀嘅正面輪廓，按 1 卡大約尺寸嘅比例畫（每格同一個毫米比例）。
 * 純 SVG、伺服器出 HTML，唔使 JS。
 */
type Shape = { id: string; name: string; mm: [number, number]; d: (w: number, h: number) => string; facets?: (w: number, h: number) => string };

const r = (n: number) => n.toFixed(1);

// 以 (0,0) 為中心、闊 w 高 h 畫輪廓
const ellipse = (w: number, h: number) => `M0 ${r(-h / 2)} A${r(w / 2)} ${r(h / 2)} 0 1 1 0 ${r(h / 2)} A${r(w / 2)} ${r(h / 2)} 0 1 1 0 ${r(-h / 2)}Z`;
const pear = (w: number, h: number) => {
  const tip = -h / 2;
  const ry = h / 2 - w / 2;
  return `M0 ${r(tip)} C${r(w * 0.16)} ${r(tip + h * 0.22)} ${r(w / 2)} ${r(ry - w * 0.42)} ${r(w / 2)} ${r(ry)} A${r(w / 2)} ${r(w / 2)} 0 0 1 ${r(-w / 2)} ${r(ry)} C${r(-w / 2)} ${r(ry - w * 0.42)} ${r(-w * 0.16)} ${r(tip + h * 0.22)} 0 ${r(tip)}Z`;
};
const marquise = (w: number, h: number) => `M0 ${r(-h / 2)} Q${r(w)} 0 0 ${r(h / 2)} Q${r(-w)} 0 0 ${r(-h / 2)}Z`;
const rect = (cut: number) => (w: number, h: number) => {
  const x = w / 2, y = h / 2, c = Math.min(w, h) * cut;
  return `M${r(-x + c)} ${r(-y)} H${r(x - c)} L${r(x)} ${r(-y + c)} V${r(y - c)} L${r(x - c)} ${r(y)} H${r(-x + c)} L${r(-x)} ${r(y - c)} V${r(-y + c)}Z`;
};
const cushion = (w: number, h: number) => {
  const x = w / 2, y = h / 2, k = Math.min(w, h) * 0.28;
  return `M${r(-x + k)} ${r(-y)} H${r(x - k)} Q${r(x)} ${r(-y)} ${r(x)} ${r(-y + k)} V${r(y - k)} Q${r(x)} ${r(y)} ${r(x - k)} ${r(y)} H${r(-x + k)} Q${r(-x)} ${r(y)} ${r(-x)} ${r(y - k)} V${r(-y + k)} Q${r(-x)} ${r(-y)} ${r(-x + k)} ${r(-y)}Z`;
};
const heart = (w: number, h: number) => {
  const x = w / 2, y = h / 2;
  return `M0 ${r(y)} C${r(-x * 0.55)} ${r(y * 0.45)} ${r(-x)} ${r(-y * 0.05)} ${r(-x)} ${r(-y * 0.45)} C${r(-x)} ${r(-y * 1.02)} ${r(-x * 0.2)} ${r(-y * 1.05)} 0 ${r(-y * 0.55)} C${r(x * 0.2)} ${r(-y * 1.05)} ${r(x)} ${r(-y * 1.02)} ${r(x)} ${r(-y * 0.45)} C${r(x)} ${r(-y * 0.05)} ${r(x * 0.55)} ${r(y * 0.45)} 0 ${r(y)}Z`;
};
// 階梯切工：畫兩圈內框表示一級級嘅階梯刻面
const steps = (cut: number) => (w: number, h: number) => [0.72, 0.45].map((k) => rect(cut)(w * k, h * k)).join(" ");

const SHAPES: Shape[] = [
  { id: "round", name: "圓形", mm: [6.4, 6.4], d: ellipse },
  { id: "oval", name: "橢圓", mm: [5.7, 7.7], d: ellipse },
  { id: "pear", name: "梨形", mm: [5.5, 8.5], d: pear },
  { id: "marquise", name: "馬眼", mm: [5, 10], d: marquise },
  { id: "heart", name: "心形", mm: [6.5, 6.1], d: heart },
  { id: "princess", name: "公主方", mm: [5.5, 5.5], d: rect(0.04) },
  { id: "cushion", name: "墊形", mm: [5.6, 5.6], d: cushion },
  { id: "radiant", name: "雷地恩", mm: [5.2, 6.4], d: rect(0.16) },
  { id: "emerald", name: "祖母綠", mm: [5, 7], d: rect(0.2), facets: steps(0.2) },
  { id: "asscher", name: "阿斯切", mm: [5.5, 5.5], d: rect(0.24), facets: steps(0.24) },
];

const U = 8; // 1 毫米 = 8 個 SVG 單位
const CELL = 100;

export function ShapeGrid() {
  return (
    <figure className="bb-shapes">
      <ul>
        {SHAPES.map((s) => {
          const [w, h] = s.mm.map((n) => n * U);
          return (
            <li key={s.id}>
              <svg viewBox={`${-CELL / 2} ${-CELL / 2} ${CELL} ${CELL}`} aria-hidden="true">
                <path className="bb-shapes__stone" d={s.d(w, h)} />
                {s.facets && <path className="bb-shapes__facet" d={s.facets(w, h)} />}
              </svg>
              <strong>{s.name}</strong>
              <span>
                {s.mm[0] === s.mm[1] ? `約 ${s.mm[0]} 毫米` : `約 ${Math.max(...s.mm)} × ${Math.min(...s.mm)} 毫米`}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption>十種常見形狀，全部按 1 卡常見比例同一個比例尺畫，方便比較正面睇落嘅大細；實際尺寸以證書為準。</figcaption>
    </figure>
  );
}
