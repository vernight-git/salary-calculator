import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ConfigData } from '../types/config';
import type { SalaryCalculatorContextValue } from '../types/salary';

const ConfigContext = createContext<SalaryCalculatorContextValue | undefined>(undefined);

async function fetchConfig(): Promise<ConfigData> {
  const response = await fetch('/data/config.json', {
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!response.ok) {
    throw new Error(`Unable to load configuration (${response.status})`);
  }
  return (await response.json()) as ConfigData;
}

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const value = useMemo<SalaryCalculatorContextValue>(
    () => ({
      config,
      error,
      loading,
      refresh: load
    }),
    [config, error, loading]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): SalaryCalculatorContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
