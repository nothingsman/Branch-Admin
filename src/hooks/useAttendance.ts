import { useMemo } from 'react';
import {
  attendanceApi,
  ApiDailyAttendanceStatus,
  ApiAttendanceSummary,
  PaginatedResponse,
} from '../lib/api';
import { useApiQuery } from './useApiQuery';

// ---------------------------------------------------------------------------
// Daily status per section (used by AttendanceDashboard logs tab)
// ---------------------------------------------------------------------------
export interface UseDailyAttendanceStatusParams {
  branchId?: string | null;
  organizationId?: string | null;
  academicYearId?: string | null;
  date?: string | null;
}

export function useDailyAttendanceStatus(
  params: UseDailyAttendanceStatusParams,
): {
  statuses: ApiDailyAttendanceStatus[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { branchId, organizationId, academicYearId, date } = params;

  const fetcher = useMemo(() => {
    if (!branchId && !organizationId) return null;
    return () =>
      attendanceApi.dailyStatus({
        branch: branchId ?? undefined,
        organization: organizationId ?? undefined,
        academic_year: academicYearId ?? undefined,
        date: date ?? undefined,
      });
  }, [branchId, organizationId, academicYearId, date]);

  const { data, isLoading, error, refetch } = useApiQuery<
    ApiDailyAttendanceStatus[]
  >(fetcher, [branchId, organizationId, academicYearId, date]);

  return { statuses: data ?? [], isLoading, error, refetch };
}

// ---------------------------------------------------------------------------
// Attendance summaries (used by AttendanceDashboard overview / chronic tabs)
// ---------------------------------------------------------------------------
export interface UseAttendanceSummariesParams {
  organizationId?: string | null;
  academicYearId?: string | null;
}

export function useAttendanceSummaries(
  params: UseAttendanceSummariesParams,
): {
  summaries: ApiAttendanceSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { organizationId, academicYearId } = params;

  const fetcher = useMemo(() => {
    if (!organizationId) return null;
    return () =>
      attendanceApi
        .summaries({
          organization: organizationId ?? undefined,
          academic_year: academicYearId ?? undefined,
        })
        .then((r: PaginatedResponse<ApiAttendanceSummary>) => r.results);
  }, [organizationId, academicYearId]);

  const { data, isLoading, error, refetch } = useApiQuery<ApiAttendanceSummary[]>(
    fetcher,
    [organizationId, academicYearId],
  );

  return { summaries: data ?? [], isLoading, error, refetch };
}
