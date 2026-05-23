import { memo } from 'react';
import { cn } from '@/lib/utils';

type Severity = 'success' | 'danger' | 'info' | 'warning';

interface StatusBadgeProps {
  label: string;
  severity: Severity;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger:  'bg-rose-50    text-rose-700    border-rose-200',
  info:    'bg-sky-50     text-sky-700     border-sky-200',
  warning: 'bg-amber-50   text-amber-700   border-amber-200',
};

export const StatusBadge = memo(function StatusBadge({ label, severity }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium',
        SEVERITY_STYLES[severity],
      )}
    >
      {label}
    </span>
  );
});
