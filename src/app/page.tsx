/**
 * 根目錄 /。部署時會用 /zh-hk 首頁覆蓋這個文件（見 .github/workflows/deploy-workers.yml），
 * 這裡只是本地預覽時的跳轉。
 */
export default function RootPage() {
  return (
    <html lang="zh-HK">
      <head>
        <meta httpEquiv="refresh" content="0;url=/zh-hk" />
        <link rel="canonical" href="/zh-hk" />
      </head>
      <body>
        <a href="/zh-hk">培育鑽石藍皮書</a>
      </body>
    </html>
  );
}
