import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * 站內連結：預設唔預載。
 * Next.js 預設會喺連結出現喺畫面時預先下載目標頁資料，首頁有幾十條連結，
 * 手機開頁時會多出大量請求；呢個網站係靜態頁，撳落先載已經夠快。
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
