import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from '../src/hooks/useConfig';
import type { ConfigData } from '../src/types/config';

const mockConfigData: ConfigData = {
  taxClasses: {
    1: {
      name: 'Class I',
      brackets: [
        { upTo: 11604, rate: 0 },
        { upTo: 17005, rate: 14 }
      ]
    }
  },
  socialInsurance: {
    health: { rate: 7.3, cap: 5175 },
    pension: { rate: 9.3, cap: 7550 },
    unemployment: { rate: 1.3, cap: 7550 },
    longTermCare: { baseRate: 1.7, childlessSurcharge: 0.6, cap: 5175 }
  },
  allowances: {
    homeOffice: { maxDays: 210, dailyRate: 6 },
    commuter: { threshold: 20, belowRate: 0.3, aboveRate: 0.38 }
  },
  voluntaryInsurance: {
    monthlyAmount: 100,
    baseContribution: 50,
    perChildReduction: 10,
    maxChildren: 3
  }
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
    global.fetch = vi.fn();
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
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

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
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
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
