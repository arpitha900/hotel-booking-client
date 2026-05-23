import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ColumnDef, SortOrder } from '@/types';

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  totalRecords?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  onPage?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSort?: (field: string) => void;
  actionTemplate?: (row: T) => ReactNode;
  emptyMessage?: string;
}

const SKELETON_ROWS = 7;

const SortIcon = memo(function SortIcon({
  field, sortBy, sortOrder,
}: { field: string; sortBy?: string; sortOrder?: SortOrder }) {
  const active = sortBy === field;
  return (
    <span className="inline-flex flex-col gap-[2px] ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
      <i className="pi pi-chevron-up"   style={{ fontSize: '0.5rem', color: active && sortOrder === 'asc'  ? '#4f46e5' : '#94a3b8' }} />
      <i className="pi pi-chevron-down" style={{ fontSize: '0.5rem', color: active && sortOrder === 'desc' ? '#4f46e5' : '#94a3b8' }} />
    </span>
  );
});

function buildPageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (page > 3)                pages.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2)   pages.push('…');
  pages.push(totalPages);
  return pages;
}

function ReusableTableInner<T extends { _id?: string }>({
  data,
  columns,
  loading,
  totalRecords = 0,
  page = 1,
  limit = 10,
  sortBy,
  sortOrder,
  onPage,
  onLimitChange,
  onSort,
  actionTemplate,
  emptyMessage = 'No records found.',
}: Props<T>) {
  const totalPages  = Math.ceil(totalRecords / limit);
  const from        = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const to          = Math.min(page * limit, totalRecords);
  const colCount    = columns.length + (actionTemplate ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full text-sm">

          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable && onSort?.(col.field)}
                  style={{ width: col.width }}
                  className={cn(
                    'px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none',
                    col.sortable && 'cursor-pointer group hover:text-slate-700 hover:bg-slate-100 transition-colors',
                  )}
                >
                  <span className="flex items-center">
                    {col.header}
                    {col.sortable && <SortIcon field={col.field} sortBy={sortBy} sortOrder={sortOrder} />}
                  </span>
                </th>
              ))}
              {actionTemplate && (
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.field} className="px-5 py-3.5">
                      <div className="h-4 bg-slate-100 rounded-md" style={{ width: `${55 + (i * col.field.length) % 35}%` }} />
                    </td>
                  ))}
                  {actionTemplate && (
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-8 bg-slate-100 rounded-md ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <i className="pi pi-inbox text-slate-400" style={{ fontSize: '1.25rem' }} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={(row as Record<string, unknown>)._id as string ?? idx} className="hover:bg-slate-50/60 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      className={cn(
                        'px-5 py-3.5 text-slate-700',
                        col.align === 'right'  && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.body
                        ? col.body(row)
                        : String((row as Record<string, unknown>)[col.field] ?? '—')}
                    </td>
                  ))}
                  {actionTemplate && (
                    <td className="px-5 py-3.5 text-right">{actionTemplate(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalRecords > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
              <span className="font-medium text-slate-700">{totalRecords}</span>
            </span>
            <select
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white outline-none hover:border-slate-300 focus:border-indigo-400 cursor-pointer"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {(['double-left', 'left'] as const).map((icon, i) => (
              <button
                key={icon}
                onClick={() => onPage?.(i === 0 ? 1 : page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className={`pi pi-angle-${icon === 'double-left' ? 'double-left' : 'left'}`} style={{ fontSize: '0.75rem' }} />
              </button>
            ))}

            {buildPageNumbers(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPage?.(p as number)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                    p === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {p}
                </button>
              ),
            )}

            {(['right', 'double-right'] as const).map((icon, i) => (
              <button
                key={icon}
                onClick={() => onPage?.(i === 0 ? page + 1 : totalPages)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className={`pi pi-angle-${icon === 'double-right' ? 'double-right' : 'right'}`} style={{ fontSize: '0.75rem' }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReusableTableInner as typeof ReusableTableInner;
