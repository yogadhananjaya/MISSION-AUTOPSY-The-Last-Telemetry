import { useMissionStore } from '../store/useMissionStore';
import { translations, type Language, type Translations } from './translations';

export { type Language, type Translations } from './translations';

export const useTranslation = (): {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
} => {
  const language = useMissionStore((s) => s.language);
  const setLanguage = useMissionStore((s) => s.setLanguage);
  const t = translations[language] || translations.en;

  return { t, language, setLanguage };
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};
