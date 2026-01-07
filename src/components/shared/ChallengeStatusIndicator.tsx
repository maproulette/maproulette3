import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import type { Challenge } from '@/types/Challenge'

// Challenge status constants (matching backend)
const CHALLENGE_STATUS_NONE = 0
const CHALLENGE_STATUS_BUILDING = 1
const CHALLENGE_STATUS_FAILED = 2
const CHALLENGE_STATUS_READY = 3
const CHALLENGE_STATUS_PARTIALLY_LOADED = 4
const CHALLENGE_STATUS_FINISHED = 5
const CHALLENGE_STATUS_DELETING_TASKS = 6

const TASKS_UPDATING_MESSAGE = 'Updating Task Statuses'

interface ChallengeStatusIndicatorProps {
  challenge: Challenge
  challengeId: number
}

export const ChallengeStatusIndicator = ({
  challenge,
  challengeId,
}: ChallengeStatusIndicatorProps) => {
  const queryClient = useQueryClient()
  const [startTime] = useState(Date.now())
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [currentTime, setCurrentTime] = useState(Date.now())
  const hasInitialRefresh = useRef(false)

  const status = challenge.status ?? CHALLENGE_STATUS_NONE
  const statusMessage = challenge.statusMessage

  useEffect(() => {
    hasInitialRefresh.current = false
  }, [challengeId])

  useEffect(() => {
    if (!hasInitialRefresh.current && status === CHALLENGE_STATUS_BUILDING) {
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] })
      setLastRefresh(Date.now())
      hasInitialRefresh.current = true
    }
  }, [status, challengeId, queryClient])

  // Auto-refresh every 10 seconds when building
  useEffect(() => {
    if (status === CHALLENGE_STATUS_BUILDING) {
      const refreshInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] })
        setLastRefresh(Date.now())
      }, 10000) // 10 seconds

      return () => clearInterval(refreshInterval)
    }
  }, [status, challengeId, queryClient])

  // Update current time every second for countdown display
  useEffect(() => {
    if (status === CHALLENGE_STATUS_BUILDING) {
      const tickInterval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000) // Update every second

      return () => clearInterval(tickInterval)
    }
  }, [status])

  // Don't show anything if status is ready, none, or finished
  if (
    status === CHALLENGE_STATUS_READY ||
    status === CHALLENGE_STATUS_NONE ||
    status === CHALLENGE_STATUS_FINISHED ||
    !status
  ) {
    return null
  }

  // Building status
  if (status === CHALLENGE_STATUS_BUILDING) {
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
    const nextUpdateSeconds = Math.max(0, Math.floor((lastRefresh + 10000 - currentTime) / 1000))

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isUpdating = statusMessage === TASKS_UPDATING_MESSAGE

    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          {isUpdating ? 'Tasks Updating...' : 'Tasks Building...'}
        </AlertTitle>
        <AlertDescription className="space-y-2 text-blue-800 dark:text-blue-200">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">
              Elapsed time: <strong>{formatDuration(elapsedSeconds)}</strong>
            </span>
            <span className="text-sm">
              Refreshing in:{' '}
              <strong className="text-orange-600 dark:text-orange-400">
                {formatDuration(nextUpdateSeconds)}
              </strong>
            </span>
          </div>
          {!isUpdating && (
            <div className="text-sm">
              Tasks are being generated. This page will automatically refresh to show progress.
            </div>
          )}
          {isUpdating && (
            <div className="text-sm">
              Task statuses are being updated. This page will automatically refresh to show
              progress.
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Failed status
  if (status === CHALLENGE_STATUS_FAILED) {
    // Helper function to strip HTML tags and decode entities (works in React/SSR)
    const sanitizeMessage = (message: string | null | undefined): string => {
      if (!message) return ''
      let decoded = message
      // First, decode common HTML entities
      decoded = decoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      // Remove all HTML tags
      decoded = decoded.replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      decoded = decoded.replace(/\s+/g, ' ').trim()
      return decoded
    }

    const sanitizedMessage = sanitizeMessage(statusMessage)

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tasks Failed to Build</AlertTitle>
        <AlertDescription>
          {sanitizedMessage ? (
            <div className="mt-2 max-h-64 overflow-y-auto overflow-x-hidden rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
              <pre className="whitespace-pre-wrap break-words break-all text-xs text-red-900 dark:text-red-100">
                {sanitizedMessage}
              </pre>
            </div>
          ) : (
            <p className="mt-2 text-sm">
              The challenge failed to build tasks. Please check the challenge configuration and try
              again.
            </p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Partially loaded status
  if (status === CHALLENGE_STATUS_PARTIALLY_LOADED) {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          Challenge Partially Loaded
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <p className="text-sm">
            This challenge is partially loaded. Some tasks may not be available yet.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // Deleting tasks status
  if (status === CHALLENGE_STATUS_DELETING_TASKS) {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <Loader2 className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">Deleting Tasks...</AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <p className="text-sm">Tasks are being deleted. Please wait...</p>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
