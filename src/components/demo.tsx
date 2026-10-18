import { SITE } from "@/config/site";

/** 示例內容旁邊嘅小標籤，提醒呢度係待替換嘅示例 */
export function Demo({ show = true }: { show?: boolean }) {
  if (!SITE.demo || !show) return null;
  return <span className="bb-demo">示例</span>;
}
