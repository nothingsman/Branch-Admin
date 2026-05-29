import { useMemo } from "react"
import { parentsApi, ApiParent, PaginatedResponse } from "../lib/api"
import { useApiQuery } from "./useApiQuery"

export interface UseParentsParams {
  branchId?: string | null
  organizationId?: string | null
  search?: string
  page?: number
}

export interface UseParentsResult {
  parents: ApiParent[]
  count: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useParents(params: UseParentsParams): UseParentsResult {
  const { branchId, organizationId, search, page } = params

  const fetcher = useMemo(() => {
    if (!branchId && !organizationId) return null
    return () =>
      parentsApi.list({
        branch: branchId ?? undefined,
        organization: organizationId ?? undefined,
        search: search ?? undefined,
        page: page ?? undefined,
      })
  }, [branchId, organizationId, search, page])

  const { data, isLoading, error, refetch } = useApiQuery<
    PaginatedResponse<ApiParent>
  >(fetcher, [branchId, organizationId, search, page])

  return {
    parents: data?.results ?? [],
    count: data?.count ?? 0,
    hasNextPage: data?.next != null,
    hasPreviousPage: data?.previous != null,
    isLoading,
    error,
    refetch,
  }
}
