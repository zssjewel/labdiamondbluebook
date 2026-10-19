/**
 * 「多變一」流程圖：左邊散亂的方塊（一堆資料）→ 中間收窄成一條帶（同師傅傾）→ 右邊排好（做出嚟）。
 * 方塊位置用固定種子計算，每次構建都一樣。
 */
import { FILL, SQUARES } from "./how-data";
import { HowSort } from "./how-sort";

/** 方塊先畫喺最終位置；排隊動畫由 HowSort 喺瀏覽器加上（唔會令 HTML 變大） */
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
      <HowSort />
    </>
  );
}
