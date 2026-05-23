import { useMemo } from 'react';
import {
  teachersApi,
  ApiTeacher,
  ApiTeacherAssignment,
  ApiHomeroomAssignment,
  PaginatedResponse,
} from '../lib/api';
import { useApiQuery } from './useApiQuery';

export interface UseTeachersParams {
  branchId?: string | null;
  organizationId?: string | null;
  search?: string;
  page?: number;
}

export interface UseTeachersResult {
  teachers: ApiTeacher[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTeachers(params: UseTeachersParams): UseTeachersResult {
  const { branchId, organizationId, search, page } = params;

  const fetcher = useMemo(() => {
    if (!branchId && !organizationId) return null;
    return () =>
      teachersApi.list({
        branch: branchId ?? undefined,
        organization: organizationId ?? undefined,
        search: search ?? undefined,
        page: page ?? undefined,
      });
  }, [branchId, organizationId, search, page]);

  const { data, isLoading, error, refetch } =
    useApiQuery<PaginatedResponse<ApiTeacher>>(fetcher, [
      branchId,
      organizationId,
      search,
      page,
    ]);

  return {
    teachers: data?.results ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
    refetch,
  };
}

// ---------------------------------------------------------------------------
// Teacher assignments hook
// ---------------------------------------------------------------------------
export interface UseTeacherAssignmentsParams {
  teacherId?: string | null;
  sectionId?: string | null;
  academicYearId?: string | null;
  organizationId?: string | null;
}

export function useTeacherAssignments(
  params: UseTeacherAssignmentsParams,
): {
  assignments: ApiTeacherAssignment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { teacherId, sectionId, academicYearId, organizationId } = params;

  const fetcher = useMemo(() => {
    if (!teacherId && !sectionId && !organizationId) return null;
    return () =>
      teachersApi
        .listAssignments({
          teacher: teacherId ?? undefined,
          section: sectionId ?? undefined,
          academic_year: academicYearId ?? undefined,
          organization: organizationId ?? undefined,
        })
        .then((r) => r.results);
  }, [teacherId, sectionId, academicYearId, organizationId]);

  const { data, isLoading, error, refetch } = useApiQuery<ApiTeacherAssignment[]>(
    fetcher,
    [teacherId, sectionId, academicYearId, organizationId],
  );

  return { assignments: data ?? [], isLoading, error, refetch };
}

// ---------------------------------------------------------------------------
// Homeroom assignments hook
// ---------------------------------------------------------------------------
export function useHomeroomAssignments(params: {
  branchId?: string | null;
  organizationId?: string | null;
  academicYearId?: string | null;
}): {
  homeroomAssignments: ApiHomeroomAssignment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { branchId, organizationId, academicYearId } = params;

  const fetcher = useMemo(() => {
    if (!branchId && !organizationId) return null;
    return () =>
      teachersApi
        .listHomeroomAssignments({
          branch: branchId ?? undefined,
          organization: organizationId ?? undefined,
          academic_year: academicYearId ?? undefined,
        })
        .then((r) => r.results);
  }, [branchId, organizationId, academicYearId]);

  const { data, isLoading, error, refetch } = useApiQuery<ApiHomeroomAssignment[]>(
    fetcher,
    [branchId, organizationId, academicYearId],
  );

  return { homeroomAssignments: data ?? [], isLoading, error, refetch };
}
