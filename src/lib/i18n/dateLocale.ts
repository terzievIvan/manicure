import { uk, enUS, de, fr, ru, Locale } from "date-fns/locale";
import { SupportedLanguage } from "./translations";

export const dateFnsLocales: Record<SupportedLanguage, Locale> = {
  uk: uk,
  en: enUS,
  de: de,
  fr: fr,
  ru: ru,
};

export const intlLocales: Record<SupportedLanguage, string> = {
  uk: "uk-UA",
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  ru: "ru-RU",
};

export function getDateFnsLocale(lang: SupportedLanguage): Locale {
  return dateFnsLocales[lang] || uk;
}

export function getIntlLocale(lang: SupportedLanguage): string {
  return intlLocales[lang] || "uk-UA";
}
