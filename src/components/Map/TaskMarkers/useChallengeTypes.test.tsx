import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest: apiRequestMock }
})

import { useChallengeTypes } from './useChallengeTypes'

const tagsResponse = (names: string[]) => ({
  json: () => Promise.resolve(names.map((name, i) => ({ id: i, name }))),
})

describe('useChallengeTypes', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  it('returns an empty map for an empty challenge id list', () => {
    const { result } = renderHookWithClient(() => useChallengeTypes([]))

    expect(result.current).toEqual(new Map())
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('resolves a single challenge id to its task type based on tags', async () => {
    apiRequestMock.get.mockReturnValue(tagsResponse(['river', 'unrelated']))

    const { result } = renderHookWithClient(() => useChallengeTypes([1]))

    await waitFor(() => expect(result.current.get(1)).toBe('water'))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/1/tags')
  })

  it('resolves multiple challenge ids independently', async () => {
    apiRequestMock.get.mockImplementation((url: string) => {
      if (url === 'api/v2/challenge/1/tags') return tagsResponse(['road'])
      if (url === 'api/v2/challenge/2/tags') return tagsResponse(['bicycle'])
      return tagsResponse([])
    })

    const { result } = renderHookWithClient(() => useChallengeTypes([1, 2, 3]))

    await waitFor(() => {
      expect(result.current.get(1)).toBe('road')
      expect(result.current.get(2)).toBe('bike')
    })

    expect(result.current.has(3)).toBe(false)
    expect(result.current.size).toBe(2)
  })

  it('omits challenges whose tags do not resolve to a known task type', async () => {
    apiRequestMock.get.mockReturnValue(tagsResponse(['mystery', 'unknown']))

    const { result } = renderHookWithClient(() => useChallengeTypes([5]))

    await waitFor(() => expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/5/tags'))

    expect(result.current.has(5)).toBe(false)
  })

  it('does not query for non-positive challenge ids', () => {
    const { result } = renderHookWithClient(() => useChallengeTypes([0, -1]))

    expect(apiRequestMock.get).not.toHaveBeenCalled()
    expect(result.current.size).toBe(0)
  })

  it('recomputes the map when the challenge id list changes', async () => {
    apiRequestMock.get.mockImplementation((url: string) => {
      if (url === 'api/v2/challenge/1/tags') return tagsResponse(['forest'])
      if (url === 'api/v2/challenge/2/tags') return tagsResponse(['building'])
      return tagsResponse([])
    })

    const { result, rerender } = renderHookWithClient((ids: number[]) => useChallengeTypes(ids), {
      initialProps: [1],
    })

    await waitFor(() => expect(result.current.get(1)).toBe('forest'))
    expect(result.current.size).toBe(1)

    rerender([2])

    await waitFor(() => expect(result.current.get(2)).toBe('building'))
    expect(result.current.has(1)).toBe(false)
  })
})
