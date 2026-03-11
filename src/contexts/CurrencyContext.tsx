import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type Currency = 'PYG' | 'BRL' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInPYG: number) => string;
  ratesLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback approximate rates from PYG
const FALLBACK_RATES: Record<Currency, number> = {
  PYG: 1,
  BRL: 1 / 1450,
  USD: 1 / 7300,
};

const CURRENCY_CONFIG: Record<Currency, { locale: string; currency: string; decimals: number }> = {
  PYG: { locale: 'es-PY', currency: 'PYG', decimals: 0 },
  BRL: { locale: 'pt-BR', currency: 'BRL', decimals: 2 },
  USD: { locale: 'en-US', currency: 'USD', decimals: 2 },
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('preferred-currency');
    return (saved as Currency) || 'PYG';
  });

  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Fetch live exchange rates (PYG base)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // frankfurter.app is free, no API key needed
        const res = await fetch('https://api.frankfurter.app/latest?from=PYG&to=BRL,USD');
        if (!res.ok) throw new Error('Rate fetch failed');
        const data = await res.json();
        setRates({
          PYG: 1,
          BRL: data.rates.BRL ?? FALLBACK_RATES.BRL,
          USD: data.rates.USD ?? FALLBACK_RATES.USD,
        });
      } catch {
        // Use fallback rates silently
        console.warn('Using fallback exchange rates');
        setRates(FALLBACK_RATES);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSetCurrency = useCallback((c: Currency) => {
    setCurrency(c);
    localStorage.setItem('preferred-currency', c);
  }, []);

  const formatPrice = useCallback((priceInPYG: number) => {
    const config = CURRENCY_CONFIG[currency];
    const converted = priceInPYG * rates[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, ratesLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
