import { CurrencyConfig } from '../types';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', locale: 'ar-AE' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
};

export const DEFAULT_CURRENCY = 'USD';

export function getCurrencyConfig(code: string = 'USD'): CurrencyConfig {
  return CURRENCIES[code.toUpperCase()] || CURRENCIES.USD;
}

/**
 * Formats a monetary number into a localized currency string.
 * Example: formatMoney(1234.5, 'USD') -> "$1,234.50"
 */
export function formatMoney(amount: number, currencyCode: string = 'USD'): string {
  const config = getCurrencyConfig(currencyCode);
  const safeAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (e) {
    // Fallback if locale/currency code fails in any environment
    return `${config.symbol}${safeAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Formats a raw number with thousand separators
 */
export function formatNumber(val: number, decimals = 2): string {
  const num = Number(val) || 0;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
