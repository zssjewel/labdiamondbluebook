import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import zhHk from "@/locales/zh-hk.json";

const messagesMap: Record<string, typeof zhHk> = {
  "zh-hk": zhHk,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: messagesMap[locale] ?? zhHk };
});
