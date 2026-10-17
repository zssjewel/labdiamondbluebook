import { defineRouting } from "next-intl/routing";

/**
 * 支援的語言。現在只有香港繁中；台灣版上線時加 "zh-tw"，
 * 並在 src/i18n/request.ts 和 src/locales/ 加對應檔案。
 */
export const routing = defineRouting({
  locales: ["zh-hk"],
  defaultLocale: "zh-hk",
  // 靜態導出要求每個網址都帶語言前綴
  localePrefix: "always",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
