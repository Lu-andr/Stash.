import { localStore } from '../data/repository';
import { CURRENCIES, type Currency } from '../data/domain';
export function formatMoney(value: number | string | null | undefined, decimals = 2, currency: string = localStore.getSnapshot().settings.currency): string {
  const amount = Number(value ?? 0);
  const symbol = CURRENCIES.find(c => c.value === currency)?.symbol ?? currency + ' ';
  const number = Number.isFinite(amount) ? amount : 0;
  const formatted = Math.abs(number).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (number < 0 ? '−' : '') + symbol + formatted;
}
export const formatCurrency = (amount: number, currency?: string) => formatMoney(amount, 2, currency);
export const formatCurrencyFull = (amount: number, currency?: string) => formatMoney(amount, 2, currency);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() === today.getTime()) return 'Today';
  if (txDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatDateFull = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatMonthYear = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatDaysUntil = (days: number): string => {
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 0) return 'Overdue';
  return `Due in ${days} days`;
};

export const getPaymentMethodLabel = (method?: string): string => {
  const methods: Record<string, string> = {
    cash: 'Cash',
    other: 'Other',
  };
  return methods[method || ''] || method || '';
};
