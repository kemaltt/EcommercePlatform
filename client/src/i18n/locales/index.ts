export type LocaleType = 'tr-TR' | 'en-US' | 'de-DE';

export const LOCALES = {
  TURKISH: 'tr-TR' as const,
  ENGLISH: 'en-US' as const,
  GERMAN: 'de-DE' as const,
};

export const LOCALE_NAMES = {
  [LOCALES.TURKISH]: 'Türkçe',
  [LOCALES.ENGLISH]: 'English',
  [LOCALES.GERMAN]: 'Deutsch',
};