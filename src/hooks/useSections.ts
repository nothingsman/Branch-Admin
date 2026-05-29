import { useMemo } from "react"
import { academiaApi, ApiSection } from "../lib/api"
import { useApiQuery } from "./useApiQuery"

export interface UseSectionsResult {
  sections: ApiSection[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSections(
  branchId: string | null,
  academicYearId?: string | null
): UseSectionsResult {
  const fetcher = useMemo(
    () =>
      branchId
        ? () => academiaApi.getSections(branchId, academicYearId ?? undefined)
        : null,
    [branchId, academicYearId]
  )

  const { data, isLoading, error, refetch } = useApiQuery<ApiSection[]>(
    fetcher,
    [branchId, academicYearId]
  )

  return {
    sections: data ?? [],
    isLoading,
    error,
    refetch,
  }
}
