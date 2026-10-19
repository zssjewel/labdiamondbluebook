"use client";

import dynamic from "next/dynamic";

/**
 * 動效層延後載入：程式同 motion.css 等開頁之後先下載，唔同首屏搶頻寬。
 * 首屏要用嘅少量動效（刊頭、按鈕快答升起、頁頭毛玻璃）喺 globals.css。
 */
const MotionLayer = dynamic(() => import("./motion-layer"), { ssr: false });

export function MotionLazy() {
  return <MotionLayer />;
}
