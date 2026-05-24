import axios, { type AxiosRequestConfig } from 'axios';
import type { User, Hotel, Booking, State, City, ApiListResponse, ApiResponse } from '@/types';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
});

http.interceptors.response.use(
  (res) => res.data,
  (err: unknown) => {
    const message =
      axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

/** Typed GET helper — interceptor strips the AxiosResponse wrapper */
const get = <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
  http.get(url, { params } as AxiosRequestConfig) as unknown as Promise<T>;

// ── User API ─────────────────────────────────────────────
export const userApi = {
  getList: (params: Record<string, unknown>) =>
    get<ApiListResponse<User>>('/users/getUserList', params),
};

// ── Hotel API ────────────────────────────────────────────
export const hotelApi = {
  getList: (params: Record<string, unknown>) =>
    get<ApiListResponse<Hotel>>('/hotels/getHotelList', params),
};

// ── Booking API ──────────────────────────────────────────
export const bookingApi = {
  getList: (params: Record<string, unknown>) =>
    get<ApiListResponse<Booking>>('/bookings/getBookings', params),

  getBookedUsers: () =>
    get<ApiResponse<User[]>>('/bookings/getBookedUsers'),

  create: (body: {
    userId: string;
    hotelId: string;
    checkinDate: string;
    guestCount: number;
    requirements?: string;
  }) => http.post<ApiResponse<Booking>>('/bookings/createBooking', body) as unknown as Promise<ApiResponse<Booking>>,

  cancel: (bookingId: string) =>
    http.post<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`) as unknown as Promise<ApiResponse<Booking>>,

  download: (params: Record<string, unknown>) =>
    axios.get<Blob>(
      `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/bookings/getBookings`,
      { params: { ...params, download: true }, responseType: 'blob' },
    ),
};

// ── Location API ─────────────────────────────────────────
export const locationApi = {
  getStates: () =>
    get<ApiResponse<State[]>>('/state'),

  getCities: (stateId?: string) =>
    get<ApiResponse<City[]>>('/city', stateId ? { stateId } : undefined),
};
