import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SITE, localizeHref } from "@/config/site";

export const metadata: Metadata = {
  title: `使用條款｜${SITE.name}`,
  description: "培育鑽石藍皮書網站的使用條款。",
  alternates: { canonical: localizeHref("/terms-of-service") },
};

export default function TermsPage() {
  return (
    <LegalPage title="使用條款">
      <p>本網站內容由鄒三山工坊編著，只供一般參考，不構成投資或法律意見。培育鑽石首飾不宜作為投資或保值用途。</p>
      <h2>價錢和市場資料</h2>
      <p>書中價錢區間和市場數據會註明來源和日期，實際價錢以個別報價為準。市場變化快，請留意文章的更新日期。</p>
      <h2>比較及推薦</h2>
      <p>本書比較和推薦的內容包括鄒三山工坊自己，詳見「關於本書」頁面的編著聲明。</p>
      <h2>版權</h2>
      <p>本網站文字、圖表和圖片的版權屬鄒三山工坊所有，引用時請註明出處並附上連結。除「作品案例」外，網站上的首飾及場景圖片為示意圖（AI 生成或 3D 渲染）；作品案例為工坊訂造過的款式，相片只供參考，每件訂造的成品會因應規格而有所不同。</p>
    </LegalPage>
  );
}
