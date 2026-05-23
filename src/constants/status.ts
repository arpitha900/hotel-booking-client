import type { BookingStatus } from '@/types';

interface BookingStatusMeta {
  label: string;
  severity: 'success' | 'danger' | 'info';
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export const BOOKING_STATUS_MAP: Record<BookingStatus, BookingStatusMeta> = {
  0: {
    label:       'Confirmed',
    severity:    'success',
    dotColor:    'bg-emerald-500',
    textColor:   'text-emerald-700',
    bgColor:     'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  1: {
    label:       'Cancelled',
    severity:    'danger',
    dotColor:    'bg-rose-500',
    textColor:   'text-rose-700',
    bgColor:     'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  2: {
    label:       'Completed',
    severity:    'info',
    dotColor:    'bg-sky-500',
    textColor:   'text-sky-700',
    bgColor:     'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  3: {
    label:       'Pending',
    severity:    'warning',
    dotColor:    'bg-amber-400',
    textColor:   'text-amber-700',
    bgColor:     'bg-amber-50',
    borderColor: 'border-amber-200',
  },
};
