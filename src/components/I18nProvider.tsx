"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { translations, SupportedLanguage } from "@/lib/i18n/translations";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: "uk",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("uk");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language or fallback to 'uk'
    const saved = localStorage.getItem("app_language") as SupportedLanguage;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    } else {
      // If no saved language, try browser language, else default to 'uk'
      const browserLang = navigator.language.split("-")[0] as SupportedLanguage;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[language];
      if (dict && dict[key]) {
        return dict[key];
      }
      
      // Fallback to english if missing in current lang
      if (translations["en"] && translations["en"][key]) {
        return translations["en"][key];
      }

      // Return key if completely missing
      return key;
    },
    [language]
  );

  // Provide a simple default context before mounting to avoid hydration mismatch 
  // on text rendered in children. Though hydration mismatch might still happen if
  // default language 'uk' differs from saved language.
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ language: "uk", setLanguage, t: (k) => translations["uk"][k] || k }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
