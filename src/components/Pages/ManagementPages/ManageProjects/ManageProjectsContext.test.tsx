import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'

const { apiProjectMock, apiUserMock, useAuthContextMock, useQueryMock } = vi.hoisted(() => ({
  apiProjectMock: {
    getManagedProjects: vi.fn(),
    useUpdateProject: vi.fn(),
    useDeleteProject: vi.fn(),
    exportProjectTasksCsv: vi.fn(),
  },
  apiUserMock: {
    useUpdateUserSettings: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
  useQueryMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    project: apiProjectMock,
    user: apiUserMock,
    challenge: {
      getChallengesListingOptions: vi.fn().mockReturnValue({ queryKey: ['test'] }),
    },
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: useQueryMock,
}))

import { ManageProjectsProvider, useManageProjectsContext } from './ManageProjectsContext'

const makeProject = (overrides: Partial<Project>): Project =>
  ({
    name: overrides.name ?? 'project',
    enabled: true,
    deleted: false,
    featured: false,
    ...overrides,
  }) as Project

const makeUser = (properties?: Record<string, unknown>, id = 1) =>
  ({ id, properties }) as unknown as User

const wrapper = ({ children }: { children: ReactNode }) => (
  <ManageProjectsProvider>{children}</ManageProjectsProvider>
)

let updateProjectMutate: ReturnType<typeof vi.fn>
let deleteProjectMutate: ReturnType<typeof vi.fn>
let updateSettingsMutate: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()

  updateProjectMutate = vi.fn()
  deleteProjectMutate = vi.fn()
  updateSettingsMutate = vi.fn()

  apiProjectMock.getManagedProjects.mockReturnValue({
    data: [],
    isLoading: false,
    isFetching: false,
  })
  apiProjectMock.useUpdateProject.mockReturnValue({ mutate: updateProjectMutate })
  apiProjectMock.useDeleteProject.mockReturnValue({ mutate: deleteProjectMutate })
  apiProjectMock.exportProjectTasksCsv.mockResolvedValue(undefined)
  apiUserMock.useUpdateUserSettings.mockReturnValue({ mutate: updateSettingsMutate })
  useAuthContextMock.mockReturnValue({ user: makeUser() })
  useQueryMock.mockReturnValue({ data: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useManageProjectsContext', () => {
  it('throws a helpful error when used outside of a ManageProjectsProvider', () => {
    expect(() => renderHook(() => useManageProjectsContext())).toThrow(
      'useManageProjectsContext must be used within a ManageProjectsProvider'
    )
  })

  it('exposes the raw projects list and loading/fetching state from the query', () => {
    const projects = [makeProject({ id: 1, name: 'a' }), makeProject({ id: 2, name: 'b' })]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: true,
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    expect(result.current.projects).toEqual(projects)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(true)
  })

  it('filters projectsToShow to non-archived projects by default', () => {
    const projects = [
      makeProject({ id: 1, name: 'active', isArchived: false }),
      makeProject({ id: 2, name: 'archived', isArchived: true }),
    ]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    expect(result.current.projectsToShow.map((p) => p.id)).toEqual([1])
  })

  it('shows only archived projects once onlyShowArchived is toggled on', () => {
    const projects = [
      makeProject({ id: 1, name: 'active', isArchived: false }),
      makeProject({ id: 2, name: 'archived', isArchived: true }),
    ]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.setOnlyShowArchived(true))

    expect(result.current.projectsToShow.map((p) => p.id)).toEqual([2])
  })

  it('sorts pinned projects to the front while preserving relative order otherwise', () => {
    const projects = [
      makeProject({ id: 1, name: 'first' }),
      makeProject({ id: 2, name: 'second' }),
      makeProject({ id: 3, name: 'third' }),
    ]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: false,
    })
    useAuthContextMock.mockReturnValue({
      user: makeUser({ mr4: { settings: { pinned: { projects: [3] } } } }),
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    expect(result.current.pinnedProjectIds).toEqual([3])
    expect(result.current.projectsToShow.map((p) => p.id)).toEqual([3, 1, 2])
  })

  it('further restricts projectsToShow to pinned projects when onlyShowPinned is set', () => {
    const projects = [makeProject({ id: 1, name: 'first' }), makeProject({ id: 2, name: 'second' })]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: false,
    })
    useAuthContextMock.mockReturnValue({
      user: makeUser({ mr4: { settings: { pinned: { projects: [2] } } } }),
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })
    act(() => result.current.setOnlyShowPinned(true))

    expect(result.current.projectsToShow.map((p) => p.id)).toEqual([2])
  })

  it('computes hasNextPage from whether a full page of results was returned', () => {
    const fullPage = Array.from({ length: 20 }, (_, i) => makeProject({ id: i + 1 }))
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: fullPage,
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })
    expect(result.current.hasNextPage).toBe(true)

    apiProjectMock.getManagedProjects.mockReturnValue({
      data: fullPage.slice(0, 5),
      isLoading: false,
      isFetching: false,
    })
    const { result: shortResult } = renderHook(() => useManageProjectsContext(), { wrapper })
    expect(shortResult.current.hasNextPage).toBe(false)
  })

  it('loadMore increases the page limit requested from getManagedProjects', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.loadMore())

    const lastCallArgs = apiProjectMock.getManagedProjects.mock.calls.at(-1)?.[0]
    expect(lastCallArgs).toEqual(expect.objectContaining({ limit: 40 }))
  })

  it('derives challengeCountsByProjectId from the challenges listing query', () => {
    useQueryMock.mockReturnValue({
      data: [
        { id: 1, parent: 10 },
        { id: 2, parent: 10 },
        { id: 3, parent: 20 },
      ],
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    expect(result.current.challengeCountsByProjectId).toEqual({ 10: 2, 20: 1 })
  })

  it('toggleProjectPin adds an unpinned project to the pinned list', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.toggleProjectPin(5))

    expect(updateSettingsMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        properties: { mr4: { settings: { pinned: { projects: [5] } } } },
      })
    )
  })

  it('toggleProjectPin removes an already-pinned project from the pinned list', () => {
    useAuthContextMock.mockReturnValue({
      user: makeUser({ mr4: { settings: { pinned: { projects: [5, 6] } } } }),
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.toggleProjectPin(5))

    expect(updateSettingsMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: { mr4: { settings: { pinned: { projects: [6] } } } },
      })
    )
  })

  it('toggleProjectPin is a no-op when there is no authenticated user id', () => {
    useAuthContextMock.mockReturnValue({ user: undefined })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.toggleProjectPin(5))

    expect(updateSettingsMutate).not.toHaveBeenCalled()
  })

  it('updateProject delegates to the update mutation with the given partial updates', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.updateProject(3, { enabled: false }))

    expect(updateProjectMutate).toHaveBeenCalledWith({ projectId: 3, updates: { enabled: false } })
  })

  it('handleArchiveProject flips the isArchived flag via the update mutation', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.handleArchiveProject(3, false))

    expect(updateProjectMutate).toHaveBeenCalledWith({
      projectId: 3,
      updates: { isArchived: true },
    })
  })

  it('handleExportCsv sanitizes the project name into a safe csv filename', () => {
    const projects = [makeProject({ id: 1, displayName: 'My Cool / Project!' })]
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.handleExportCsv(1))

    expect(apiProjectMock.exportProjectTasksCsv).toHaveBeenCalledWith(
      1,
      'project-My-Cool---Project--tasks.csv'
    )
  })

  it('handleDeleteProject stores a confirmation request without deleting immediately', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.handleDeleteProject(4, 'My Project'))

    expect(result.current.deleteProjectConfirm).toEqual({ projectId: 4, projectName: 'My Project' })
    expect(deleteProjectMutate).not.toHaveBeenCalled()
  })

  it('confirmDeleteProject deletes the pending project and clears the confirmation afterward', () => {
    deleteProjectMutate.mockImplementation((_vars, opts?: { onSettled?: () => void }) => {
      opts?.onSettled?.()
    })

    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.handleDeleteProject(4, 'My Project'))
    act(() => result.current.confirmDeleteProject())

    expect(deleteProjectMutate).toHaveBeenCalledWith(
      { projectId: 4 },
      expect.objectContaining({ onSettled: expect.any(Function) })
    )
    expect(result.current.deleteProjectConfirm).toBeNull()
  })

  it('confirmDeleteProject does nothing when there is no pending confirmation', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.confirmDeleteProject())

    expect(deleteProjectMutate).not.toHaveBeenCalled()
  })

  it('setDeleteProjectConfirm allows manually clearing the confirmation state', () => {
    const { result } = renderHook(() => useManageProjectsContext(), { wrapper })

    act(() => result.current.handleDeleteProject(4, 'My Project'))
    act(() => result.current.setDeleteProjectConfirm(null))

    expect(result.current.deleteProjectConfirm).toBeNull()
  })
})
