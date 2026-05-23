import { useRef, useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useHotels } from '@/hooks/useHotels';
import { locationApi } from '@/services/api';
import { hotelFilterConfig } from '@/constants/filterConfigs';
import ReusableTable from '@/components/shared/ReusableTable';
import ReusableFilter from '@/components/shared/ReusableFilter';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import type { City, ColumnDef, Hotel, State } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={s <= rating ? 'pi pi-star-fill' : 'pi pi-star'}
          style={{ fontSize: '0.7rem', color: s <= rating ? '#f59e0b' : '#e2e8f0' }}
        />
      ))}
    </div>
  );
}

const columns: ColumnDef<Hotel>[] = [
  {
    field:  'name',
    header: 'Hotel Name',
    body: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <i className="pi pi-building text-sky-500" style={{ fontSize: '0.8rem' }} />
        </div>
        <span className="font-medium text-slate-800">{row.name}</span>
      </div>
    ),
  },
  {
    field:  'location',
    header: 'Location',
    body: (row) => (
      <span className="text-slate-500 text-sm">
        <i className="pi pi-map-marker mr-1 text-slate-300" style={{ fontSize: '0.7rem' }} />
        {row.location}
      </span>
    ),
  },
  {
    field:  'cityId',
    header: 'City',
    body: (row) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
        {row.cityId?.name ?? '—'}
      </span>
    ),
  },
  {
    field:  'pricePerNight',
    header: 'Price / Night',
    body:   (row) => (
      <span className="font-medium text-slate-800">
        ₹{row.pricePerNight?.toLocaleString('en-IN') ?? '—'}
      </span>
    ),
  },
  {
    field:  'rating',
    header: 'Rating',
    body:   (row) => <StarRating rating={row.rating} />,
  },
  {
    field:  'isActive',
    header: 'Status',
    body:   (row) => (
      <StatusBadge
        label={row.isActive ? 'Active' : 'Inactive'}
        severity={row.isActive ? 'success' : 'danger'}
      />
    ),
  },
];

export default function Hotels() {
  const toast  = useRef<InstanceType<typeof Toast>>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const {
    data, pagination, isLoading, error,
    page, limit, sortBy, sortOrder,
    setPage, handleLimitChange, handleSort, applyFilters, clearFilters,
  } = useHotels();

  useEffect(() => {
    locationApi.getStates().then((r) => setStates(r.data)).catch(() => undefined);
    locationApi.getCities().then((r) => setCities(r.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    }
  }, [error]);

  const handleApply = async (filters: Record<string, unknown>) => {
    if (filters.stateId) {
      const res = await locationApi.getCities(String(filters.stateId)).catch(() => ({ data: [] as City[] }));
      setCities(res.data);
    } else {
      locationApi.getCities().then((r) => setCities(r.data)).catch(() => undefined);
    }
    applyFilters(filters);
  };

  const handleClear = () => {
    locationApi.getCities().then((r) => setCities(r.data)).catch(() => undefined);
    clearFilters();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toast ref={toast} />

      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hotels</h2>
          <p className="text-sm text-slate-500 mt-0.5">Browse and manage hotel properties</p>
        </div>
        <div className="flex items-center gap-3">
          <StatCard label="Total" value={pagination.total} variant="indigo" />
        </div>
      </div>

      <div className="flex-shrink-0">
        <ReusableFilter
          config={hotelFilterConfig}
          onApply={handleApply}
          onClear={handleClear}
          loading={isLoading}
          dynamicOptions={{ states, cities }}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ReusableTable<Hotel>
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
          emptyMessage="No hotels found."
        />
      </div>
    </div>
  );
}
