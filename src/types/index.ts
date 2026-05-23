// ── Domain models ────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface State {
  _id: string;
  name: string;
}

export interface City {
  _id: string;
  name: string;
  stateId?: string;
}

export interface Hotel {
  _id: string;
  name: string;
  location: string;
  cityId: City | null;
  stateId: State | null;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  isActive: boolean;
}

export type BookingStatus = 0 | 1 | 2 | 3; // 0=Confirmed 1=Cancelled 2=Completed 3=Pending

export interface Booking {
  _id: string;
  userId: User | null;
  hotelId: Hotel | null;
  checkInDate: string;
  bookingDate: string;
  numberOfGuests: number;
  status: BookingStatus;
  specialRequests?: string;
}

// ── API response shapes ───────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Filter config types ───────────────────────────────────

interface BaseFilterConfig {
  field: string;
  label: string;
  fullWidth?: boolean;
}

export interface TextFilterConfig extends BaseFilterConfig {
  type: 'text';
  placeholder?: string;
}

export interface DropdownFilterConfig extends BaseFilterConfig {
  type: 'dropdown';
  options?: Array<{ label: string; value: string | number }>;
  optionsKey?: string;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  dependsOn?: string;
}

export interface DateFilterConfig extends BaseFilterConfig {
  type: 'date';
}

export type FilterConfig = TextFilterConfig | DropdownFilterConfig | DateFilterConfig;

// ── Table column definition ───────────────────────────────

export interface ColumnDef<T = Record<string, unknown>> {
  field: string;
  header: string;
  sortable?: boolean;
  body?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// ── Sort state ────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc';

export interface SortState {
  sortBy: string;
  sortOrder: SortOrder;
}
