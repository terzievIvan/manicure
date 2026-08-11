"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Currency = "EUR" | "USD" | "UAH";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "EUR",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("manic_currency") as Currency | null;
    if (saved) {
      setCurrencyState(saved);
    }
    setMounted(true);
  }, []);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("manic_currency", curr);
  };

  if (!mounted) {
    return <CurrencyContext.Provider value={{ currency: "EUR", setCurrency }}>{children}</CurrencyContext.Provider>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
