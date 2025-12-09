// Lightweight i18n implementation without external dependencies
import enTranslations from "./locales/en.json";
import frTranslations from "./locales/fr.json";
import esTranslations from "./locales/es.json";
import arTranslations from "./locales/ar.json";

type TranslationKey = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<string, any> = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
  ar: arTranslations,
};

class I18n {
  private currentLanguage: string = "en";

  constructor() {
    // Load from localStorage or browser language
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && translations[saved]) {
      this.currentLanguage = saved;
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
    this.updateDocumentLanguage();
  }

  changeLanguage(lang: string) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem("preferredLanguage", lang);
      this.updateDocumentLanguage();
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  t(key: TranslationKey): string {
    const keys = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  }

  private updateDocumentLanguage() {
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir =
      this.currentLanguage === "ar" ? "rtl" : "ltr";
  }
}

export const i18n = new I18n();

// React hook
export function useTranslation() {
  return {
    t: (key: string) => i18n.t(key),
    i18n: {
      language: i18n.getLanguage(),
      changeLanguage: (lang: string) => i18n.changeLanguage(lang),
    },
  };
}
