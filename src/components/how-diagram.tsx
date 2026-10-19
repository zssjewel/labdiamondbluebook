/**
 * 「多變一」流程圖：左邊散亂的方塊（一堆資料）→ 中間收窄成一條帶（同師傅傾）→ 右邊排好（做出嚟）。
 * 方塊位置用固定種子計算，每次構建都一樣。
 * 方塊（SVG 裝飾層）同三張寫實示意圖（img 層）放喺同一個定位容器 .bb-how__stage，
 * 三張圖中心對正方塊三個區（橫版 x=150/450/750，直版 y=150/450/750），縮放視窗都唔會錯位。
 * 冇 JS／減少動畫時：只見三張圖，方塊層收埋；排隊動畫由 motion-layer 喺瀏覽器加上。
 */
import { FILL, SQUARES } from "./how-data";

const PICS = [
  { key: "learn", alt: "示意圖：攤開嘅參考書同幾粒培育鑽石裸石" },
  { key: "consult", alt: "示意圖：綠色蠟版、設計草圖同卡尺" },
  { key: "finished", alt: "示意圖：做好嘅橢圓單石培育鑽石戒指" },
] as const;

const SIZES = "(max-width: 760px) min(46vw, 240px), min(30vw, 324px)";

export function HowDiagram() {
  return (
    <div className="bb-how__stage">
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
      {PICS.map((p, i) => (
        <div key={p.key} className={`bb-how__pic bb-how__pic--${p.key}`} style={{ "--k": i } as React.CSSProperties}>
          <img
            src={`/images/process/process-${p.key}-720.webp`}
            srcSet={`/images/process/process-${p.key}-480.webp 480w, /images/process/process-${p.key}-720.webp 720w`}
            sizes={SIZES}
            width={720}
            height={720}
            alt={p.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
