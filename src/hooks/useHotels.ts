import { useTableData } from '@/hooks/useTableData';
import { hotelApi } from '@/services/api';
import type { Hotel } from '@/types';

export function useHotels() {
  return useTableData<Hotel>({
    queryKey:         'hotels',
    fetchFn:          hotelApi.getList,
    defaultSortBy:    'name',
    defaultSortOrder: 'asc',
  });
}
