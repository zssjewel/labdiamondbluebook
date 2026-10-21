import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SmartLink } from "@/components/site";
import { SITE, hasContact, localizeHref, orDemo, waHref } from "@/config/site";
import { Demo } from "@/components/demo";
import { robotsFor } from "@/lib/indexing";
import { CERT_LAB } from "@/config/promises";

export const metadata: Metadata = {
  title: `關於本書及編著聲明｜${SITE.name}`,
  description: "《培育鑽石藍皮書》由鄒三山工坊編著。本頁介紹工坊（東莞 25 年老廠、香港送貨上門）、四項承諾和條款，以及本書的編著聲明。",
  alternates: { canonical: localizeHref("/about") },
  robots: robotsFor(true),
};

export default function AboutPage() {
  return (
    <LegalPage title="關於本書">
      <p>
        《培育鑽石藍皮書》是一本寫給想訂造培育鑽石首飾的人看的攻略，由鄒三山工坊編著。書分九章，由入門、價錢、證書、4C、形狀款式，一直講到訂造流程、揀商家、場景和保養。
      </p>
      <h2 id="story">工坊故事</h2>
      <p>
        鄒三山是廠二代。父輩是九十年代從港資珠寶廠出身的老師傅，工坊在東莞做了 25 年，一直堅持純正港工工藝。現在的師傅同樣是九十年代港資廠出身，工齡全部在 20 年以上。
      </p>
      <p>
        工坊自己生產，沒有中間商，訂一件也是出廠價；做好之後由香港送貨上門。
      </p>
      <div className="bb-about__figs">
        <figure>
          <img src="/images/workshop-v2/workshop-interior-v2-800.webp" srcSet="/images/workshop-v2/workshop-interior-v2-480.webp 480w, /images/workshop-v2/workshop-interior-v2-800.webp 800w" sizes="(max-width: 760px) 46vw, 300px" alt="珠寶工坊內師傅、工作台與工具的場景（AI 寫實示意圖）" width={1200} height={1200} loading="lazy" decoding="async" style={{ objectPosition: "50% 40%" }} />
          <figcaption>
            工坊場景<span className="bb-demo">AI 示意</span>
          </figcaption>
        </figure>
        <figure>
          <img src="/images/workshop-v2/factory-direct-v2-800.webp" srcSet="/images/workshop-v2/factory-direct-v2-480.webp 480w, /images/workshop-v2/factory-direct-v2-800.webp 800w" sizes="(max-width: 760px) 46vw, 300px" alt="工坊師傅把單件戒指禮盒裝箱出貨（AI 示意圖）" width={1200} height={800} loading="lazy" decoding="async" />
          <figcaption>
            工坊直接出貨<span className="bb-demo">AI 示意</span>
          </figcaption>
        </figure>
      </div>

      <h2 id="promise">四項承諾及條款</h2>
      <ol className="bb-terms">
        <li>
          <strong>工廠直出價。</strong>工坊自己生產，沒有中間商，訂一件也按出廠價計算。
        </li>
        <li>
          <strong>按約定規格製作。</strong>材質不摻假、不虛標，按雙方確認的款式和規格製作。
        </li>
        <li>
          <strong>省檢證書，全球複檢，假一罰十。</strong>出貨前附{CERT_LAB}省檢證書，檢測金屬材質，以及鑽石屬培育鑽石還是天然鑽石，證書支持全球複檢。如材質或鑽石與證書、單據不符，按成交價十倍賠償。
          主石可選擇附國際證書（IGI 或 GIA）或不附證書（價錢較低）；碎鑽、小顆粒鑽石一般不附證書。
        </li>
        <li>
          <strong>送貨上門，滿意才付尾款。</strong>全港任何地區送貨上門。客人見面驗貨，滿意才付尾款；如不滿意，可即場取消，訂金全數退還。已刻字的貨品同樣適用。
        </li>
      </ol>
      <div className="bb-about__figs">
        <figure>
          <img src="/images/workshop-v2/quality-certificate-v2-800.webp" srcSet="/images/workshop-v2/quality-certificate-v2-480.webp 480w, /images/workshop-v2/quality-certificate-v2-800.webp 800w" sizes="(max-width: 760px) 46vw, 300px" alt="珠寶品質檢驗報告的示意樣本，並非真實證書（AI 生成）" width={1200} height={800} loading="lazy" decoding="async" />
          <figcaption>
            質檢報告示意<span className="bb-demo">AI 示意</span>
          </figcaption>
        </figure>
        <figure>
          <img src="/images/workshop-v2/doorstep-handover-v2-800.webp" srcSet="/images/workshop-v2/doorstep-handover-v2-480.webp 480w, /images/workshop-v2/doorstep-handover-v2-800.webp 800w" sizes="(max-width: 760px) 46vw, 300px" alt="工作人員送貨到家，與顧客當面開盒驗看戒指（AI 示意圖）" width={1200} height={800} loading="lazy" decoding="async" />
          <figcaption>
            上門交付驗貨<span className="bb-demo">AI 示意</span>
          </figcaption>
        </figure>
      </div>

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
