import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'es' | 'ta' | 'hi' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'pt' | 'ko';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();

  const language = (i18n.language || 'en') as Language;

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
