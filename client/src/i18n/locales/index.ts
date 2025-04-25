export type LocaleType = 'tr-TR' | 'en-US' | 'de-DE';

export const LOCALES = {
  GERMAN: 'de-DE' as const,
  ENGLISH: 'en-US' as const,
  TURKISH: 'tr-TR' as const,
};

export const LOCALE_NAMES = {
  [LOCALES.GERMAN]: 'Deutsch',
  [LOCALES.ENGLISH]: 'English',
  [LOCALES.TURKISH]: 'Türkçe',
};