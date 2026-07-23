// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import { stubFetch } from '@/test/stubFetch'
import { waitFor } from '@/test/waitFor'
import { taskTags } from './tags'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('taskTags.getTaskTags', () => {
  it('fetches the tags for a task', async () => {
    const tags = [{ id: 1, name: 'residential' }]
    stubFetch(new Response(JSON.stringify(tags), { status: 200 }))

    const { result } = renderHook(() => taskTags.getTaskTags(5), { wrapper: queryClientWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(tags)
  })

  it('is disabled when taskId is falsy', () => {
    const fetchMock = stubFetch(new Response('[]', { status: 200 }))

    const { result } = renderHook(() => taskTags.getTaskTags(0), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('taskTags.searchKeywords', () => {
  it('searches with the default tagType and limit', async () => {
    const keywords = [{ id: 1, name: 'test' }]
    const fetchMock = stubFetch(new Response(JSON.stringify(keywords), { status: 200 }))

    const { result } = renderHook(() => taskTags.searchKeywords('tes'), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(keywords)
    const [request] = fetchMock.mock.calls[0] as [Request]
    const url = new URL(request.url)
    expect(url.pathname).toBe('/api/v2/keywords/find')
    expect(url.searchParams.get('prefix')).toBe('tes')
    expect(url.searchParams.get('tagType')).toBe('tasks')
    expect(url.searchParams.get('limit')).toBe('10')
  })

  it('searches with a custom tagType and limit', async () => {
    const fetchMock = stubFetch(new Response('[]', { status: 200 }))

    const { result } = renderHook(() => taskTags.searchKeywords('proj', 'projects', 5), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const [request] = fetchMock.mock.calls[0] as [Request]
    const url = new URL(request.url)
    expect(url.searchParams.get('tagType')).toBe('projects')
    expect(url.searchParams.get('limit')).toBe('5')
  })

  it('is disabled when prefix is empty', () => {
    const fetchMock = stubFetch(new Response('[]', { status: 200 }))

    const { result } = renderHook(() => taskTags.searchKeywords(''), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('taskTags.useUpdateTaskTags', () => {
  it('updates tags and invalidates the task tags and task caches', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 200 }))
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => taskTags.useUpdateTaskTags(), {
      wrapper: queryClientWrapper(queryClient),
    })

    result.current.mutate({ taskId: 5, tags: ['foo', 'bar'] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(['foo', 'bar'])
    const [request] = fetchMock.mock.calls[0] as [Request]
    const url = new URL(request.url)
    expect(url.pathname).toBe('/api/v2/task/5/tags/update')
    expect(url.searchParams.get('tags')).toBe('foo,bar')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 5, 'tags'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 5] })
  })
})
