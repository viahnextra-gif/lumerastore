import { createContext, useContext, ReactNode } from 'react';

export type Currency = 'BRL';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInBRL: number) => string;
  ratesLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const formatPrice = (priceInBRL: number) => formatter.format(priceInBRL || 0);

  return (
    <CurrencyContext.Provider
      value={{
        currency: 'BRL',
        setCurrency: () => {},
        formatPrice,
        ratesLoading: false,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
