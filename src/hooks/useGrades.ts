import { useMemo } from 'react';
import { academiaApi, ApiGrade } from '../lib/api';
import { useApiQuery } from './useApiQuery';

export interface UseGradesResult {
  grades: ApiGrade[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGrades(branchId: string | null): UseGradesResult {
  const fetcher = useMemo(
    () => (branchId ? () => academiaApi.getGrades(branchId) : null),
    [branchId],
  );

  const { data, isLoading, error, refetch } = useApiQuery<ApiGrade[]>(
    fetcher,
    [branchId],
  );

  return {
    grades: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
