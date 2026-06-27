import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../messages/en.json";
import es from "../messages/es.json";

const messages = { en, es };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
