'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
  onError?: (error: Error) => void
}

export function usePolling(
  callback: () => Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 5000, enabled = true, onError } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startPolling = useCallback(() => {
    if (!enabled) return

    // Initial call
    callback().catch((error) => {
      if (onError) onError(error)
      console.error('Polling callback error:', error)
    })

    // Set up interval
    intervalRef.current = setInterval(() => {
      callback().catch((error) => {
        if (onError) onError(error)
        console.error('Polling callback error:', error)
      })
    }, interval)
  }, [callback, interval, enabled, onError])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startPolling()
    }

    return () => stopPolling()
  }, [enabled, startPolling, stopPolling])

  return { startPolling, stopPolling }
}
