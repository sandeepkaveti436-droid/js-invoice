import { format, parseISO, isValid } from 'date-fns';
import { InvoiceStatus, QuoteStatus } from '../types';

export function formatDate(dateString?: string, formatStr = 'MMM dd, yyyy'): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return dateString;
    return format(d, formatStr);
  } catch (err) {
    return dateString;
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateAfterDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function generateInvoiceNumber(prefix = 'INV-2026-', sequence = 1): string {
  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

export function generateQuoteNumber(prefix = 'EST-2026-', sequence = 1): string {
  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

export interface StatusStyle {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getInvoiceStatusStyle(status: InvoiceStatus, dueDate?: string): StatusStyle {
  // Check if overdue
  if (status === 'sent' || status === 'partially_paid') {
    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return {
          label: 'Overdue',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
        };
      }
    }
  }

  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'partially_paid':
      return {
        label: 'Partially Paid',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'sent':
      return {
        label: 'Sent',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'draft':
      return {
        label: 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
        dotClass: 'bg-zinc-400',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getQuoteStatusStyle(status: QuoteStatus): StatusStyle {
  switch (status) {
    case 'accepted':
    case 'converted':
      return {
        label: status === 'converted' ? 'Converted' : 'Accepted',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'sent':
      return {
        label: 'Sent',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'declined':
      return {
        label: 'Declined',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
