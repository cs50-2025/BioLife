import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './languages/en.json';
import es from './languages/es.json';
import ta from './languages/ta.json';
import hi from './languages/hi.json';
import fr from './languages/fr.json';
import de from './languages/de.json';
import zh from './languages/zh.json';
import ja from './languages/ja.json';
import ar from './languages/ar.json';
import pt from './languages/pt.json';
import ko from './languages/ko.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ta: { translation: ta },
  hi: { translation: hi },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
  ar: { translation: ar },
  pt: { translation: pt },
  ko: { translation: ko },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'ta', 'hi', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'ko'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'biolife_language',
    }
  });

export default i18n;
