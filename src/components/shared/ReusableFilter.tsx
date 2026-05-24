import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { cn } from '@/lib/utils';
import type { FilterConfig } from '@/types';

interface Props {
  config: FilterConfig[];
  onApply: (values: Record<string, unknown>) => void;
  onClear: () => void;
  dynamicOptions?: Record<string, Array<Record<string, unknown>>>;
  loading?: boolean;
  extraActions?: React.ReactNode;
}

const emptyValues = (cfg: FilterConfig[]): Record<string, unknown> =>
  cfg.reduce((acc, f) => ({ ...acc, [f.field]: '' }), {});

export default function ReusableFilter({
  config,
  onApply,
  onClear,
  dynamicOptions = {},
  loading,
  extraActions,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues(config));

  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      const dep  = config.find((c) => (c as { dependsOn?: string }).dependsOn === field);
      if (dep) next[dep.field] = '';
      return next;
    });
  };

  const handleApply = () => onApply(values);

  const handleClear = () => {
    setValues(emptyValues(config));
    onClear();
  };

  const activeCount = Object.values(values).filter((v) => v !== '' && v != null).length;

  const renderField = (item: FilterConfig) => {
    if (item.type === 'text') {
      return (
        <div className="relative">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '0.75rem' }} />
          <input
            type="text"
            value={(values[item.field] as string) || ''}
            onChange={(e) => handleChange(item.field, e.target.value)}
            placeholder={item.placeholder ?? 'Search…'}
            className="w-full h-11 pl-8 pr-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none
              placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
          />
        </div>
      );
    }

    if (item.type === 'dropdown') {
      const rawOpts = item.options ?? (dynamicOptions[item.optionsKey ?? ''] ?? []);
      const opts = rawOpts.map((o) => {
        const record = o as Record<string, unknown>;
        return {
          label: String(record[item.optionLabel ?? 'label'] ?? ''),
          value: record[item.optionValue ?? 'value'],
        };
      });

      return (
        <div className="filter-dropdown">
          <Dropdown
            value={values[item.field] === '' ? null : values[item.field]}
            options={opts}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleChange(item.field, (e.value as unknown) ?? '')}
            placeholder={item.placeholder ?? 'All'}
            showClear
            appendTo={document.body}
            style={{ width: '100%' }}
          />
        </div>
      );
    }

    if (item.type === 'date') {
      return (
        <div className="filter-calendar">
          <Calendar
            value={(values[item.field] as Date | null) ?? null}
            onChange={(e) => handleChange(item.field, e.value)}
            placeholder="Select date"
            dateFormat="dd/mm/yy"
            showIcon
            appendTo={document.body}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <i className="pi pi-sliders-h text-slate-400" style={{ fontSize: '0.8rem' }} />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors duration-200"
          >
            <i className="pi pi-times" style={{ fontSize: '0.65rem' }} />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {config.map((item) => (
          <div
            key={item.field}
            className={cn(item.fullWidth ? 'flex-1 min-w-[200px]' : 'w-44 flex-shrink-0')}
          >
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {item.label}
            </label>
            {renderField(item)}
          </div>
        ))}

        <div className="flex items-end gap-2 ml-auto">
          <button
            onClick={handleApply}
            disabled={loading}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-all duration-200"
          >
            <i className="pi pi-check" style={{ fontSize: '0.75rem' }} />
            Apply
          </button>
          <button
            onClick={handleClear}
            className="h-11 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <i className="pi pi-refresh" style={{ fontSize: '0.75rem' }} />
            Reset
          </button>
          {extraActions}
        </div>
      </div>
    </div>
  );
}
