import en from "./en.json";
import si from "./si.json";
import ta from "./ta.json";

export type Locale = "en" | "si" | "ta";

export const translations = {
  en,
  si,
  ta,
};

export function getTranslation(locale: Locale) {
  return translations[locale] || translations.en;
}
