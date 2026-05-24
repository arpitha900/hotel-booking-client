import { useRef, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { useBookings } from '@/hooks/useBookings';
import { bookingApi, hotelApi, userApi } from '@/services/api';
import { bookingFilterConfig } from '@/constants/filterConfigs';
import { BOOKING_STATUS_MAP } from '@/constants/status';
import ReusableTable from '@/components/shared/ReusableTable';
import ReusableFilter from '@/components/shared/ReusableFilter';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate, cn } from '@/lib/utils';
import type { Booking, BookingStatus, ColumnDef, Hotel, User } from '@/types';

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

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
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

function Row({ label, value, accent = false }: { label: string; value?: string | number | null; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-36 text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
      <span className={cn('text-sm', accent ? 'text-indigo-600 font-medium' : 'text-slate-700')}>{value ?? '—'}</span>
    </div>
  );
}

function BookingDetails({ booking, onCancel, cancelling }: {
  booking: Booking;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const meta = BOOKING_STATUS_MAP[booking.status as BookingStatus];
  const canCancel = booking.status === 0 || booking.status === 3;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold',
          meta.textColor, meta.bgColor, meta.borderColor,
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', meta.dotColor)} />
          {meta.label}
        </span>
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-60"
          >
            {cancelling
              ? <i className="pi pi-spin pi-spinner" style={{ fontSize: '0.7rem' }} />
              : <i className="pi pi-times-circle" style={{ fontSize: '0.7rem' }} />}
            Cancel Booking
          </button>
        )}
      </div>

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

const EMPTY_FORM = { userId: '', hotelId: '', checkinDate: null as Date | null, guestCount: 1, requirements: '' };

