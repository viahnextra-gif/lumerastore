import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Currency = 'PYG' | 'BRL' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInPYG: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Approximate exchange rates from PYG
const RATES: Record<Currency, number> = {
  PYG: 1,
  BRL: 1 / 1450,   // ~1450 PYG = 1 BRL
  USD: 1 / 7300,    // ~7300 PYG = 1 USD
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

  const handleSetCurrency = useCallback((c: Currency) => {
    setCurrency(c);
    localStorage.setItem('preferred-currency', c);
  }, []);

  const formatPrice = useCallback((priceInPYG: number) => {
    const config = CURRENCY_CONFIG[currency];
    const converted = priceInPYG * RATES[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
