import { useMemo } from "react"
import {
  studentsApi,
  ApiStudent,
  PaginatedResponse,
  StudentStatus,
} from "../lib/api"
import { useApiQuery } from "./useApiQuery"

export interface UseStudentsParams {
  branchId?: string | null
  organizationId?: string | null
  sectionId?: string | null
  gradeId?: string | null
  academicYearId?: string | null
  status?: StudentStatus
  search?: string
  ordering?: string
  page?: number
}

export interface UseStudentsResult {
  students: ApiStudent[]
  count: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useStudents(params: UseStudentsParams): UseStudentsResult {
  const {
    branchId,
    organizationId,
    sectionId,
    gradeId,
    academicYearId,
    status,
    search,
    ordering,
    page,
  } = params

  const fetcher = useMemo(() => {
    // Need at least a branch or organization to scope the query
    if (!branchId && !organizationId) return null
    return () =>
      studentsApi.list({
        branch: branchId ?? undefined,
        organization: organizationId ?? undefined,
        section: sectionId ?? undefined,
        grade: gradeId ?? undefined,
        academic_year: academicYearId ?? undefined,
        status: status ?? undefined,
        search: search ?? undefined,
        ordering: ordering ?? undefined,
        page: page ?? undefined,
      })
  }, [
    branchId,
    organizationId,
    sectionId,
    gradeId,
    academicYearId,
    status,
    search,
    ordering,
    page,
  ])

  const { data, isLoading, error, refetch } = useApiQuery<
    PaginatedResponse<ApiStudent>
  >(fetcher, [
    branchId,
    organizationId,
    sectionId,
    gradeId,
    academicYearId,
    status,
    search,
    ordering,
    page,
  ])

  return {
    students: data?.results ?? [],
    count: data?.count ?? 0,
    hasNextPage: data?.next != null,
    hasPreviousPage: data?.previous != null,
    isLoading,
    error,
    refetch,
  }
}
