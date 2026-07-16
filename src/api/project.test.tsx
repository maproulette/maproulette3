import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'

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

import { project } from './project'

function makeProject(props: Partial<Project> & { id: number }): Project {
  return { name: `project-${props.id}`, enabled: true, ...props } as unknown as Project
}

function makeChallenge(props: Partial<Challenge> & { id: number }): Challenge {
  return { name: `challenge-${props.id}`, ...props } as unknown as Challenge
}

describe('project', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  describe('featuredProjects', () => {
    it('fetches featured projects with default params and caches each by id', async () => {
      const projects = [makeProject({ id: 1 }), makeProject({ id: 2 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(projects) })

      const { result, queryClient } = renderHookWithClient(() => project.featuredProjects())

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/projects/featured', {
        searchParams: { limit: 10, onlyEnabled: true, page: 0 },
      })
      expect(result.current.data).toEqual(projects)
      expect(queryClient.getQueryData(['project', 1])).toEqual(projects[0])
      expect(queryClient.getQueryData(['project', 2])).toEqual(projects[1])
    })

    it('forwards custom limit/onlyEnabled/page params', async () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

      const { result } = renderHookWithClient(() =>
        project.featuredProjects({ limit: 5, onlyEnabled: false, page: 2 })
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/projects/featured', {
        searchParams: { limit: 5, onlyEnabled: false, page: 2 },
      })
    })
  })

  describe('getProject', () => {
    it('fetches a project by id', async () => {
      const singleProject = makeProject({ id: 42 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(singleProject) })

      const { result } = renderHookWithClient(() => project.getProject(42))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/project/42')
      expect(result.current.data).toEqual(singleProject)
    })

    it('does not fetch when projectId is undefined', () => {
      const { result } = renderHookWithClient(() => project.getProject(undefined))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('getProjectOptions', () => {
    it('builds query options that fetch a project by id', async () => {
      const singleProject = makeProject({ id: 7 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(singleProject) })

      const options = project.getProjectOptions(7)

      expect(options.queryKey).toEqual(['project', 7])
      await expect(options.queryFn?.({} as never)).resolves.toEqual(singleProject)
      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/project/7')
    })
  })

  describe('getManagedProjects', () => {
    it('fetches managed projects with default params and caches each by id', async () => {
      const projects = [makeProject({ id: 1 }), makeProject({ id: 2 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(projects) })

      const { result, queryClient } = renderHookWithClient(() => project.getManagedProjects())

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/projects/managed', {
        searchParams: {
          limit: 50,
          page: 0,
          onlyEnabled: false,
          onlyOwned: false,
          searchString: '',
        },
      })
      expect(queryClient.getQueryData(['project', 1])).toEqual(projects[0])
    })

    it('forwards custom params', async () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

      const { result } = renderHookWithClient(() =>
        project.getManagedProjects({
          limit: 20,
          page: 1,
          onlyEnabled: true,
          onlyOwned: true,
          searchString: 'road',
        })
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/projects/managed', {
        searchParams: {
          limit: 20,
          page: 1,
          onlyEnabled: true,
          onlyOwned: true,
          searchString: 'road',
        },
      })
    })
  })

  describe('getProjectChallengesOptions', () => {
    it('builds query options that fetch challenges for a project with default paging', async () => {
      const challenges = [makeChallenge({ id: 1 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(challenges) })

      const options = project.getProjectChallengesOptions(9)

      expect(options.queryKey).toEqual(['project', 'challenges', 9, { limit: 100, page: 0 }])
      await expect(options.queryFn?.({} as never)).resolves.toEqual(challenges)
      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/project/9/challenges', {
        searchParams: { limit: 100, page: 0 },
      })
    })
  })

  describe('getProjectChallenges', () => {
    it('fetches challenges for a project and caches each by id', async () => {
      const challenges = [makeChallenge({ id: 11 }), makeChallenge({ id: 12 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(challenges) })

      const { result, queryClient } = renderHookWithClient(() =>
        project.getProjectChallenges(9, 25, 1)
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/project/9/challenges', {
        searchParams: { limit: 25, page: 1 },
      })
      expect(result.current.data).toEqual(challenges)
      expect(queryClient.getQueryData(['challenge', 11])).toEqual(challenges[0])
      expect(queryClient.getQueryData(['challenge', 12])).toEqual(challenges[1])
    })

    it('does not fetch when projectId is undefined', () => {
      const { result } = renderHookWithClient(() => project.getProjectChallenges(undefined))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('searchProjects', () => {
    it('does not search when the search string is empty', () => {
      const { result } = renderHookWithClient(() => project.searchProjects())

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('searches and caches results by id when given a search string', async () => {
      const projects = [makeProject({ id: 3 })]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(projects) })

      const { result, queryClient } = renderHookWithClient(() =>
        project.searchProjects({ search: 'park' })
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/projects/search', {
        searchParams: { search: 'park' },
      })
      expect(queryClient.getQueryData(['project', 3])).toEqual(projects[0])
    })
  })

  describe('exportProjectTasksCsv', () => {
    it('fetches CSV text and triggers a client-side download with the given filename', async () => {
      apiRequestMock.get.mockReturnValue({ text: () => Promise.resolve('id,name\n1,foo') })
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      await project.exportProjectTasksCsv(3, 'my-export.csv')

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/project/3/tasks/extract')
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
      const [blobArg] = createObjectURLSpy.mock.calls[0]
      expect(blobArg).toBeInstanceOf(Blob)
      expect(clickSpy).toHaveBeenCalledTimes(1)
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url')

      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
      clickSpy.mockRestore()
    })

    it('defaults the filename to project-<id>-tasks.csv when none is given', async () => {
      apiRequestMock.get.mockReturnValue({ text: () => Promise.resolve('id,name') })
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      const anchors: HTMLAnchorElement[] = []
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = originalCreateElement(tag)
        if (tag === 'a') {
          vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {})
          anchors.push(el as HTMLAnchorElement)
        }
        return el
      })

      await project.exportProjectTasksCsv(5)

      expect(anchors[0].download).toBe('project-5-tasks.csv')

      vi.restoreAllMocks()
    })
  })

  describe('useCreateProject', () => {
    it('posts the new project and seeds the cache, prepending to any managed list', async () => {
      const newProject = makeProject({ id: 100, name: 'brand-new' })
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newProject) })

      const { result, queryClient } = renderHookWithClient(() => project.useCreateProject())
      queryClient.setQueryData(['project', 'managed', { limit: 50 }], [makeProject({ id: 1 })])

      result.current.mutate({ name: 'brand-new' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/project', {
        json: { name: 'brand-new' },
      })
      expect(queryClient.getQueryData(['project', 100])).toEqual(newProject)
      expect(queryClient.getQueryData(['project', 'managed', { limit: 50 }])).toEqual([
        newProject,
        makeProject({ id: 1 }),
      ])
    })

    it('sets a fresh managed list when none was cached yet', async () => {
      const newProject = makeProject({ id: 101 })
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newProject) })

      const { result, queryClient } = renderHookWithClient(() => project.useCreateProject())

      result.current.mutate({ name: 'brand-new' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(queryClient.getQueriesData({ queryKey: ['project', 'managed'] })).toEqual([])
    })
  })

  describe('useUpdateProject', () => {
    it('puts the update merged with the id and updates the cache', async () => {
      const updated = makeProject({ id: 5, name: 'renamed' })
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updated) })

      const { result, queryClient } = renderHookWithClient(() => project.useUpdateProject())
      queryClient.setQueryData(
        ['project', 'managed', { limit: 50 }],
        [makeProject({ id: 5, name: 'old' })]
      )

      result.current.mutate({ projectId: 5, updates: { name: 'renamed' } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/project/5', {
        json: { id: 5, name: 'renamed' },
      })
      expect(queryClient.getQueryData(['project', 5])).toEqual(updated)
      expect(queryClient.getQueryData(['project', 'managed', { limit: 50 }])).toEqual([updated])
    })
  })

  describe('useDeleteProject', () => {
    it('deletes without a searchParams when immediate is not set, and updates the cache', async () => {
      apiRequestMock.delete.mockReturnValue(Promise.resolve(undefined))

      const { result, queryClient } = renderHookWithClient(() => project.useDeleteProject())
      queryClient.setQueryData(
        ['project', 'managed', { limit: 50 }],
        [makeProject({ id: 5 }), makeProject({ id: 6 })]
      )
      queryClient.setQueryData(['project', 5], makeProject({ id: 5 }))

      result.current.mutate({ projectId: 5 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/project/5', {
        searchParams: undefined,
      })
      expect(queryClient.getQueryData(['project', 5])).toBeUndefined()
      expect(queryClient.getQueryData(['project', 'managed', { limit: 50 }])).toEqual([
        makeProject({ id: 6 }),
      ])
    })

    it('passes searchParams immediate=true when immediate is requested', async () => {
      apiRequestMock.delete.mockReturnValue(Promise.resolve(undefined))

      const { result } = renderHookWithClient(() => project.useDeleteProject())

      result.current.mutate({ projectId: 5, immediate: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/project/5', {
        searchParams: { immediate: 'true' },
      })
    })
  })

  describe('getProjectStats', () => {
    it('fetches project stats data', async () => {
      const stats = { id: 3, name: 'proj', actions: { total: 10, available: 4 } }
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(stats) })

      const { result } = renderHookWithClient(() => project.getProjectStats(3))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/project/3')
      expect(result.current.data).toEqual(stats)
    })

    it('does not fetch when projectId is undefined', () => {
      const { result } = renderHookWithClient(() => project.getProjectStats(undefined))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })
})
