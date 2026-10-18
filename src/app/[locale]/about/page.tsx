import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SmartLink } from "@/components/site";
import { SITE, hasContact, localizeHref, orDemo, waHref } from "@/config/site";
import { Demo } from "@/components/demo";
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
      <h2 id="master">師傅介紹</h2>
      {SITE.master.name || SITE.demo ? (
        <div className="bb-master">
          {SITE.master.photo ? (
            <img src={SITE.master.photo} alt={`${SITE.master.name}師傅`} width={480} height={480} loading="lazy" decoding="async" />
          ) : (
            <div className="bb-master__ph" aria-hidden="true">
              師傅相片
              <br />
              （待替換）
            </div>
          )}
          <div>
            <p className="bb-master__name">
              {orDemo(SITE.master.name, "（師傅姓名）")}
              <Demo show={!SITE.master.name} />
            </p>
            <p className="bb-master__title">{orDemo(SITE.master.title, `${SITE.publisher}・師傅（職銜待填）`)}</p>
            <p>{orDemo(SITE.master.bio, "師傅簡介待填：入行年資、擅長嘅款式同工序、做過幾多件培育鑽石訂造、點解開始做呢本書。兩三句就夠，配一張工作枱或者真人相。")}</p>
          </div>
        </div>
      ) : (
        <p>師傅介紹整理中。</p>
      )}

      <h2 id="studio">工坊資料</h2>
      <dl className="bb-studio">
        <div>
          <dt>地址</dt>
          <dd>
            {orDemo(SITE.studio.address, "香港（詳細地址待填）")}
            <Demo show={!SITE.studio.address} />
          </dd>
        </div>
        <div>
          <dt>營業時間</dt>
          <dd>
            {orDemo(SITE.studio.hours, "營業時間待填")}
            <Demo show={!SITE.studio.hours} />
          </dd>
        </div>
        <div>
          <dt>睇貨／度戒圈</dt>
          <dd>
            {orDemo(SITE.studio.booking, "預約方式待填（例如：WhatsApp 預約，約時間上工坊）")}
            <Demo show={!SITE.studio.booking} />
          </dd>
        </div>
      </dl>

      <h2 id="contact">聯絡</h2>
      <p>想問款式、預算、手寸，或者發現書中有錯，歡迎直接聯絡師傅。</p>
      {SITE.whatsapp ? (
        <p>
          <SmartLink href={waHref("你好，我想問培育鑽石訂造：")} className="bb-btn bb-btn--accent">
            WhatsApp 問師傅
          </SmartLink>
        </p>
      ) : hasContact ? (
        <p>
          WhatsApp：+852 XXXX XXXX <Demo />
          <br />
          號碼填入 <code>src/config/site.ts</code> 嘅 whatsapp 之後，全站按鈕會直接開 WhatsApp。
        </p>
      ) : (
        <p>
          <strong>聯絡方式籌備中，開通後會喺呢度公佈。</strong>
        </p>
      )}
    </LegalPage>
  );
}
