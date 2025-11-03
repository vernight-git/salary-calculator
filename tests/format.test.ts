import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber } from '../src/utils/format';

describe('formatCurrency', () => {
  it('formats positive numbers as EUR currency', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toContain('1.234,56');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'EUR');
    expect(result).toContain('0,00');
    expect(result).toContain('€');
  });

  it('formats negative numbers correctly', () => {
    const result = formatCurrency(-1234.56, 'EUR');
    expect(result).toContain('-1.234,56');
    expect(result).toContain('€');
  });

  it('formats large numbers with proper thousands separators', () => {
    const result = formatCurrency(1234567.89, 'EUR');
    expect(result).toContain('1.234.567,89');
    expect(result).toContain('€');
  });

  it('handles decimal precision correctly', () => {
    const result1 = formatCurrency(1234.5, 'EUR');
    expect(result1).toContain('1.234,50');
    const result2 = formatCurrency(1234.555, 'EUR');
    expect(result2).toContain('1.234,56'); // rounds up
  });

  it('supports different currencies', () => {
    const result = formatCurrency(1000, 'USD');
    expect(result).toContain('1.000,00');
  });
});

describe('formatNumber', () => {
  it('formats whole numbers without decimals', () => {
    expect(formatNumber(1234)).toBe('1.234');
  });

  it('formats numbers with decimals up to 2 places', () => {
    expect(formatNumber(1234.56)).toBe('1.234,56');
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats negative numbers correctly', () => {
    expect(formatNumber(-1234.56)).toBe('-1.234,56');
  });

  it('rounds numbers with more than 2 decimal places', () => {
    expect(formatNumber(1234.567)).toBe('1.234,57');
  });

  it('formats large numbers with proper separators', () => {
    expect(formatNumber(1234567.89)).toBe('1.234.567,89');
  });

  it('handles very small decimal numbers', () => {
    expect(formatNumber(0.01)).toBe('0,01');
  });
});
