import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ApiListResponse, PaginationMeta, SortOrder } from '@/types';

const DEFAULT_PAGINATION: PaginationMeta = {
  total: 0, page: 1, limit: 10, totalPages: 0,
};

interface Options<T> {
  queryKey: string;
  fetchFn: (params: Record<string, unknown>) => Promise<ApiListResponse<T>>;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
}

export function useTableData<T>({
  queryKey,
  fetchFn,
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
}: Options<T>) {
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [sortBy, setSortBy]     = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [filters, setFilters]   = useState<Record<string, unknown>>({});

  const params: Record<string, unknown> = {
    page, limit, sortBy, sortOrder, ...filters,
  };

  const { data: response, isLoading, error } = useQuery<ApiListResponse<T>, Error>({
    queryKey: [queryKey, params],
    queryFn:  () => fetchFn(params),
    placeholderData: keepPreviousData,
  });

  const applyFilters = useCallback((vals: Record<string, unknown>) => {
    setFilters(vals);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    setSortOrder((prev) => (sortBy === field && prev === 'asc' ? 'desc' : 'asc'));
    setSortBy(field);
    setPage(1);
  }, [sortBy]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    data:       response?.data       ?? ([] as T[]),
    pagination: response?.pagination ?? DEFAULT_PAGINATION,
    isLoading,
    error:      error?.message ?? null,
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    setPage,
    handleLimitChange,
    applyFilters,
    clearFilters,
    handleSort,
  };
}
