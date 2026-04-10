import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages: { code: Language; label: string; flag: string; currency: Currency }[] = [
  { code: 'es', label: 'Español', flag: '🇵🇾', currency: 'PYG' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', currency: 'BRL' },
  { code: 'en', label: 'English', flag: '🇺🇸', currency: 'USD' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { setCurrency } = useCurrency();

  const handleLanguageChange = (lang: typeof languages[number]) => {
    setLanguage(lang.code);
    setCurrency(lang.currency);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-sm">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
