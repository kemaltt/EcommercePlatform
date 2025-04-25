// client/src/contexts/language-context.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { LOCALES, LocaleType } from '@/i18n/locales';

// Dil mesajlarını import ediyoruz
import trMessages from '@/i18n/messages/tr-TR';
import enMessages from '@/i18n/messages/en-US';
import deMessages from '@/i18n/messages/de-DE';

const messages = {
  [LOCALES.TURKISH]: trMessages,
  [LOCALES.ENGLISH]: enMessages,
  [LOCALES.GERMAN]: deMessages,
};

type LanguageContextType = {
  locale: LocaleType;
  setLocale: (locale: LocaleType) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<LocaleType>(() => {
    const savedLocale = localStorage.getItem('locale') as LocaleType;
    if (savedLocale && savedLocale in messages) {
      return savedLocale;
    }
    
    const browserLocale = navigator.language;
    if (browserLocale.startsWith('tr')) {
      return LOCALES.TURKISH;
    } else if (browserLocale.startsWith('de')) {
      return LOCALES.GERMAN;
    }
    return LOCALES.ENGLISH;
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = React.useMemo(() => {
    return { locale, setLocale };
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      <IntlProvider
        messages={messages[locale]}
        locale={locale}
        defaultLocale={LOCALES.ENGLISH}
      >
        {children}
      </IntlProvider>
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