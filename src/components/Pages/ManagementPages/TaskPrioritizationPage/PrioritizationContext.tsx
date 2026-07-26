import { createContext, type ReactNode, useContext, useState } from 'react'
import { backendJsonToBinary } from '@/components/shared/TaskPropertyQueryBuilder/backendRuleShape'
import type { BinaryNode } from '@/components/shared/TaskPropertyQueryBuilder/propertyRuleTypes'
import { logger } from '@/lib/logger'
import { TaskPriority, type TaskPriorityValue } from '@/types/Priority'

export type Tier = 'high' | 'medium' | 'low'

export const TIER_TO_PRIORITY: Record<Tier, TaskPriorityValue> = {
  high: TaskPriority.HIGH,
  medium: TaskPriority.MEDIUM,
  low: TaskPriority.LOW,
}

export interface TierDraft {
  rules: BinaryNode | null
  bounds: GeoJSON.FeatureCollection | null
}

export interface PrioritizationDraft {
  defaultPriority: TaskPriorityValue
  high: TierDraft
  medium: TierDraft
  low: TierDraft
}

/**
 * Parse a raw server-stored bounds string into a FeatureCollection.
 * Accepts either a FeatureCollection or a GeoJSON feature array (MR3 format).
 */
// The backend serializes priority bounds inconsistently — the save endpoint
// accepts a JSON string, but the challenge GET response returns the parsed
// array (or null). Accept anything we might encounter so the draft re-init
// after a save round-trip doesn't silently drop the bounds and reset the
// preview to all-default.
export const parseBoundsString = (raw: unknown): GeoJSON.FeatureCollection | null => {
  if (raw == null) return null
  let parsed: unknown
  if (typeof raw === 'string') {
    if (raw.length === 0) return null
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      logger.warn('Could not parse priority bounds string', { error })
      return null
    }
  } else {
    parsed = raw
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return null
    return { type: 'FeatureCollection', features: parsed as GeoJSON.Feature[] }
  }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as { type?: string }
    if (obj.type === 'FeatureCollection') {
      return parsed as GeoJSON.FeatureCollection
    }
    if (obj.type === 'Feature') {
      return { type: 'FeatureCollection', features: [parsed as GeoJSON.Feature] }
    }
  }
  return null
}

// The backend stores rules in its own JSON shape (see backendRuleShape.ts)
// — `{condition, rules: [...]}` with dot-joined `key.value` leaves — while
// the editor works in our `BinaryNode` tree. Translate on the way in so the
// editor sees a shape it understands.
export const parseRulesString = (raw: unknown): BinaryNode | null => backendJsonToBinary(raw)

interface PrioritizationContextValue {
  draft: PrioritizationDraft
  initial: PrioritizationDraft
  setDefaultPriority: (priority: TaskPriorityValue) => void
  setTierRules: (tier: Tier, rules: BinaryNode | null) => void
  setTierBounds: (tier: Tier, bounds: GeoJSON.FeatureCollection | null) => void
  reset: () => void
  markSaved: () => void
  isDirty: boolean
}

const PrioritizationContext = createContext<PrioritizationContextValue | null>(null)

const draftsEqual = (a: PrioritizationDraft, b: PrioritizationDraft): boolean => {
  if (a.defaultPriority !== b.defaultPriority) return false
  for (const tier of ['high', 'medium', 'low'] as Tier[]) {
    if (JSON.stringify(a[tier].rules) !== JSON.stringify(b[tier].rules)) return false
    if (JSON.stringify(a[tier].bounds) !== JSON.stringify(b[tier].bounds)) return false
  }
  return true
}

export const PrioritizationProvider = ({
  children,
  initialDraft,
}: {
  children: ReactNode
  initialDraft: PrioritizationDraft
}) => {
  const [initial, setInitial] = useState<PrioritizationDraft>(initialDraft)
  const [draft, setDraft] = useState<PrioritizationDraft>(initialDraft)

  const setDefaultPriority = (priority: TaskPriorityValue) =>
    setDraft((prev) => ({ ...prev, defaultPriority: priority }))

  const setTierRules = (tier: Tier, rules: BinaryNode | null) =>
    setDraft((prev) => ({ ...prev, [tier]: { ...prev[tier], rules } }))

  const setTierBounds = (tier: Tier, bounds: GeoJSON.FeatureCollection | null) =>
    setDraft((prev) => ({ ...prev, [tier]: { ...prev[tier], bounds } }))

  const reset = () => setDraft(initial)
  const markSaved = () => setInitial(draft)

  const value: PrioritizationContextValue = {
    draft,
    initial,
    setDefaultPriority,
    setTierRules,
    setTierBounds,
    reset,
    markSaved,
    isDirty: !draftsEqual(draft, initial),
  }

  return <PrioritizationContext.Provider value={value}>{children}</PrioritizationContext.Provider>
}

export const usePrioritizationContext = () => {
  const ctx = useContext(PrioritizationContext)
  if (!ctx) {
    throw new Error('usePrioritizationContext must be used inside PrioritizationProvider')
  }
  return ctx
}
