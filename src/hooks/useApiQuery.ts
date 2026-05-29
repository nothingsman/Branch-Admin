/**
 * Minimal data-fetching hook — no external library needed.
 * Returns { data, isLoading, error, refetch }.
 */
import { useState, useEffect, useCallback, useRef } from "react"
import { extractApiError } from "../lib/api"

export interface UseApiQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * @param fetcher  Async function that returns the data. Pass `null` to skip.
 * @param deps     Re-run when any dep changes (like useEffect deps).
 */
export function useApiQuery<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(fetcher !== null)
  const [error, setError] = useState<string | null>(null)
  // Increment to trigger a manual refetch
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    if (fetcherRef.current === null) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(extractApiError(err))
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { data, isLoading, error, refetch }
}
