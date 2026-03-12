import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const { language, toggleLanguage, isRTL, fontsLoaded } = useContext(LanguageContext);

  const t = (key: TranslationKey | string): string => {
    const langObj = translations[language];
    // Cast to safely index with string, fallback to key if not found
    return (langObj as any)[key] || key;
  };

  const currentFont = isRTL && fontsLoaded ? 'Cairo_400Regular' : undefined;
  const currentFontBold = isRTL && fontsLoaded ? 'Cairo_700Bold' : undefined;

  return { t, language, toggleLanguage, isRTL, currentFont, currentFontBold };
};
