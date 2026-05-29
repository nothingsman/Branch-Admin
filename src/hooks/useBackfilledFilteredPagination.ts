import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { extractApiError, PaginatedResponse } from "../lib/api"

interface UseBackfilledFilteredPaginationParams<T> {
  fetchPage: ((page: number) => Promise<PaginatedResponse<T>>) | null
  currentPage: number
  deps?: unknown[]
  filterFn?: (item: T) => boolean
  sortFn?: (left: T, right: T) => number
  fallbackPageSize?: number
}

interface BackfilledFilteredPaginationState<T> {
  items: T[]
  totalSourceCount: number
  totalFilteredCount: number | null
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  error: string | null
  isPageOutOfRange: boolean
}

export interface UseBackfilledFilteredPaginationResult<T>
  extends BackfilledFilteredPaginationState<T> {
  refetch: () => void
}

const defaultState = <T,>(
  fallbackPageSize: number
): BackfilledFilteredPaginationState<T> => ({
  items: [],
  totalSourceCount: 0,
  totalFilteredCount: null,
  pageSize: fallbackPageSize,
  hasNextPage: false,
  hasPreviousPage: false,
  isLoading: false,
  error: null,
  isPageOutOfRange: false,
})

export function useBackfilledFilteredPagination<T>({
  fetchPage,
  currentPage,
  deps = [],
  filterFn,
  sortFn,
  fallbackPageSize = 10,
}: UseBackfilledFilteredPaginationParams<T>): UseBackfilledFilteredPaginationResult<T> {
  const [state, setState] = useState<BackfilledFilteredPaginationState<T>>(
    () => defaultState(fallbackPageSize)
  )
  const [tick, setTick] = useState(0)
  const fetchPageRef = useRef(fetchPage)
  const filterFnRef = useRef(filterFn)
  const sortFnRef = useRef(sortFn)

  fetchPageRef.current = fetchPage
  filterFnRef.current = filterFn
  sortFnRef.current = sortFn

  useEffect(() => {
    if (!fetchPageRef.current) {
      setState(defaultState(fallbackPageSize))
      return
    }

    let cancelled = false

    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
      isPageOutOfRange: false,
    }))

    const run = async () => {
      try {
        const acceptedItems: T[] = []
        let sourcePage = 1
        let sourcePageSize = fallbackPageSize
        let totalSourceCount = 0
        let hasMoreSourcePages = true
        const requiresCompleteSourceSet =
          typeof filterFnRef.current === "function" ||
          typeof sortFnRef.current === "function"

        while (true) {
          const response = await fetchPageRef.current!(sourcePage)

          if (sourcePage === 1) {
            totalSourceCount = response.count
            sourcePageSize =
              response.results.length > 0
                ? response.results.length
                : fallbackPageSize
          }

          const matches = filterFnRef.current
            ? response.results.filter(filterFnRef.current)
            : response.results
          acceptedItems.push(...matches)

          hasMoreSourcePages = response.next != null

          if (requiresCompleteSourceSet) {
            if (!hasMoreSourcePages) {
              break
            }

            sourcePage += 1
            continue
          }

          const minimumBufferedItems = currentPage * sourcePageSize + 1
          if (
            acceptedItems.length >= minimumBufferedItems ||
            !hasMoreSourcePages
          ) {
            break
          }

          sourcePage += 1
        }

        const orderedItems = sortFnRef.current
          ? [...acceptedItems].sort(sortFnRef.current)
          : acceptedItems
        const startIndex = (currentPage - 1) * sourcePageSize
        const endIndex = startIndex + sourcePageSize
        const items = orderedItems.slice(startIndex, endIndex)
        const isPageOutOfRange =
          currentPage > 1 && items.length === 0 && !hasMoreSourcePages

        if (!cancelled) {
          setState({
            items,
            totalSourceCount,
            totalFilteredCount: hasMoreSourcePages ? null : orderedItems.length,
            pageSize: sourcePageSize,
            hasNextPage: orderedItems.length > endIndex,
            hasPreviousPage: currentPage > 1,
            isLoading: false,
            error: null,
            isPageOutOfRange,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setState((previous) => ({
            ...previous,
            isLoading: false,
            error: extractApiError(error),
          }))
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [currentPage, fallbackPageSize, tick, ...deps])

  const refetch = useCallback(() => {
    setTick((previous) => previous + 1)
  }, [])

  return useMemo(
    () => ({
      ...state,
      refetch,
    }),
    [refetch, state]
  )
}
