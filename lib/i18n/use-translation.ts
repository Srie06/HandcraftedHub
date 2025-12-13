import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LanguageCode } from './config';

/**
 * Custom hook for translations with type safety
 */
export function useTranslation() {
  const { t, i18n } = useI18nextTranslation();

  const changeLanguage = (lang: LanguageCode) => {
    i18n.changeLanguage(lang);
  };

  const currentLanguage = i18n.language as LanguageCode;

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

/**
 * Get language name in native script
 */
export function getLanguageName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.nativeName || code;
}

/**
 * Get language name in English
 */
export function getLanguageEnglishName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.name || code;
}

/**
 * Check if language is RTL
 */
export function isRTL(code: LanguageCode): boolean {
  return SUPPORTED_LANGUAGES[code]?.rtl || false;
}
