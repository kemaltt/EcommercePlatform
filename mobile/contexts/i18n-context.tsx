import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import * as Localization from "expo-localization";
import en from "../i18n/en.json";
import tr from "../i18n/tr.json";
import de from "../i18n/de.json";

const messages: Record<string, any> = { en, tr, de };

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>("de");

  useEffect(() => {
    const deviceLanguage = Localization.getLocales()[0].languageCode;
    if (deviceLanguage && messages[deviceLanguage]) {
      setLocale(deviceLanguage);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="de">
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
