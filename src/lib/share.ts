/**
 * 社交平台分享圖（og:image、twitter:image）。
 * 冇專屬圖嘅頁面用預設封面；有專屬圖嘅頁面，OG 同 Twitter 用同一張（網址、尺寸、alt 一致）。
 * 分享封面用 JPG：Facebook、WhatsApp、LinkedIn 等抓圖程式對 JPG 支援最穩陣；呢張圖只有分享平台會下載，訪客開頁唔會載。
 */
export type ShareImage = { url: string; width: number; height: number; alt: string };

export const DEFAULT_SHARE: ShareImage = {
  url: "/images/social/share-cover-labdiamond-1200x630.jpg",
  width: 1200,
  height: 630,
  alt: "培育鑽石藍皮書分享封面：書名與橢圓鑽石戒指示意圖（AI 生成）",
};

/** 一次過出 openGraph.images 同 twitter，兩邊用同一張圖 */
export function shareImages(image: ShareImage = DEFAULT_SHARE) {
  return {
    ogImages: [image],
    twitter: { card: "summary_large_image" as const, images: [image] },
  };
}
