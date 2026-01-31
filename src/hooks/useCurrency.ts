import { useSettings } from '@/contexts/SettingsContext';
import { useCallback } from 'react';

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JOD: 'JD',
  AED: 'AED',
  SAR: 'SAR',
  EGP: 'E£',
  KWD: 'KD',
  QAR: 'QR',
  BHD: 'BD',
  OMR: 'OMR',
  LBP: 'L£',
  IQD: 'IQD',
  SYP: 'S£',
  TRY: '₺',
  INR: '₹',
  PKR: '₨',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  CAD: 'C$',
  AUD: 'A$',
};

export const useCurrency = () => {
  const { settings } = useSettings();
  
  const formatCurrency = useCallback((amount: number): string => {
    const symbol = currencySymbols[settings.currency] || settings.currency;
    return `${symbol}${amount.toFixed(2)}`;
  }, [settings.currency]);
  
  const getCurrencySymbol = useCallback((): string => {
    return currencySymbols[settings.currency] || settings.currency;
  }, [settings.currency]);
  
  return {
    formatCurrency,
    getCurrencySymbol,
    currency: settings.currency,
  };
};