export default function Bookings() {
  const queryClient = useQueryClient();
  const toast = useRef<InstanceType<typeof Toast>>(null);
  const [bookedUsers, setBookedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers]       = useState<User[]>([]);
  const [hotels, setHotels]           = useState<Hotel[]>([]);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling]   = useState(false);

  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);

  const {
    data, pagination, isLoading, error,
    page, limit, sortBy, sortOrder, filters,
    setPage, handleLimitChange, handleSort, applyFilters, clearFilters,
  } = useBookings();

  useEffect(() => {
    bookingApi.getBookedUsers().then((r) => setBookedUsers(r.data as User[])).catch(() => undefined);
    hotelApi.getList({ limit: 200 }).then((r) => setHotels(r.data)).catch(() => undefined);
    userApi.getList({ limit: 200 }).then((r) => setAllUsers(r.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (error) toast.current?.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
  }, [error]);

  const handleApply = (f: Record<string, unknown>) => {
    const params = { ...f };
    if (params.fromDate) params.fromDate = new Date(params.fromDate as string).toISOString();
    if (params.toDate)   params.toDate   = new Date(params.toDate as string).toISOString();
    applyFilters(params);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await bookingApi.download(filters);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = Object.assign(document.createElement('a'), { href: url, download: `bookings_${Date.now()}.xlsx` });
      a.click();
      URL.revokeObjectURL(url);
      toast.current?.show({ severity: 'success', summary: 'Exported', detail: 'Bookings exported successfully', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not export bookings', life: 3000 });
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!viewBooking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(viewBooking._id);
      toast.current?.show({ severity: 'success', summary: 'Cancelled', detail: 'Booking cancelled successfully', life: 3000 });
      setViewBooking(null);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not cancel booking';
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: msg, life: 3000 });
    } finally {
      setCancelling(false);
    }
  };

  const handleCreate = async () => {
    if (!form.userId || !form.hotelId || !form.checkinDate) {
      toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Please fill all required fields', life: 3000 });
      return;
    }
    setSubmitting(true);
    try {
      await bookingApi.create({
        userId:      form.userId,
        hotelId:     form.hotelId,
        checkinDate: form.checkinDate.toISOString(),
        guestCount:  form.guestCount,
        requirements: form.requirements || undefined,
      });
      toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Booking created successfully', life: 3000 });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create booking';
      toast.current?.show({ severity: 'error', summary: 'Failed', detail: msg, life: 3000 });
    } finally {
      setSubmitting(false);
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
          <button
            onClick={() => setShowCreate(true)}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-all duration-200"
          >
            <i className="pi pi-plus" style={{ fontSize: '0.75rem' }} />
            New Booking
          </button>
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

      {/* View Booking Modal */}
      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <i className="pi pi-calendar text-indigo-600" style={{ fontSize: '0.85rem' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Booking Details</p>
              {viewBooking && <p className="text-xs text-slate-400 font-normal mt-0.5">{viewBooking.userId?.name}</p>}
            </div>
          </div>
        }
        visible={!!viewBooking}
        style={{ width: '520px' }}
        onHide={() => { setViewBooking(null); setCancelling(false); }}
        draggable={false}
        resizable={false}
      >
        {viewBooking && (
          <BookingDetails
            booking={viewBooking}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        )}
      </Dialog>

      {/* Create Booking Modal */}
      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i className="pi pi-calendar-plus text-indigo-600" style={{ fontSize: '1rem' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 leading-tight">New Booking</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Fill in the details to create a reservation</p>
            </div>
          </div>
        }
        visible={showCreate}
        style={{ width: '560px' }}
        onHide={() => { setShowCreate(false); setForm(EMPTY_FORM); }}
        draggable={false}
        resizable={false}
      >
        <div className="space-y-5 pt-1">

          {/* Guest */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Guest <span className="text-rose-400">*</span>
            </label>
            <div className="filter-dropdown">
              <Dropdown
                value={form.userId || null}
                options={allUsers.map(u => ({ label: u.name, value: u._id }))}
                onChange={(e) => setForm(f => ({ ...f, userId: e.value ?? '' }))}
                placeholder="Search and select a guest..."
                filter
                showClear
                appendTo={document.body}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Hotel */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Hotel <span className="text-rose-400">*</span>
            </label>
            <div className="filter-dropdown">
              <Dropdown
                value={form.hotelId || null}
                options={hotels.filter(h => h.isActive).map(h => ({ label: h.name, value: h._id }))}
                onChange={(e) => setForm(f => ({ ...f, hotelId: e.value ?? '' }))}
                placeholder="Search and select a hotel..."
                filter
                showClear
                appendTo={document.body}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Check-in Date + Guest Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Check-in Date <span className="text-rose-400">*</span>
              </label>
              <div className="filter-calendar">
                <Calendar
                  value={form.checkinDate}
                  onChange={(e) => setForm(f => ({ ...f, checkinDate: e.value as Date | null }))}
                  placeholder="dd/mm/yyyy"
                  dateFormat="dd/mm/yy"
                  minDate={new Date()}
                  showIcon
                  appendTo={document.body}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                No. of Guests <span className="text-rose-400">*</span>
              </label>
              <div className="modal-inputnumber">
                <InputNumber
                  value={form.guestCount}
                  onValueChange={(e) => setForm(f => ({ ...f, guestCount: e.value ?? 1 }))}
                  min={1}
                  max={20}
                  showButtons
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Special Requests <span className="normal-case font-normal text-slate-400 ml-1">— optional</span>
              </label>
              <span className="text-xs text-slate-400">{form.requirements.length}/500</span>
            </div>
            <div className="modal-textarea">
              <InputTextarea
                value={form.requirements}
                onChange={(e) => setForm(f => ({ ...f, requirements: e.target.value }))}
                placeholder="Any special requirements, preferences, or notes..."
                rows={3}
                maxLength={500}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}
              className="h-11 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all duration-150"
            >
              {submitting
                ? <><i className="pi pi-spin pi-spinner" style={{ fontSize: '0.75rem' }} /> Creating...</>
                : <><i className="pi pi-check" style={{ fontSize: '0.75rem' }} /> Confirm Booking</>}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
