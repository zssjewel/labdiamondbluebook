import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MotionLayer } from "@/components/motion-layer";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/site";
import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#34508f",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE.url),
    title: { default: SITE.homeTitle, template: "%s" },
    description: SITE.description,
    applicationName: SITE.name,
    openGraph: { type: "website", locale: "zh_HK", siteName: SITE.name, images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
    icons: { icon: [{ url: "/favicon.ico" }, { url: "/favicon-32x32.png", sizes: "32x32" }], apple: "/apple-touch-icon.png" },
    manifest: "/manifest.json",
    // 正式上線前不讓搜尋引擎收錄
    robots: SITE.launched ? { index: true, follow: true } : { index: false, follow: false },
  };
}


export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const clarityId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.publisher,
    url: SITE.url,
    areaServed: "HK",
  };

  return (
    <html lang={SITE.htmlLang} suppressHydrationWarning>
      <head>
        {/* 價錢、證書號碼唔好俾手機自動變成電話連結 */}
        <meta name="format-detection" content="telephone=no" />
        {/*
          開頁速度：呢句細 script 會等 CSS 載完先執行，令瀏覽器喺 CSS 到之前唔會同時下載一大堆程式檔，
          手機網絡慢時，CSS 同正文會先到，首屏快大約 0.3–0.4 秒（同一部機 A/B 實測）。唔好刪。
        */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        {clarityId && (
          <Script id="clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
          </Script>
        )}
        <NextIntlClientProvider messages={messages}>
          <div id="top" />
          <JsonLd data={organization} />
          <SiteHeader locale={locale} />
          {children}
          <SiteFooter locale={locale} />
          <MotionLayer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
