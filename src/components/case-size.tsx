/**
 * 作品頁「戴喺手上有幾大」：按真實毫米比例畫主石、光環同無名指闊度，底下有毫米尺。
 * 純 SVG、伺服器出 HTML，唔使 JS；數字全部由作品資料嚟（按一般比例估算，圖下寫明）。
 */
type Size = { shape: "pear" | "oval" | "round"; stone: [number, number]; halo?: [number, number]; finger?: number };

const U = 10; // 1 毫米 = 10 個 SVG 單位

function outline(shape: Size["shape"], cx: number, cy: number, L: number, W: number) {
  if (shape === "round" || shape === "oval") {
    return `M ${cx} ${cy - L / 2} A ${W / 2} ${L / 2} 0 1 1 ${cx} ${cy + L / 2} A ${W / 2} ${L / 2} 0 1 1 ${cx} ${cy - L / 2} Z`;
  }
  // 梨形：尖頭向上（向指甲），圓頭喺下
  const tip = cy - L / 2;
  const ry = cy + L / 2 - W / 2;
  return [
    `M ${cx} ${tip}`,
    `C ${cx + W * 0.16} ${tip + L * 0.22} ${cx + W / 2} ${ry - W * 0.42} ${cx + W / 2} ${ry}`,
    `A ${W / 2} ${W / 2} 0 0 1 ${cx - W / 2} ${ry}`,
    `C ${cx - W / 2} ${ry - W * 0.42} ${cx - W * 0.16} ${tip + L * 0.22} ${cx} ${tip}`,
    "Z",
  ].join(" ");
}

export function CaseSize({ size, caption }: { size: Size; caption: string }) {
  const finger = (size.finger ?? 17) * U;
  const [sl, sw] = size.stone.map((n) => n * U);
  const [hl, hw] = (size.halo ?? size.stone).map((n) => n * U);
  const span = 30; // 毫米尺長度
  const w = span * U + 220; // 兩邊留位寫字
  const cx = w / 2;
  // 手指由上面指尖（圓頭）一直伸落嚟，戒指戴喺中段
  const cy = finger / 2 + 36 + hl / 2;
  const fingerBottom = cy + hl / 2 + 56;
  const rulerY = fingerBottom + 70;
  const h = rulerY + 44;
  const x0 = cx - (span * U) / 2;
  const label = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} 毫米`;
  return (
    <figure className="bb-size">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={caption}>
        {/* 無名指 */}
        <path className="bb-size__finger" d={`M ${cx - finger / 2} ${fingerBottom} V ${finger / 2} A ${finger / 2} ${finger / 2} 0 0 1 ${cx + finger / 2} ${finger / 2} V ${fingerBottom}`} />
        {/* 光環 */}
        {size.halo && <path className="bb-size__halo" d={outline(size.shape, cx, cy, hl, hw)} />}
        {/* 主石 */}
        <path className="bb-size__stone" d={outline(size.shape, cx, cy + (hl - sl) * 0.06, sl, sw)} />
        {/* 主石長度 */}
        <g className="bb-size__dim">
          <line x1={cx + finger / 2 + 14} y1={cy - sl / 2} x2={cx + finger / 2 + 14} y2={cy + sl / 2} />
          <line x1={cx + finger / 2 + 8} y1={cy - sl / 2} x2={cx + finger / 2 + 20} y2={cy - sl / 2} />
          <line x1={cx + finger / 2 + 8} y1={cy + sl / 2} x2={cx + finger / 2 + 20} y2={cy + sl / 2} />
          <text x={cx + finger / 2 + 28} y={cy + 6}>
            主石長 {label(size.stone[0])}
          </text>
        </g>
        {/* 無名指闊度 */}
        <g className="bb-size__dim">
          <line x1={cx - finger / 2} y1={fingerBottom + 12} x2={cx + finger / 2} y2={fingerBottom + 12} />
          <text x={cx - finger / 2 - 12} y={cy + 6} textAnchor="end">
            主石闊 {label(size.stone[1])}
          </text>
          {size.halo && (
            <text x={cx - finger / 2 - 12} y={cy + 32} textAnchor="end">
              連光環約 {size.halo[0]} × {size.halo[1]}
            </text>
          )}
          <line x1={cx - finger / 2} y1={fingerBottom + 6} x2={cx - finger / 2} y2={fingerBottom + 18} />
          <line x1={cx + finger / 2} y1={fingerBottom + 6} x2={cx + finger / 2} y2={fingerBottom + 18} />
          <text x={cx} y={fingerBottom + 42} textAnchor="middle">
            無名指約 {label((size.finger ?? 17))} 闊
          </text>
        </g>
        {/* 毫米尺 */}
        <g className="bb-size__ruler">
          <line x1={x0} y1={rulerY} x2={x0 + span * U} y2={rulerY} />
          {Array.from({ length: span + 1 }, (_, i) => (
            <line key={i} x1={x0 + i * U} y1={rulerY} x2={x0 + i * U} y2={rulerY - (i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6)} />
          ))}
          {[0, 10, 20, 30].map((n) => (
            <text key={n} x={x0 + n * U} y={rulerY + 22} textAnchor="middle">
              {n}
            </text>
          ))}
          <text x={x0 + span * U} y={rulerY + 40} textAnchor="end">
            毫米
          </text>
        </g>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export type { Size as CaseSizeData };
