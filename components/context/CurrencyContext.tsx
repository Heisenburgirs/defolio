import React, { createContext, useState, useEffect } from 'react';

// Create a context for the currency data
const CurrencyDataContext = createContext<CurrencyDataContextValue  | null>(null);

// Create a provider component
export const CurrencyDataProvider: React.FC<CurrencyDataProviderProps> = ({ children }) => {
  const [currencyData, setCurrencyData] = useState<CurrencyData>({ GBP: 0, EUR: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://v6.exchangerate-api.com/v6/5ccbecbd4fc65fb7e62aa13c/latest/USD");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        setCurrencyData({
          GBP: result.conversion_rates.GBP,
          EUR: result.conversion_rates.EUR
        });

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const contextValue = {
    currencyData,
    error,
    loading,
  };

  return (
    <CurrencyDataContext.Provider value={contextValue}>
      {children}
    </CurrencyDataContext.Provider>
  );
};

// Custom hook for accessing the currency data
export const useCurrencyData = () => {
  const contextValue = React.useContext(CurrencyDataContext);
  if (contextValue === null) {
    throw new Error('useCurrencyData must be used within a CurrencyDataProvider');
  }
  return contextValue;
};