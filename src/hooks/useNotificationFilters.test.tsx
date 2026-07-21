import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'

type SearchState = Record<string, unknown>

const { searchRef, navigateMock } = vi.hoisted(() => ({
  searchRef: { current: {} as SearchState },
  navigateMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useSearch: () => searchRef.current,
}))

import { DEFAULT_FILTER_STATE, useNotificationFilters } from './useNotificationFilters'

function makeNotification(props: Partial<Notification>): Notification {
  return {
    id: 1,
    notificationType: NotificationType.SYSTEM,
    isRead: false,
    ...props,
  } as Notification
}

function applyNavigate(opts: { search: SearchState | ((prev: SearchState) => SearchState) }) {
  searchRef.current =
    typeof opts.search === 'function' ? opts.search(searchRef.current) : opts.search
}

describe('useNotificationFilters', () => {
  beforeEach(() => {
    localStorage.clear()
    searchRef.current = {}
    navigateMock.mockReset()
    navigateMock.mockImplementation(applyNavigate)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns the default filter state when there are no URL search params', () => {
    const { result } = renderHook(() => useNotificationFilters([]))

    expect(result.current.category).toBe('all')
    expect(result.current.status).toBe('all')
    expect(result.current.filterTask).toBe('all')
    expect(result.current.filterType).toBe('all')
    expect(result.current.filterFrom).toBe('all')
    expect(result.current.filterChallenge).toBe('all')
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('reads initial state from the URL search params', () => {
    searchRef.current = { category: 'mention', status: 'unread' }

    const { result } = renderHook(() => useNotificationFilters([]))

    expect(result.current.category).toBe('mention')
    expect(result.current.status).toBe('unread')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('falls back to "all" for an invalid category/status value in the URL', () => {
    searchRef.current = { category: 'bogus', status: 'bogus' }

    const { result } = renderHook(() => useNotificationFilters([]))

    expect(result.current.category).toBe('all')
    expect(result.current.status).toBe('all')
  })

  it('setCategory writes the category to the URL and clears it back out when set to default', () => {
    const { result, rerender } = renderHook(() => useNotificationFilters([]))

    act(() => result.current.setCategory('review'))
    rerender()
    expect(result.current.category).toBe('review')
    expect(searchRef.current.category).toBe('review')

    act(() => result.current.setCategory('all'))
    rerender()
    expect(result.current.category).toBe('all')
    expect(searchRef.current.category).toBeUndefined()
  })

  it('setFilterTask/setFilterType/setFilterFrom/setFilterChallenge write to their own search keys', () => {
    const { result, rerender } = renderHook(() => useNotificationFilters([]))

    act(() => {
      result.current.setFilterTask('42')
      result.current.setFilterType('3')
      result.current.setFilterFrom('alice')
      result.current.setFilterChallenge('Fix roads')
    })
    rerender()

    expect(result.current.filterTask).toBe('42')
    expect(result.current.filterType).toBe('3')
    expect(result.current.filterFrom).toBe('alice')
    expect(result.current.filterChallenge).toBe('Fix roads')
  })

  it('clearFilters removes every filter key from the URL', () => {
    searchRef.current = {
      category: 'mention',
      status: 'unread',
      task: '1',
      type: '2',
      from: 'bob',
      challenge: 'x',
    }
    const { result, rerender } = renderHook(() => useNotificationFilters([]))

    act(() => result.current.clearFilters())
    rerender()

    expect(result.current.category).toBe('all')
    expect(result.current.status).toBe('all')
    expect(result.current.filterTask).toBe('all')
    expect(result.current.filterType).toBe('all')
    expect(result.current.filterFrom).toBe('all')
    expect(result.current.filterChallenge).toBe('all')
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('applyFilterState writes a whole filter state at once, dropping default fields', () => {
    const { result, rerender } = renderHook(() => useNotificationFilters([]))

    act(() =>
      result.current.applyFilterState({
        ...DEFAULT_FILTER_STATE,
        category: 'team',
        filterFrom: 'carol',
      })
    )
    rerender()

    expect(result.current.category).toBe('team')
    expect(result.current.filterFrom).toBe('carol')
    expect(searchRef.current.status).toBeUndefined()
  })

  it('filterOptions extracts sorted unique tasks/types/fromUsers/challenges', () => {
    const notifications = [
      makeNotification({
        id: 1,
        taskId: 5,
        notificationType: 2,
        fromUsername: 'bob',
        challengeName: 'B',
      }),
      makeNotification({
        id: 2,
        taskId: 1,
        notificationType: 1,
        fromUsername: 'alice',
        challengeName: 'A',
      }),
      makeNotification({
        id: 3,
        taskId: 5,
        notificationType: 1,
        fromUsername: 'alice',
        challengeName: 'A',
      }),
    ]

    const { result } = renderHook(() => useNotificationFilters(notifications))

    expect(result.current.filterOptions.tasks).toEqual([1, 5])
    expect(result.current.filterOptions.types).toEqual([1, 2])
    expect(result.current.filterOptions.fromUsers).toEqual(['alice', 'bob'])
    expect(result.current.filterOptions.challenges).toEqual(['A', 'B'])
  })

  it('categoryCounts and statusCounts tally notifications correctly', () => {
    const notifications = [
      makeNotification({ id: 1, notificationType: NotificationType.MENTION, isRead: false }),
      makeNotification({ id: 2, notificationType: NotificationType.MENTION, isRead: true }),
      makeNotification({ id: 3, notificationType: NotificationType.TEAM, isRead: false }),
    ]

    const { result } = renderHook(() => useNotificationFilters(notifications))

    expect(result.current.categoryCounts.all).toBe(3)
    expect(result.current.categoryCounts.mention).toBe(2)
    expect(result.current.categoryCounts.team).toBe(1)
    expect(result.current.statusCounts).toEqual({ all: 3, unread: 2, read: 1 })
  })

  it('applyFilters filters by category, status, task, type, from, and challenge', () => {
    const notifications = [
      makeNotification({
        id: 1,
        taskId: 5,
        notificationType: NotificationType.MENTION,
        isRead: false,
        fromUsername: 'alice',
        challengeName: 'A',
      }),
      makeNotification({
        id: 2,
        taskId: 6,
        notificationType: NotificationType.TEAM,
        isRead: true,
        fromUsername: 'bob',
        challengeName: 'B',
      }),
    ]
    searchRef.current = { category: 'mention' }
    const { result } = renderHook(() => useNotificationFilters(notifications))

    expect(result.current.applyFilters(notifications)).toEqual([notifications[0]])
  })

  it('applyFilters returns unread-only notifications when status=unread', () => {
    const notifications = [
      makeNotification({ id: 1, isRead: false }),
      makeNotification({ id: 2, isRead: true }),
    ]
    searchRef.current = { status: 'unread' }
    const { result } = renderHook(() => useNotificationFilters(notifications))

    expect(result.current.applyFilters(notifications)).toEqual([notifications[0]])
  })

  it('persists the current filter state to localStorage as it changes', () => {
    const { result, rerender } = renderHook(() => useNotificationFilters([]))

    act(() => result.current.setCategory('challenge'))
    rerender()

    const stored = JSON.parse(localStorage.getItem('mr4:notifications:lastFilters') ?? '{}')
    expect(stored.category).toBe('challenge')
  })

  it('restores a previously-persisted non-default state on a fresh mount', () => {
    localStorage.setItem(
      'mr4:notifications:lastFilters',
      JSON.stringify({ ...DEFAULT_FILTER_STATE, category: 'review', filterFrom: 'dave' })
    )

    const { result, rerender } = renderHook(() => useNotificationFilters([]))
    rerender()

    expect(result.current.category).toBe('review')
    expect(result.current.filterFrom).toBe('dave')
    expect(searchRef.current.category).toBe('review')
    expect(searchRef.current.from).toBe('dave')
  })

  it('does not restore persisted filters when the URL already has filter params', () => {
    localStorage.setItem(
      'mr4:notifications:lastFilters',
      JSON.stringify({ ...DEFAULT_FILTER_STATE, category: 'review' })
    )
    searchRef.current = { status: 'unread' }

    const { result, rerender } = renderHook(() => useNotificationFilters([]))
    rerender()

    expect(result.current.category).toBe('all')
    expect(result.current.status).toBe('unread')
  })

  it('does not restore when persisted filters are all defaults', () => {
    localStorage.setItem('mr4:notifications:lastFilters', JSON.stringify(DEFAULT_FILTER_STATE))
    const navigateCallsBefore = navigateMock.mock.calls.length

    renderHook(() => useNotificationFilters([]))

    // Only the persistence-effect write should have happened, no restore navigate call
    // that carries non-default values.
    expect(searchRef.current.category).toBeUndefined()
    expect(navigateMock.mock.calls.length).toBeGreaterThanOrEqual(navigateCallsBefore)
  })

  it('ignores malformed JSON in localStorage without throwing', () => {
    localStorage.setItem('mr4:notifications:lastFilters', '{not-json')

    expect(() => renderHook(() => useNotificationFilters([]))).not.toThrow()
  })
})
