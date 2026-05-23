import { useTableData } from '@/hooks/useTableData';
import { userApi } from '@/services/api';
import type { User } from '@/types';

export function useUsers() {
  return useTableData<User>({
    queryKey:         'users',
    fetchFn:          userApi.getList,
    defaultSortBy:    'name',
    defaultSortOrder: 'asc',
  });
}
