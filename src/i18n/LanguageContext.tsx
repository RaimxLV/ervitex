import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

// Keep one context instance across hot reloads so providers/consumers never mismatch.
const g = globalThis as unknown as { __ervitexLangCtx?: React.Context<LanguageContextType | null> };
const LanguageContext = g.__ervitexLangCtx ?? (g.__ervitexLangCtx = createContext<LanguageContextType | null>(null));

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Server render and first client render use Latvian; a saved English choice
  // is applied right after hydration so the markup always matches.
  const [lang, setLangState] = useState<Language>("lv");

  useEffect(() => {
    const saved = window.localStorage.getItem("ervitex-lang");
    if (saved === "en") setLangState("en");
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("ervitex-lang", newLang);
  }, []);

  const t = useCallback((key: TranslationKey) => {
    const years = new Date().getFullYear() - 1998;
    return (translations[key]?.[lang] || key).replace(/\{years\}/g, String(years));
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
