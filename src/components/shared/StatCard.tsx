import { memo } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky';

interface StatCardProps {
  label: string;
  value: number;
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, { color: string; bg: string; border: string }> = {
  indigo:  { color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100'  },
  emerald: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  rose:    { color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100'    },
  amber:   { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  sky:     { color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-100'     },
};

export const StatCard = memo(function StatCard({ label, value, variant = 'indigo' }: StatCardProps) {
  const { color, bg, border } = VARIANT_STYLES[variant];
  return (
    <div className={cn(bg, 'border', border, 'rounded-xl px-5 py-3 text-center min-w-[80px]')}>
      <div className={cn('text-xl font-bold leading-none', color)}>{value}</div>
      <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
});
