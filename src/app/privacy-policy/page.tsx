import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SITE, localizeHref } from "@/config/site";

export const metadata: Metadata = {
  title: `私隱政策｜${SITE.name}`,
  description: "培育鑽石藍皮書網站如何處理瀏覽資料和你主動提供的資料。",
  alternates: { canonical: localizeHref("/privacy-policy") },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="私隱政策">
      <p>本網站由鄒三山工坊營運。閱讀本網站無須登記，亦不會要求你提供任何帳戶密碼或付款資料。</p>
      <h2>瀏覽資料</h2>
      <p>為了解哪些內容有用，本網站可能使用網站分析工具（例如 Google Analytics、Microsoft Clarity）收集一般瀏覽資料，例如瀏覽的頁面、裝置類型、瀏覽器和大約地區。這些資料不會用來辨認個別人士。</p>
      <h2>你主動提供的資料</h2>
      <p>你經 WhatsApp 聯絡師傅時提供的資料（例如款式圖片、預算、手寸、聯絡方法），只會用於回覆你的查詢和處理你的訂造，不會出售給第三方。</p>
      <h2>外部連結</h2>
      <p>本網站可能連結到化驗所、消費者委員會等外部網站，這些網站各自有其私隱政策。</p>
      <h2>查詢</h2>
      <p>如對本政策有疑問，請經「關於本書」頁面的聯絡方法與我們聯絡。</p>
    </LegalPage>
  );
}
