import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { translations, DEFAULT_LANGUAGE, LANGUAGES } from '../i18n/translations.js';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'nova_language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    const dict = translations[language] || translations[DEFAULT_LANGUAGE];
    const fallback = translations[DEFAULT_LANGUAGE];
    return (key, vars) => {
      let str = dict[key] ?? fallback[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v);
        });
      }
      return str;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
