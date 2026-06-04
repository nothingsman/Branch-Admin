import { useMemo } from "react"
import { useApiQuery } from "./useApiQuery"
import {
  branchesApi,
  BranchAnalyticsResponse,
  BranchTopPerformanceRiskStudent,
  studentsApi,
  ApiStudent,
} from "../lib/api"

interface BranchDashboardPayload {
  analytics: BranchAnalyticsResponse
  topRisks: BranchTopPerformanceRiskStudent[]
  activeStudents: ApiStudent[]
}

export interface UseBranchDashboardResult {
  data: BranchAnalyticsResponse | null
  topRisks: BranchTopPerformanceRiskStudent[]
  unlinkedStudents: ApiStudent[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

async function fetchAllActiveStudents(branchId: string): Promise<ApiStudent[]> {
  const students: ApiStudent[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await studentsApi.list({
      branch: branchId,
      status: "ACTIVE",
      page,
    })

    students.push(...(response.results ?? []))
    hasNextPage = response.next != null
    page += 1
  }

  return students
}

export function useBranchDashboard(
  branchId: string | null
): UseBranchDashboardResult {
  const fetcher = useMemo(() => {
    if (!branchId) return null

    return async (): Promise<BranchDashboardPayload> => {
      const [analytics, topRisks, activeStudents] = await Promise.all([
        branchesApi.getAnalytics(branchId),
        branchesApi.getTopPerformanceRisks(branchId),
        fetchAllActiveStudents(branchId),
      ])

      return {
        analytics,
        topRisks,
        activeStudents,
      }
    }
  }, [branchId])

  const { data, isLoading, error, refetch } =
    useApiQuery<BranchDashboardPayload>(fetcher, [branchId])

  const unlinkedStudents = useMemo(() => {
    return (data?.activeStudents ?? []).filter(
      (student) => (student.parent_details?.length ?? 0) === 0
    )
  }, [data])

  return {
    data: data?.analytics ?? null,
    topRisks: data?.topRisks ?? [],
    unlinkedStudents,
    isLoading,
    error,
    refetch,
  }
}
