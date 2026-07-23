// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import { stubFetch } from '@/test/stubFetch'
import { waitFor } from '@/test/waitFor'
import { search } from './search'

afterEach(() => {
  vi.unstubAllGlobals()
})

const emptyResult = { projects: [], challenges: [], tasks: [] }

describe('search.unifiedSearch', () => {
  it('is disabled when q is empty', () => {
    const fetchMock = stubFetch(new Response(JSON.stringify(emptyResult), { status: 200 }))

    const { result } = renderHook(() => search.unifiedSearch({ q: '' }), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches unified search results with the default limit when q is non-empty', async () => {
    const response = {
      projects: [{ id: 1, name: 'Project A' }],
      challenges: [{ id: 2, name: 'Challenge A' }],
      tasks: [{ id: 3, name: 'Task A', status: 0, parent: 2, challengeName: 'Challenge A' }],
    }
    const fetchMock = stubFetch(new Response(JSON.stringify(response), { status: 200 }))

    const { result } = renderHook(() => search.unifiedSearch({ q: 'road' }), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    const [request] = fetchMock.mock.calls[0]
    expect(request.url).toContain('q=road')
    expect(request.url).toContain('limit=10')
  })

  it('honors an explicit limit', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify(emptyResult), { status: 200 }))

    renderHook(() => search.unifiedSearch({ q: 'road', limit: 25 }), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [request] = fetchMock.mock.calls[0]
    expect(request.url).toContain('limit=25')
  })

  it('uses previous data as a placeholder while refetching with a new q', async () => {
    const responses = [
      new Response(JSON.stringify({ ...emptyResult, projects: [{ id: 1, name: 'Project A' }] }), {
        status: 200,
      }),
      new Response(JSON.stringify({ ...emptyResult, projects: [{ id: 2, name: 'Project B' }] }), {
        status: 200,
      }),
    ]
    let call = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_request: Request) => responses[call++])
    )

    const { result, rerender } = renderHook((q: string) => search.unifiedSearch({ q }), {
      wrapper: queryClientWrapper(),
      initialProps: 'road',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.projects).toEqual([{ id: 1, name: 'Project A' }])

    rerender('bridge')
    await waitFor(() =>
      expect(result.current.data?.projects).toEqual([{ id: 2, name: 'Project B' }])
    )
  })
})

describe('search.searchById', () => {
  it('is disabled when id is not greater than 0', () => {
    const fetchMock = stubFetch(new Response('{}', { status: 200 }))

    const { result } = renderHook(() => search.searchById({ id: 0 }), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches search-by-id results when id is greater than 0', async () => {
    const response = {
      project: { id: 1, name: 'Project A' },
      challenge: null,
      task: null,
    }
    const fetchMock = stubFetch(new Response(JSON.stringify(response), { status: 200 }))

    const { result } = renderHook(() => search.searchById({ id: 1 }), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    const [request] = fetchMock.mock.calls[0]
    expect(request.url).toContain('id=1')
  })

  it('uses previous data as a placeholder while refetching with a new id', async () => {
    const responses = [
      new Response(
        JSON.stringify({ project: { id: 1, name: 'Project A' }, challenge: null, task: null }),
        { status: 200 }
      ),
      new Response(
        JSON.stringify({ project: { id: 2, name: 'Project B' }, challenge: null, task: null }),
        { status: 200 }
      ),
    ]
    let call = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_request: Request) => responses[call++])
    )

    const { result, rerender } = renderHook((id: number) => search.searchById({ id }), {
      wrapper: queryClientWrapper(),
      initialProps: 1,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.project?.id).toBe(1)

    rerender(2)
    await waitFor(() => expect(result.current.data?.project?.id).toBe(2))
  })
})
