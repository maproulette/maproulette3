import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { TaskPriority, type TaskPriorityValue } from '@/types/Priority'
import type { TaskMarker } from '@/types/Task'
import {
  type EvaluationConfig,
  evaluatePriority,
  type TaskPreviewInput,
} from './evaluation/evaluatePriority'
import { analyzeWarnings, type PrioritizationWarnings } from './evaluation/ruleAnalysis'
import { TIER_TO_PRIORITY, usePrioritizationContext } from './PrioritizationContext'

export interface PreviewResult {
  /** Computed priority keyed by task id. */
  byTaskId: Map<number, TaskPriorityValue>
  /** Number of tasks falling into each tier. */
  counts: Record<TaskPriorityValue, number>
  /** Tasks whose computed priority differs from their current server-stored priority. */
  changedCount: number
  warnings: PrioritizationWarnings
}

const EMPTY_COUNTS: Record<TaskPriorityValue, number> = { 0: 0, 1: 0, 2: 0 }

interface TaskPreviewContextValue {
  isLoading: boolean
  markers: TaskMarker[]
  preview: PreviewResult
}

const TaskPreviewContext = createContext<TaskPreviewContextValue | null>(null)

const DEBOUNCE_MS = 150

const buildConfig = (
  defaultPriority: TaskPriorityValue,
  draft: ReturnType<typeof usePrioritizationContext>['draft']
): EvaluationConfig => ({
  defaultPriority,
  tiers: [
    {
      priority: TIER_TO_PRIORITY.high,
      rules: draft.high.rules,
      bounds: draft.high.bounds,
    },
    {
      priority: TIER_TO_PRIORITY.medium,
      rules: draft.medium.rules,
      bounds: draft.medium.bounds,
    },
    {
      priority: TIER_TO_PRIORITY.low,
      rules: draft.low.rules,
      bounds: draft.low.bounds,
    },
  ],
})

export const TaskPreviewProvider = ({
  children,
  markers,
  isLoading,
}: {
  children: ReactNode
  markers: TaskMarker[]
  isLoading: boolean
}) => {
  const { draft } = usePrioritizationContext()
  // Debounce rapid rule edits before re-evaluating.
  const [debouncedDraft, setDebouncedDraft] = useState(draft)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedDraft(draft), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [draft])

  const preview = useMemo<PreviewResult>(() => {
    const config = buildConfig(debouncedDraft.defaultPriority, debouncedDraft)
    const byTaskId = new Map<number, TaskPriorityValue>()
    const counts: Record<TaskPriorityValue, number> = { ...EMPTY_COUNTS }
    let changedCount = 0

    for (const marker of markers) {
      const input: TaskPreviewInput = {
        id: marker.id,
        lng: marker.location?.lng ?? 0,
        lat: marker.location?.lat ?? 0,
        currentPriority: marker.priority,
        properties: null,
      }
      const computed = evaluatePriority(input, config)
      byTaskId.set(marker.id, computed)
      counts[computed] += 1
      if (computed !== marker.priority) changedCount += 1
    }

    const tierHasAnyConfig: Record<TaskPriorityValue, boolean> = {
      0: !!debouncedDraft.high.rules || !!debouncedDraft.high.bounds,
      1: !!debouncedDraft.medium.rules || !!debouncedDraft.medium.bounds,
      2: !!debouncedDraft.low.rules || !!debouncedDraft.low.bounds,
    }

    const warnings = analyzeWarnings({
      defaultPriority: debouncedDraft.defaultPriority,
      tierCounts: counts,
      tierHasAnyConfig,
      totalTasks: markers.length,
    })

    return { byTaskId, counts, changedCount, warnings }
  }, [markers, debouncedDraft])

  const value: TaskPreviewContextValue = { markers, isLoading, preview }

  return <TaskPreviewContext.Provider value={value}>{children}</TaskPreviewContext.Provider>
}

export const useTaskPreview = () => {
  const ctx = useContext(TaskPreviewContext)
  if (!ctx) throw new Error('useTaskPreview must be used inside TaskPreviewProvider')
  return ctx
}

export { TaskPriority }
