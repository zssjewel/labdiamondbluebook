"use client";

import Link from "@/components/link";
import { useEffect, useState } from "react";

const KEY = "bb:last-read";
type LastRead = { path: string; title: string; chapter: string };

/** 文章頁：記住讀到哪一篇（只存在讀者自己的瀏覽器） */
export function ReadingTracker(props: LastRead) {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...props, at: Date.now() }));
    } catch {
      // 私密模式或封鎖儲存時忽略
    }
  }, [props]);
  return null;
}

/** 首頁：如果之前讀過，顯示「繼續閱讀」 */
export function ContinueReading() {
  const [last, setLast] = useState<LastRead | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLast(JSON.parse(raw) as LastRead);
    } catch {
      // 忽略
    }
  }, []);
  if (!last) return null;
  return (
    <p className="bb-continue">
      <span>上次讀到 {last.chapter}：</span>
      <Link href={last.path} className="bb-link">
        {last.title}
      </Link>
    </p>
  );
}
