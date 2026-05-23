import { useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useUsers } from '@/hooks/useUsers';
import { userFilterConfig } from '@/constants/filterConfigs';
import ReusableTable from '@/components/shared/ReusableTable';
import ReusableFilter from '@/components/shared/ReusableFilter';
import { Avatar } from '@/components/shared/Avatar';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate } from '@/lib/utils';
import type { ColumnDef, User } from '@/types';

const columns: ColumnDef<User>[] = [
  {
    field:    'name',
    header:   'Name',
    sortable: true,
    body: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} />
        <span className="font-medium text-slate-800">{row.name}</span>
      </div>
    ),
  },
  {
    field:    'email',
    header:   'Email',
    sortable: true,
    body: (row) => <span className="text-indigo-600 font-medium">{row.email}</span>,
  },
  {
    field:  'phone',
    header: 'Phone',
    body:   (row) => <span className="text-slate-500">{row.phone ?? '—'}</span>,
  },
  {
    field:    'createdAt',
    header:   'Joined',
    sortable: true,
    body:     (row) => <span className="text-slate-500">{formatDate(row.createdAt)}</span>,
  },
];

export default function Users() {
  const toast = useRef<InstanceType<typeof Toast>>(null);

  const {
    data, pagination, isLoading, error,
    page, limit, sortBy, sortOrder,
    setPage, handleLimitChange, handleSort, applyFilters, clearFilters,
  } = useUsers();

  useEffect(() => {
    if (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    }
  }, [error]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toast ref={toast} />

      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage all registered users</p>
        </div>
        <StatCard label="Total" value={pagination.total} variant="indigo" />
      </div>

      <div className="flex-shrink-0">
        <ReusableFilter
          config={userFilterConfig}
          onApply={applyFilters}
          onClear={clearFilters}
          loading={isLoading}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ReusableTable<User>
          data={data}
          columns={columns}
          loading={isLoading}
          totalRecords={pagination.total}
          page={page}
          limit={limit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPage={setPage}
          onLimitChange={handleLimitChange}
          onSort={handleSort}
          emptyMessage="No users found."
        />
      </div>
    </div>
  );
}
