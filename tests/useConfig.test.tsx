/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from '../src/hooks/useConfig';
import type { ConfigData } from '../src/types/config';

const mockConfigData: ConfigData = {
  meta: {
    country: 'DE',
    currency: 'EUR',
    taxYear: 2024
  },
  taxClasses: {
    1: {
      label: 'Class I',
      basicAllowance: 11604,
      additionalAllowance: 0,
      brackets: [
        { upTo: 11604, rate: 0, baseTax: 0, baseIncome: 0 },
        { upTo: 17005, rate: 14, baseTax: 0, baseIncome: 11604 }
      ]
    }
  },
  solidarityTax: {
    freeAllowance: 17543,
    rate: 5.5
  },
  churchTax: {
    rate: 8,
    rateByState: {}
  },
  socialContributions: {
    health: { employeeRate: 7.3, capMonthly: 5175 },
    pension: { employeeRate: 9.3, capMonthly: 7550 },
    unemployment: { employeeRate: 1.3, capMonthly: 7550 },
    longTermCare: {
      employeeRate: 1.7,
      capMonthly: 5175,
      surchargeWithoutChildren: 0.6
    }
  },
  allowances: {
    homeOfficeDailyRate: 6,
    homeOfficeMax: 1260,
    commuteRateFirst20: 0.3,
    commuteRateBeyond: 0.38,
    voluntaryInsurance: {
      thresholdMonthly: 5000,
      additionalRate: 2.0
    },
    mealVoucherTaxFreeLimit: 7.23,
    capitalGainsAllowanceMaxEmployer: 100,
    childAllowancePerFactor: 250
  },
  companyCarBenefitRates: {
    combustion: 1.0,
    hybrid: 0.5,
    electric: 0.25
  },
  companyPensionMaxTaxFree: 584
};

// Test component that uses the hook
function TestComponent() {
  const { config, loading, error, refresh } = useConfig();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {config && <div>Config loaded</div>}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}

describe('useConfig hook', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when used outside ConfigProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useConfig must be used within a ConfigProvider');

    consoleError.mockRestore();
  });

  it('loads config successfully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfigData
    });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for config to load
    await waitFor(() => {
      expect(screen.getByText('Config loaded')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to load configuration \(404\)/)).toBeInTheDocument();
  });

  it('handles network error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('handles unknown error types', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce('Unknown error');

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Unknown error/)).toBeInTheDocument();
  });

  it('can refresh config', async () => {
    let callCount = 0;
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => mockConfigData
      };
    });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Config loaded')).toBeInTheDocument();
    });

    expect(callCount).toBe(1);

    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    refreshButton.click();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  it('sends cache-control header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConfigData
    });
    global.fetch = mockFetch;

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Config loaded')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/data/config.json',
      expect.objectContaining({
        headers: { 'Cache-Control': 'no-cache' }
      })
    );
  });

  it('maintains loading state during refresh', async () => {
    let resolvePromise: ((value: Response) => void) | undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(fetchPromise);

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Resolve the fetch
    resolvePromise!({
      ok: true,
      json: async () => mockConfigData
    });

    await waitFor(() => {
      expect(screen.getByText('Config loaded')).toBeInTheDocument();
    });
  });
});
