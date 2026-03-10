import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OPTIONS: { value: Currency; label: string; flag: string }[] = [
  { value: 'PYG', label: '₲ Guaraní', flag: '🇵🇾' },
  { value: 'BRL', label: 'R$ Real', flag: '🇧🇷' },
  { value: 'USD', label: '$ Dollar', flag: '🇺🇸' },
];

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
      <SelectTrigger className="w-[110px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            <span className="mr-1">{opt.flag}</span> {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
