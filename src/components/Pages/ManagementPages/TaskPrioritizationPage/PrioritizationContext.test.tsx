import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { BinaryLeaf } from '@/components/shared/TaskPropertyQueryBuilder/propertyRuleTypes'
import { renderHook } from '@/test/testUtils'
import { TaskPriority } from '@/types/Priority'
import {
  parseBoundsString,
  parseRulesString,
  type PrioritizationDraft,
  PrioritizationProvider,
  usePrioritizationContext,
} from './PrioritizationContext'

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

const emptyTier = { rules: null, bounds: null }

const makeDraft = (overrides: Partial<PrioritizationDraft> = {}): PrioritizationDraft => ({
  defaultPriority: TaskPriority.MEDIUM,
  high: { ...emptyTier },
  medium: { ...emptyTier },
  low: { ...emptyTier },
  ...overrides,
})

const fc = (id: string): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id,
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
})

const leaf: BinaryLeaf = { key: 'highway', value: 'primary', operator: 'equals' }

describe('parseBoundsString', () => {
  it('returns null for null/undefined', () => {
    expect(parseBoundsString(null)).toBeNull()
    expect(parseBoundsString(undefined)).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseBoundsString('')).toBeNull()
  })

  it('returns null and logs a warning for invalid JSON', () => {
    expect(parseBoundsString('{not json')).toBeNull()
  })

  it('parses a JSON-stringified feature array (MR3 format) into a FeatureCollection', () => {
    const feature = { type: 'Feature', properties: {}, geometry: null }
    const result = parseBoundsString(JSON.stringify([feature]))

    expect(result).toEqual({ type: 'FeatureCollection', features: [feature] })
  })

  it('parses a JSON-stringified FeatureCollection as-is', () => {
    const collection = fc('a')
    const result = parseBoundsString(JSON.stringify(collection))

    expect(result).toEqual(collection)
  })

  it('accepts an already-parsed feature array (not a string)', () => {
    const feature = { type: 'Feature', properties: {}, geometry: null }
    const result = parseBoundsString([feature])

    expect(result).toEqual({ type: 'FeatureCollection', features: [feature] })
  })

  it('returns null for an empty array', () => {
    expect(parseBoundsString([])).toBeNull()
    expect(parseBoundsString(JSON.stringify([]))).toBeNull()
  })

  it('wraps a single already-parsed Feature object into a FeatureCollection', () => {
    const feature = { type: 'Feature', properties: {}, geometry: null }
    const result = parseBoundsString(feature)

    expect(result).toEqual({ type: 'FeatureCollection', features: [feature] })
  })

  it('passes an already-parsed FeatureCollection through untouched', () => {
    const collection = fc('b')
    expect(parseBoundsString(collection)).toEqual(collection)
  })

  it('returns null for an object shape it does not recognize', () => {
    expect(parseBoundsString({ foo: 'bar' })).toBeNull()
  })

  it('returns null for non-object primitives', () => {
    expect(parseBoundsString(42)).toBeNull()
    expect(parseBoundsString(true)).toBeNull()
  })
})

describe('parseRulesString', () => {
  it('returns null for empty/null input', () => {
    expect(parseRulesString(null)).toBeNull()
    expect(parseRulesString('')).toBeNull()
    expect(parseRulesString('{}')).toBeNull()
  })

  it('round-trips a simple backend-shaped rule into a BinaryLeaf', () => {
    const backendRule = JSON.stringify({
      condition: 'AND',
      rules: [{ value: 'highway.primary', type: 'string', operator: 'equal' }],
    })

    expect(parseRulesString(backendRule)).toEqual({
      key: 'highway',
      value: 'primary',
      operator: 'equals',
    })
  })

  it('returns null for unparseable garbage', () => {
    expect(parseRulesString('not json at all')).toBeNull()
  })
})

describe('PrioritizationProvider / usePrioritizationContext', () => {
  it('throws when used outside of a PrioritizationProvider', () => {
    expect(() => renderHook(() => usePrioritizationContext())).toThrow(
      'usePrioritizationContext must be used inside PrioritizationProvider'
    )
  })

  it('exposes the initial draft as both draft and initial, with isDirty false', () => {
    const initialDraft = makeDraft()
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    expect(result.current.draft).toEqual(initialDraft)
    expect(result.current.initial).toEqual(initialDraft)
    expect(result.current.isDirty).toBe(false)
  })

  it('setDefaultPriority updates only defaultPriority and marks the draft dirty', () => {
    const initialDraft = makeDraft({ defaultPriority: TaskPriority.MEDIUM })
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => result.current.setDefaultPriority(TaskPriority.HIGH))

    expect(result.current.draft.defaultPriority).toBe(TaskPriority.HIGH)
    expect(result.current.draft.high).toEqual(emptyTier)
    expect(result.current.isDirty).toBe(true)
  })

  it('setting defaultPriority back to its initial value clears isDirty', () => {
    const initialDraft = makeDraft({ defaultPriority: TaskPriority.MEDIUM })
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => result.current.setDefaultPriority(TaskPriority.HIGH))
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.setDefaultPriority(TaskPriority.MEDIUM))
    expect(result.current.isDirty).toBe(false)
  })

  it('setTierRules updates only the targeted tier', () => {
    const initialDraft = makeDraft()
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => result.current.setTierRules('medium', leaf))

    expect(result.current.draft.medium.rules).toEqual(leaf)
    expect(result.current.draft.high.rules).toBeNull()
    expect(result.current.draft.low.rules).toBeNull()
    expect(result.current.draft.medium.bounds).toBeNull()
    expect(result.current.isDirty).toBe(true)
  })

  it('setTierBounds updates only the targeted tier', () => {
    const initialDraft = makeDraft()
    const bounds = fc('x')
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => result.current.setTierBounds('low', bounds))

    expect(result.current.draft.low.bounds).toEqual(bounds)
    expect(result.current.draft.low.rules).toBeNull()
    expect(result.current.draft.high.bounds).toBeNull()
    expect(result.current.isDirty).toBe(true)
  })

  it('isDirty compares rules/bounds structurally, not by reference', () => {
    const initialDraft = makeDraft({ high: { rules: { ...leaf }, bounds: null } })
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    // Same content, new object identity - should NOT be considered dirty.
    act(() => result.current.setTierRules('high', { ...leaf }))
    expect(result.current.isDirty).toBe(false)

    // Actually different content - should be dirty.
    act(() => result.current.setTierRules('high', { ...leaf, value: 'secondary' }))
    expect(result.current.isDirty).toBe(true)
  })

  it('reset() reverts the draft back to the initial value', () => {
    const initialDraft = makeDraft()
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => {
      result.current.setDefaultPriority(TaskPriority.HIGH)
      result.current.setTierRules('high', leaf)
    })
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.reset())

    expect(result.current.draft).toEqual(initialDraft)
    expect(result.current.isDirty).toBe(false)
  })

  it('markSaved() adopts the current draft as the new initial baseline', () => {
    const initialDraft = makeDraft()
    const { result } = renderHook(() => usePrioritizationContext(), {
      wrapper: ({ children }) => (
        <PrioritizationProvider initialDraft={initialDraft}>{children}</PrioritizationProvider>
      ),
    })

    act(() => result.current.setTierRules('low', leaf))
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.markSaved())

    expect(result.current.isDirty).toBe(false)
    expect(result.current.initial.low.rules).toEqual(leaf)

    // reset() after markSaved should now return to the *saved* state, not the
    // original construction-time draft.
    act(() => {
      result.current.setTierRules('low', null)
      result.current.reset()
    })
    expect(result.current.draft.low.rules).toEqual(leaf)
  })
})
