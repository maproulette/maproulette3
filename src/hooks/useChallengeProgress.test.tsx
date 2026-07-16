import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_HEX, STATUS_KEY_TO_ID } from '@/lib/taskConstants'
import type { CompletionMetrics } from '@/types/Challenge'

const { getChallengeStatsMock } = vi.hoisted(() => ({ getChallengeStatsMock: vi.fn() }))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: { ...actual.api.challenge, getChallengeStats: getChallengeStatsMock },
    },
  }
})

import { useChallengeProgress } from './useChallengeProgress'

const colorFor = (key: string) => STATUS_HEX[STATUS_KEY_TO_ID[key] ?? -1] ?? '#9ca3af'

describe('useChallengeProgress', () => {
  it('returns empty/zero state when there is no stats data and no fallback', () => {
    getChallengeStatsMock.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useChallengeProgress(1))

    expect(result.current).toEqual({
      completionPercentage: 0,
      segments: [],
      hasActions: false,
      total: 0,
      tasksRemaining: 0,
    })
  })

  it('falls back to the provided completion metrics when per-challenge stats are not loaded', () => {
    getChallengeStatsMock.mockReturnValue({ data: undefined })
    const fallback: CompletionMetrics = {
      total: 10,
      available: 3,
      fixed: 5,
      falsePositive: 1,
      skipped: 1,
      deleted: 0,
      alreadyFixed: 0,
      tooHard: 0,
      answered: 0,
      validated: 0,
      disabled: 0,
      tasksRemaining: 4,
    }

    const { result } = renderHook(() => useChallengeProgress(1, fallback))

    expect(result.current.hasActions).toBe(true)
    expect(result.current.total).toBe(10)
    expect(result.current.completionPercentage).toBe(60)
    expect(result.current.tasksRemaining).toBe(4)
  })

  it('prefers per-challenge stats data over the fallback when both are available', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 4, fixed: 4 } }],
    })
    const fallback: CompletionMetrics = {
      total: 999,
      available: 0,
      fixed: 0,
      falsePositive: 0,
      skipped: 0,
      deleted: 0,
      alreadyFixed: 0,
      tooHard: 0,
      answered: 0,
      validated: 0,
      disabled: 0,
      tasksRemaining: 0,
    }

    const { result } = renderHook(() => useChallengeProgress(1, fallback))

    expect(result.current.total).toBe(4)
    expect(result.current.completionPercentage).toBe(100)
  })

  it('derives the total by summing per-status fields when actions.total is missing', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { fixed: 2, available: 3 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    expect(result.current.total).toBe(5)
    expect(result.current.completionPercentage).toBe(40)
  })

  it('derives the total by summing when actions.total is zero', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 0, fixed: 1, skipped: 1 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    expect(result.current.total).toBe(2)
  })

  it('builds completed segments with correct percentage, color, and title', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 10, fixed: 4, falsePositive: 2, alreadyFixed: 1 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    const fixedSegment = result.current.segments.find((s) => s.key === 'fixed')
    expect(fixedSegment).toEqual({
      key: 'fixed',
      percentage: 40,
      color: colorFor('fixed'),
      title: 'Fixed: 4',
    })

    const falsePositiveSegment = result.current.segments.find((s) => s.key === 'falsePositive')
    expect(falsePositiveSegment?.percentage).toBe(20)

    const alreadyFixedSegment = result.current.segments.find((s) => s.key === 'alreadyFixed')
    expect(alreadyFixedSegment?.percentage).toBe(10)
  })

  it('gives tooHard its own red-tinted problem segment', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 10, fixed: 5, tooHard: 3 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    const problemSegment = result.current.segments.find((s) => s.key === 'tooHard')
    expect(problemSegment).toMatchObject({
      key: 'tooHard',
      percentage: 30,
      color: '#ef4444',
      opacity: 0.55,
      title: "Can't Complete: 3",
    })
  })

  it('collapses all other non-completed statuses into a single gray remaining fill segment', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 10, fixed: 5, available: 3, skipped: 2 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    const remainingSegments = result.current.segments.filter((s) => s.key === 'remaining')
    expect(remainingSegments).toHaveLength(1)
    expect(remainingSegments[0]).toMatchObject({
      color: '#9ca3af',
      opacity: 0.45,
      title: 'Remaining: 5',
    })

    const totalPercentage = result.current.segments.reduce((acc, s) => acc + s.percentage, 0)
    expect(totalPercentage).toBeCloseTo(100)
  })

  it('produces no segments and reports hasActions false when total is 0', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 0, fixed: 0 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    expect(result.current.segments).toEqual([])
    expect(result.current.hasActions).toBe(false)
    expect(result.current.completionPercentage).toBe(0)
  })

  it('computes tasksRemaining as available + skipped + tooHard', () => {
    getChallengeStatsMock.mockReturnValue({
      data: [{ actions: { total: 10, available: 2, skipped: 1, tooHard: 1, fixed: 6 } }],
    })

    const { result } = renderHook(() => useChallengeProgress(1))

    expect(result.current.tasksRemaining).toBe(4)
  })
})
