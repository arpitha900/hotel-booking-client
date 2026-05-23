import { useRef, useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useBookings } from '@/hooks/useBookings';
import { bookingApi, hotelApi } from '@/services/api';
import { bookingFilterConfig } from '@/constants/filterConfigs';
import { BOOKING_STATUS_MAP } from '@/constants/status';
import ReusableTable from '@/components/shared/ReusableTable';
import ReusableFilter from '@/components/shared/ReusableFilter';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate, cn } from '@/lib/utils';
import type { Booking, BookingStatus, ColumnDef, Hotel, User } from '@/types';

// ── Column definitions (stable reference — defined outside component) ────────

const columns: ColumnDef<Booking>[] = [
  {
    field:  'userId',
    header: 'Guest Name',
    body: (row) => {
      const name = row.userId?.name ?? '—';
      return (
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <span className="font-medium text-slate-800">{name}</span>
        </div>
      );
    },
  },
  {
    field:  'hotelId',
    header: 'Hotel',
    body: (row) => (
      <div className="flex items-center gap-2">
        <i className="pi pi-building text-slate-300" style={{ fontSize: '0.78rem' }} />
        <span className="text-slate-600">{row.hotelId?.name ?? '—'}</span>
      </div>
    ),
  },
  {
    field:    'checkInDate',
    header:   'Check-in Date',
    sortable: true,
    body: (row) => (
      <div className="flex items-center gap-1.5">
        <i className="pi pi-calendar text-slate-300" style={{ fontSize: '0.72rem' }} />
        <span>{formatDate(row.checkInDate)}</span>
      </div>
    ),
  },
  {
    field:    'status',
    header:   'Status',
    sortable: true,
    body: (row) => {
      const meta = BOOKING_STATUS_MAP[row.status as BookingStatus];
      return <StatusBadge label={meta.label} severity={meta.severity} />;
    },
  },
];

// ── Booking detail modal sub-components ──────────────────────────────────────

function Section({ title, icon, children }: {
  title: string; icon: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
        <i className={cn('pi', icon, 'text-indigo-400')} style={{ fontSize: '0.8rem' }} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, accent = false }: {
  label: string; value?: string | number | null; accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-36 text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
      <span className={cn('text-sm', accent ? 'text-indigo-600 font-medium' : 'text-slate-700')}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function BookingDetails({ booking }: { booking: Booking }) {
  const meta = BOOKING_STATUS_MAP[booking.status as BookingStatus];
  return (
    <div className="space-y-5">
      <span className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold',
        meta.textColor, meta.bgColor, meta.borderColor,
      )}>
        <span className={cn('w-1.5 h-1.5 rounded-full', meta.dotColor)} />
        {meta.label}
      </span>

      <Section title="Guest Information" icon="pi-user">
        <Row label="Name"  value={booking.userId?.name} />
        <Row label="Email" value={booking.userId?.email} accent />
        <Row label="Phone" value={booking.userId?.phone} />
      </Section>

      <Section title="Hotel Information" icon="pi-building">
        <Row label="Hotel"    value={booking.hotelId?.name} />
        <Row label="Location" value={booking.hotelId?.location} />
        <Row label="City"     value={(booking.hotelId?.cityId as { name?: string } | null)?.name} />
      </Section>

      <Section title="Booking Details" icon="pi-calendar">
        <Row label="Check-in Date"    value={formatDate(booking.checkInDate)} />
        <Row label="Number of Guests" value={booking.numberOfGuests} />
        <Row label="Booked On"        value={formatDate(booking.bookingDate)} />
        <Row label="Special Requests" value={booking.specialRequests || 'None'} />
      </Section>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function Bookings() {
  const toast = useRef<InstanceType<typeof Toast>>(null);
  const [bookedUsers, setBookedUsers] = useState<User[]>([]);
  const [hotels, setHotels]           = useState<Hotel[]>([]);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [downloading, setDownloading] = useState(false);

  const {
    data, pagination, isLoading, error,
    page, limit, sortBy, sortOrder, filters,
    setPage, handleLimitChange, handleSort, applyFilters, clearFilters,
  } = useBookings();

  useEffect(() => {
    bookingApi.getBookedUsers().then((r) => setBookedUsers(r.data as User[])).catch(() => undefined);
    hotelApi.getList({ limit: 200 }).then((r) => setHotels(r.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    }
  }, [error]);

  const handleApply = (filters: Record<string, unknown>) => {
    const params = { ...filters };
    if (params.fromDate) params.fromDate = new Date(params.fromDate as string).toISOString();
    if (params.toDate)   params.toDate   = new Date(params.toDate as string).toISOString();
    applyFilters(params);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await bookingApi.download(filters);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = Object.assign(document.createElement('a'), {
        href: url, download: `bookings_${Date.now()}.xlsx`,
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.current?.show({ severity: 'success', summary: 'Exported', detail: 'Bookings exported successfully', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not export bookings', life: 3000 });
    } finally {
      setDownloading(false);
    }
  };

  const exportButton = (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-all duration-200"
    >
      {downloading
        ? <i className="pi pi-spin pi-spinner" style={{ fontSize: '0.75rem' }} />
        : <i className="pi pi-file-excel"       style={{ fontSize: '0.75rem' }} />}
      Export Excel
    </button>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toast ref={toast} />

      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bookings</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and manage all hotel bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <StatCard label="Total" value={pagination.total} variant="indigo" />
        </div>
      </div>

      <div className="flex-shrink-0">
        <ReusableFilter
          config={bookingFilterConfig}
          onApply={handleApply}
          onClear={clearFilters}
          loading={isLoading}
          dynamicOptions={{ bookedUsers, hotels }}
          extraActions={exportButton}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ReusableTable<Booking>
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
          actionTemplate={(row) => (
            <button
              onClick={() => setViewBooking(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <i className="pi pi-eye" style={{ fontSize: '0.7rem' }} />
              View
            </button>
          )}
          emptyMessage="No bookings found."
        />
      </div>

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <i className="pi pi-calendar text-indigo-600" style={{ fontSize: '0.85rem' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Booking Details</p>
              {viewBooking && (
                <p className="text-xs text-slate-400 font-normal mt-0.5">{viewBooking.userId?.name}</p>
              )}
            </div>
          </div>
        }
        visible={!!viewBooking}
        style={{ width: '520px' }}
        onHide={() => setViewBooking(null)}
        draggable={false}
        resizable={false}
      >
        {viewBooking && <BookingDetails booking={viewBooking} />}
      </Dialog>
    </div>
  );
}
