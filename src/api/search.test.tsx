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

import type { SearchByIdResult, SearchResult } from './search'
import { search } from './search'

describe('search', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  describe('unifiedSearch', () => {
    it('does not search when the query string is empty', () => {
      const { result } = renderHookWithClient(() => search.unifiedSearch({ q: '' }))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('searches with the default limit when only q is given', async () => {
      const data: SearchResult = {
        projects: [{ id: 1, name: 'proj' }],
        challenges: [{ id: 2, name: 'chal' }],
        tasks: [{ id: 3, name: 'task', status: 0, parent: 2, challengeName: 'chal' }],
      }
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(data) })

      const { result } = renderHookWithClient(() => search.unifiedSearch({ q: 'road' }))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/search', {
        searchParams: { q: 'road', limit: 10 },
      })
      expect(result.current.data).toEqual(data)
    })

    it('forwards a custom limit', async () => {
      apiRequestMock.get.mockReturnValue({
        json: () => Promise.resolve({ projects: [], challenges: [], tasks: [] }),
      })

      const { result } = renderHookWithClient(() => search.unifiedSearch({ q: 'road', limit: 25 }))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/search', {
        searchParams: { q: 'road', limit: 25 },
      })
    })
  })

  describe('searchById', () => {
    it('does not search when id is not greater than zero', () => {
      const { result } = renderHookWithClient(() => search.searchById({ id: 0 }))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('does not search for a negative id', () => {
      const { result } = renderHookWithClient(() => search.searchById({ id: -1 }))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('searches by id when id is greater than zero', async () => {
      const data: SearchByIdResult = {
        project: { id: 1, name: 'proj' },
        challenge: null,
        task: null,
      }
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(data) })

      const { result } = renderHookWithClient(() => search.searchById({ id: 7 }))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/search/byId', {
        searchParams: { id: 7 },
      })
      expect(result.current.data).toEqual(data)
    })
  })
})
