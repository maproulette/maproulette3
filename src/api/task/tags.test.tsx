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

import type { Keyword } from './tags'
import { taskTags } from './tags'

function makeKeyword(props: Partial<Keyword> = {}): Keyword {
  return { id: 1, name: 'keyword' as unknown, ...props } as unknown as Keyword
}

describe('taskTags', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  describe('getTaskTags', () => {
    it('fetches the tags for a task id', async () => {
      const tags = [makeKeyword({ id: 1 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(tags) })

      const { result } = renderHookWithClient(() => taskTags.getTaskTags(5))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/5/tags')
      expect(result.current.data).toEqual(tags)
    })

    it('does not fetch when taskId is falsy', () => {
      const { result } = renderHookWithClient(() => taskTags.getTaskTags(0))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('searchKeywords', () => {
    it('fetches keywords with prefix, defaulted tagType and limit', async () => {
      const keywords = [makeKeyword({ id: 2 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(keywords) })

      const { result } = renderHookWithClient(() => taskTags.searchKeywords('foo'))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/keywords/find', {
        searchParams: { prefix: 'foo', tagType: 'tasks', limit: 10 },
      })
      expect(result.current.data).toEqual(keywords)
    })

    it('passes through an explicit tagType and limit', async () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

      const { result } = renderHookWithClient(() => taskTags.searchKeywords('bar', 'challenges', 5))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/keywords/find', {
        searchParams: { prefix: 'bar', tagType: 'challenges', limit: 5 },
      })
    })

    it('does not fetch when prefix is empty', () => {
      const { result } = renderHookWithClient(() => taskTags.searchKeywords(''))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('useUpdateTaskTags', () => {
    it('GETs the tags/update endpoint with joined tags and invalidates the tags and task caches on success', async () => {
      apiRequestMock.get.mockReturnValue(Promise.resolve(undefined))

      const { result, queryClient } = renderHookWithClient(() => taskTags.useUpdateTaskTags())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 9, tags: ['x', 'y'] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/9/tags/update', {
        searchParams: { tags: 'x,y' },
      })
      expect(result.current.data).toEqual(['x', 'y'])
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 9, 'tags'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 9] })
    })
  })
})
