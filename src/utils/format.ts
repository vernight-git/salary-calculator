/**
 * Formats a number as currency in German locale
 * @param value - Number to format
 * @param currency - Currency code (e.g., 'EUR', 'USD')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56, 'EUR') // "1.234,56 €"
 */
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Formats a number with German locale formatting
 * @param value - Number to format
 * @returns Formatted number string
 * @example
 * formatNumber(1234.56) // "1.234,56"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}
