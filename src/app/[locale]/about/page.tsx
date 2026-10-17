import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SmartLink } from "@/components/site";
import { SITE, hasContact, localizeHref, waHref } from "@/config/site";
import { robotsFor } from "@/lib/indexing";

export const metadata: Metadata = {
  title: `關於本書及編著聲明｜${SITE.name}`,
  description: "《培育鑽石藍皮書》由香港鄒三山工坊編著。本頁說明本書由誰撰寫、內容怎樣核對，以及比較和推薦內容包括工坊自己。",
  alternates: { canonical: localizeHref("/about") },
  robots: robotsFor(true),
};

export default function AboutPage() {
  return (
    <LegalPage title="關於本書">
      <p>
        《培育鑽石藍皮書》是一本寫給想訂造培育鑽石首飾的人看的攻略，由香港鄒三山工坊編著。書分九章，由入門、價錢、證書、4C、形狀款式，一直講到訂造流程、揀商家、場景和保養。
      </p>
      <h2 id="disclosure">編著聲明</h2>
      <p>
        本書由鄒三山工坊編著，工坊本身提供培育鑽石首飾訂造服務。我們在書中比較不同購買渠道時，比較對象<strong>包括我們自己</strong>；推薦名單之中亦有工坊本身。
      </p>
      <p>
        比較的章節只比較渠道（品牌店、工廠直訂、網購、深圳水貝等），不點名評價個別同行。價錢、市場數據會註明來源和日期；涉及工藝和報價的內容，由工坊師傅核對。尚未核對的文章會在頁頂註明「初稿」。
      </p>
      <h2 id="contact">聯絡</h2>
      <p>
        想問款式、預算、手寸，或者發現書中有錯，歡迎直接聯絡師傅。
      </p>
      <p>
        {hasContact ? (
          <SmartLink href={waHref("你好，我想問培育鑽石訂造：")} className="bb-btn bb-btn--accent">
            WhatsApp 問師傅
          </SmartLink>
        ) : (
          <strong>聯絡方式籌備中，開通後會喺呢度公佈。</strong>
        )}
      </p>
      {!SITE.whatsapp && <p>（WhatsApp 號碼即將公佈。）</p>}
    </LegalPage>
  );
}
