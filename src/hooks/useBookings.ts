import { useTableData } from '@/hooks/useTableData';
import { bookingApi } from '@/services/api';
import type { Booking } from '@/types';

export function useBookings() {
  return useTableData<Booking>({
    queryKey:         'bookings',
    fetchFn:          bookingApi.getList,
    defaultSortBy:    'checkInDate',
    defaultSortOrder: 'desc',
  });
}
