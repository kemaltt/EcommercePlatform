// client/src/components/language-switcher.tsx
import { useLanguage } from '@/contexts/language-context';
import { LOCALES, LOCALE_NAMES } from '@/i18n/locales';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{LOCALE_NAMES[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LOCALE_NAMES).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLocale(key as keyof typeof LOCALE_NAMES)}
            className={locale === key ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}