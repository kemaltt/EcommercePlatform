// client/src/components/ui/language-switcher.tsx
import { useLanguage } from '@/contexts/language-context';
import { LOCALES, LOCALE_NAMES } from '@/i18n/locales';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: LOCALES.TURKISH, label: 'TR', flag: '🇹🇷' },
  { code: LOCALES.ENGLISH, label: 'EN', flag: '🇺🇸' },
  { code: LOCALES.GERMAN,  label: 'DE', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const currentIndex = LANGUAGES.findIndex(l => l.code === locale);
  const nextIndex = (currentIndex + 1) % LANGUAGES.length;
  const current = LANGUAGES[currentIndex];
  const next = LANGUAGES[nextIndex];

  // Animasyon için state
  const [animating, setAnimating] = useState(false);
  const [iconKey, setIconKey] = useState(current.code);

  useEffect(() => {
    setIconKey(current.code);
  }, [current.code]);

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => {
      setLocale(next.code);
      setAnimating(false);
    }, 200);
  };

  return (
    <button
      aria-label="Dili değiştir"
      className={cn(
        "relative flex items-center justify-center w-14 h-10 rounded-full transition-colors bg-muted hover:bg-primary/10 focus:outline-none overflow-hidden",
        animating && "ring-2 ring-primary/40"
      )}
      onClick={handleClick}
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
    >
      <span
        key={iconKey}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-base font-semibold transition-all duration-200 ease-in-out",
          animating ? "scale-0 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0"
        )}
      >
        <span className="text-xl">{current.flag}</span> {current.label}
      </span>
      <span
        key={next.code}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-base font-semibold transition-all duration-200 ease-in-out",
          animating ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-45"
        )}
      >
        <span className="text-xl">{next.flag}</span> {next.label}
      </span>
    </button>
  );
}