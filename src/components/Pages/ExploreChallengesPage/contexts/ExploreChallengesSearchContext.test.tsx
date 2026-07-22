import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_WORLD_BOUNDS } from '@/components/Map/mapUtils'

type SearchState = Record<string, unknown>

const { searchRef } = vi.hoisted(() => ({
  searchRef: { current: {} as SearchState },
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => searchRef.current,
}))

import {
  ExploreChallengesSearchContextProvider,
  useExploreChallengesSearchContext,
} from './ExploreChallengesSearchContext'

const COOKIE_NAME = 'mr4_explore_challenges_filters'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ExploreChallengesSearchContextProvider>{children}</ExploreChallengesSearchContextProvider>
)

const setup = () => renderHook(() => useExploreChallengesSearchContext(), { wrapper })

const clearCookies = () => {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
    }
  }
}

describe('ExploreChallengesSearchContext', () => {
  beforeEach(() => {
    searchRef.current = {}
    clearCookies()
  })

  afterEach(() => {
    clearCookies()
  })

  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useExploreChallengesSearchContext())).toThrow(
      'useExploreChallengesSearchContext must be used within an ExploreChallengesSearchContextProvider'
    )
  })

  it('defaults to Any/Anything/no-sort/grid-map with world bounds and no keywords', () => {
    const { result } = setup()

    expect(result.current.difficulty).toBe('Any')
    expect(result.current.workOn).toBe('Anything')
    expect(result.current.selectedCategories).toEqual([])
    expect(result.current.sortBy).toBeUndefined()
    expect(result.current.viewMode).toBe('grid-map')
    expect(result.current.cluster).toBe(true)
    expect(result.current.global).toBeUndefined()
    expect(result.current.bounds).toBe(DEFAULT_WORLD_BOUNDS)
    expect(result.current.keywords).toBeUndefined()
    expect(result.current.extendedFindParams.difficulty).toBeUndefined()
    expect(result.current.extendedFindParams.global).toBeUndefined()
  })

  it('seeds initial state from URL search params, taking priority over defaults', () => {
    searchRef.current = {
      difficulty: 'Expert',
      workOn: 'Water',
      categories: 'flood,river',
      sortBy: 'popularity',
      global: true,
      viewMode: 'list',
    }

    const { result } = setup()

    expect(result.current.difficulty).toBe('Expert')
    expect(result.current.workOn).toBe('Water')
    expect(result.current.selectedCategories).toEqual(['flood', 'river'])
    expect(result.current.sortBy).toBe('popularity')
    expect(result.current.global).toBe(true)
    expect(result.current.viewMode).toBe('list')
  })

  it('falls back to persisted cookie filters when there are no URL search params', () => {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ difficulty: 'Normal', workOn: 'Buildings', cluster: false })
    )};path=/;`

    const { result } = setup()

    expect(result.current.difficulty).toBe('Normal')
    expect(result.current.workOn).toBe('Buildings')
    expect(result.current.cluster).toBe(false)
  })

  it('ignores malformed cookie JSON without throwing', () => {
    document.cookie = `${COOKIE_NAME}=not-json;path=/;`

    expect(() => setup()).not.toThrow()
    const { result } = setup()
    expect(result.current.difficulty).toBe('Any')
  })

  it('setDifficulty updates the difficulty value and derived search params', () => {
    const { result, rerender } = setup()

    act(() => result.current.setDifficulty('Expert'))
    rerender()

    expect(result.current.difficulty).toBe('Expert')
    expect(result.current.extendedFindParams.difficulty).toBe(3)
    expect(result.current.taskTilesParams.difficulty).toBe(3)
  })

  it('derives extendedFindParams.keywords reactively from selected categories and workOn', () => {
    const { result, rerender } = setup()

    act(() => {
      result.current.setSelectedCategories(['custom-tag'])
      result.current.setWorkOn('Water')
    })
    rerender()

    expect(result.current.extendedFindParams.keywords).toBe('custom-tag,water,waterway')
    expect(result.current.taskTilesParams.keywords).toBe('custom-tag,water,waterway')
  })

  // NOTE: unlike extendedFindParams.keywords (recomputed via useMemo on every
  // render), the raw `keywords` field is plain useState seeded once from the
  // initial selectedCategories/workOn and is never updated when those change
  // afterwards (setKeywords is only ever called from handleClearFilters). This
  // looks like a real bug in ExploreChallengesSearchContext.tsx: ClearFiltersButton's
  // hasActiveFilters and FilterBar's URL-sync effect both read this stale `keywords`
  // value. This test documents the current (buggy) behavior rather than papering
  // over it.
  it('does not reactively update the raw `keywords` field when categories/workOn change post-mount', () => {
    const { result, rerender } = setup()

    act(() => {
      result.current.setSelectedCategories(['custom-tag'])
      result.current.setWorkOn('Water')
    })
    rerender()

    expect(result.current.keywords).toBeUndefined()
  })

  it('keeps keywords undefined when there are no categories and workOn is "Anything"', () => {
    const { result } = setup()
    expect(result.current.keywords).toBeUndefined()
  })

  it('only clamps bounds to valid ranges in grid-map view mode, using world bounds otherwise', () => {
    const { result, rerender } = setup()

    act(() => result.current.setBounds('-200,-100,200,100'))
    rerender()
    expect(result.current.extendedFindParams.bounds).toBe('-180,-85,180,85')

    act(() => result.current.setViewMode('list'))
    rerender()
    expect(result.current.extendedFindParams.bounds).toBe(DEFAULT_WORLD_BOUNDS)
  })

  it('handleClearFilters resets bounds, location, difficulty, workOn, categories, and keywords', () => {
    const { result, rerender } = setup()

    act(() => {
      result.current.setBounds('10,10,20,20')
      result.current.setDifficulty('Expert')
      result.current.setWorkOn('Water')
      result.current.setSelectedCategories(['tag'])
      result.current.setLocationOsm('R', 42)
      result.current.setLocationGeojson({ type: 'Polygon', coordinates: [] })
    })
    rerender()

    act(() => result.current.handleClearFilters())
    rerender()

    expect(result.current.bounds).toBe(DEFAULT_WORLD_BOUNDS)
    expect(result.current.locationOsmType).toBeUndefined()
    expect(result.current.locationOsmId).toBeUndefined()
    expect(result.current.global).toBeUndefined()
    expect(result.current.difficulty).toBe('Any')
    expect(result.current.workOn).toBe('Anything')
    expect(result.current.selectedCategories).toEqual([])
    expect(result.current.locationGeojson).toBeNull()
    expect(result.current.keywords).toBeUndefined()
  })

  it('persists non-default filters to a cookie and removes the cookie once filters are all default again', () => {
    const { result, rerender } = setup()

    act(() => result.current.setDifficulty('Expert'))
    rerender()
    expect(document.cookie).toContain(COOKIE_NAME)

    act(() => result.current.setDifficulty('Any'))
    rerender()
    expect(document.cookie).not.toContain(COOKIE_NAME)
  })

  it('setLocationOsm sets both the osm type and id together', () => {
    const { result, rerender } = setup()

    act(() => result.current.setLocationOsm('W', 123))
    rerender()

    expect(result.current.locationOsmType).toBe('W')
    expect(result.current.locationOsmId).toBe(123)
  })

  it('requestFitBounds sets pendingFitBounds and clearPendingFitBounds resets it to null', () => {
    const { result, rerender } = setup()

    act(() => result.current.requestFitBounds('1,2,3,4'))
    rerender()
    expect(result.current.pendingFitBounds).toBe('1,2,3,4')

    act(() => result.current.clearPendingFitBounds())
    rerender()
    expect(result.current.pendingFitBounds).toBeNull()
  })
})
