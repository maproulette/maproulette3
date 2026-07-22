import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'

const { apiMock, useAuthContextMock, navigateMock } = vi.hoisted(() => ({
  apiMock: {
    project: {
      getProject: vi.fn(),
      getProjectChallenges: vi.fn(),
      useUpdateProject: vi.fn(),
      useDeleteProject: vi.fn(),
    },
    challenge: {
      useDeleteChallenge: vi.fn(),
      useArchiveChallenge: vi.fn(),
      useUpdateChallenge: vi.fn(),
    },
    user: {
      useUpdateUserSettings: vi.fn(),
    },
  },
  useAuthContextMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useParams: () => ({ projectId: '55' }),
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: { ...actual.api.project, ...apiMock.project },
      challenge: { ...actual.api.challenge, ...apiMock.challenge },
      user: { ...actual.api.user, ...apiMock.user },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

import {
  ManageProjectDetailProvider,
  useManageProjectDetailContext,
} from './ManageProjectDetailContext'

function makeProject(props: Partial<Project> & { id: number }): Project {
  return { name: `project-${props.id}`, enabled: true, ...props } as Project
}

function makeChallenge(props: Partial<Challenge> & { id: number }): Challenge {
  return { name: `challenge-${props.id}`, enabled: true, ...props } as Challenge
}

function makeUser(props: Partial<User> & { id: number }): User {
  return { guest: false, properties: {}, ...props } as unknown as User
}

const mutateProjectMock = vi.fn()
const deleteProjectMutateMock = vi.fn()
const deleteChallengeMutateMock = vi.fn()
const archiveChallengeMutateMock = vi.fn()
const updateChallengeMutateMock = vi.fn()
const updateSettingsMutateMock = vi.fn()

const defaultProject = makeProject({ id: 55, name: 'Alpha', displayName: 'Alpha Project' })

const defaultChallenges: Challenge[] = [
  makeChallenge({
    id: 1,
    name: 'Fix potholes',
    enabled: true,
    completionMetrics: { tasksRemaining: 3 } as Challenge['completionMetrics'],
  }),
  makeChallenge({
    id: 2,
    name: 'Map buildings',
    enabled: false,
    isArchived: true,
    completionMetrics: { tasksRemaining: 7 } as Challenge['completionMetrics'],
  }),
  makeChallenge({
    id: 3,
    name: 'Survey roads',
    enabled: true,
    completionMetrics: { tasksRemaining: 0 } as Challenge['completionMetrics'],
  }),
]

const wrapper = ({ children }: { children: ReactNode }) => (
  <ManageProjectDetailProvider>{children}</ManageProjectDetailProvider>
)

beforeEach(() => {
  vi.clearAllMocks()

  apiMock.project.getProject.mockReturnValue({ data: defaultProject, isLoading: false })
  apiMock.project.getProjectChallenges.mockReturnValue({
    data: defaultChallenges,
    isLoading: false,
  })
  apiMock.project.useUpdateProject.mockReturnValue({ mutate: mutateProjectMock })
  apiMock.project.useDeleteProject.mockReturnValue({ mutate: deleteProjectMutateMock })
  apiMock.challenge.useDeleteChallenge.mockReturnValue({ mutate: deleteChallengeMutateMock })
  apiMock.challenge.useArchiveChallenge.mockReturnValue({ mutate: archiveChallengeMutateMock })
  apiMock.challenge.useUpdateChallenge.mockReturnValue({ mutate: updateChallengeMutateMock })
  apiMock.user.useUpdateUserSettings.mockReturnValue({ mutate: updateSettingsMutateMock })

  useAuthContextMock.mockReturnValue({
    user: makeUser({ id: 7 }),
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

describe('useManageProjectDetailContext', () => {
  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useManageProjectDetailContext())).toThrow(
      'useManageProjectDetailContext must be used within ManageProjectDetailProvider'
    )
  })

  it('exposes the projectId from route params and fetched project/challenges data', () => {
    const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

    expect(result.current.projectId).toBe('55')
    expect(apiMock.project.getProject).toHaveBeenCalledWith(55)
    expect(apiMock.project.getProjectChallenges).toHaveBeenCalledWith(55)
    expect(result.current.project).toEqual(defaultProject)
    expect(result.current.projectData).toEqual(defaultProject)
    expect(result.current.challenges).toEqual(defaultChallenges)
    expect(result.current.isLoadingProject).toBe(false)
    expect(result.current.isLoadingChallenges).toBe(false)
  })

  it('reflects loading state from the underlying queries', () => {
    apiMock.project.getProject.mockReturnValue({ data: undefined, isLoading: true })
    apiMock.project.getProjectChallenges.mockReturnValue({ data: undefined, isLoading: true })

    const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

    expect(result.current.isLoadingProject).toBe(true)
    expect(result.current.isLoadingChallenges).toBe(true)
    expect(result.current.project).toBeUndefined()
    expect(result.current.challenges).toBeUndefined()
  })

  describe('challengeSummary', () => {
    it('computes total, enabled and tasksRemaining across all challenges', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.challengeSummary).toEqual({
        total: 3,
        enabled: 2,
        tasksRemaining: 10,
      })
    })

    it('returns zeros when there are no challenges', () => {
      apiMock.project.getProjectChallenges.mockReturnValue({ data: undefined, isLoading: false })

      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.challengeSummary).toEqual({ total: 0, enabled: 0, tasksRemaining: 0 })
    })
  })

  describe('pinnedChallengeIds', () => {
    it('derives pinned ids from the user properties', () => {
      useAuthContextMock.mockReturnValue({
        user: makeUser({
          id: 7,
          properties: { mr4: { settings: { pinned: { challenges: [2] } } } },
        }),
        isAuthenticated: true,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.pinnedChallengeIds).toEqual([2])
    })

    it('is empty when there is no user', () => {
      useAuthContextMock.mockReturnValue({
        user: undefined,
        isAuthenticated: false,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.pinnedChallengeIds).toEqual([])
    })
  })

  describe('filteredChallenges', () => {
    it('filters by case-insensitive search query', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setSearchQuery('FIX'))

      expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([1])
    })

    it('filters to only discoverable (enabled) challenges', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setOnlyDiscoverable(true))

      expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([1, 3])
    })

    it('filters to only archived challenges', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setOnlyArchived(true))

      expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([2])
    })

    it('filters to only pinned challenges', () => {
      useAuthContextMock.mockReturnValue({
        user: makeUser({
          id: 7,
          properties: { mr4: { settings: { pinned: { challenges: [3] } } } },
        }),
        isAuthenticated: true,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setOnlyPinned(true))

      expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([3])
    })

    it('sorts pinned challenges first while preserving relative order otherwise', () => {
      useAuthContextMock.mockReturnValue({
        user: makeUser({
          id: 7,
          properties: { mr4: { settings: { pinned: { challenges: [3] } } } },
        }),
        isAuthenticated: true,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([3, 1, 2])
    })

    it('returns an empty array (not undefined) when there are no challenges', () => {
      apiMock.project.getProjectChallenges.mockReturnValue({ data: undefined, isLoading: false })

      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      expect(result.current.filteredChallenges).toEqual([])
    })
  })

  describe('handleArchiveProject', () => {
    it('toggles isArchived to true for a non-archived project', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.handleArchiveProject())

      expect(mutateProjectMock).toHaveBeenCalledWith({
        projectId: 55,
        updates: { isArchived: true },
      })
    })

    it('toggles isArchived to false for an already-archived project', () => {
      apiMock.project.getProject.mockReturnValue({
        data: makeProject({ id: 55, isArchived: true }),
        isLoading: false,
      })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.handleArchiveProject())

      expect(mutateProjectMock).toHaveBeenCalledWith({
        projectId: 55,
        updates: { isArchived: false },
      })
    })

    it('does nothing when the project has not loaded yet', () => {
      apiMock.project.getProject.mockReturnValue({ data: undefined, isLoading: true })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.handleArchiveProject())

      expect(mutateProjectMock).not.toHaveBeenCalled()
    })
  })

  describe('handleToggleEnabled', () => {
    it('toggles the project enabled flag', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.handleToggleEnabled())

      expect(mutateProjectMock).toHaveBeenCalledWith({
        projectId: 55,
        updates: { enabled: false },
      })
    })
  })

  describe('confirmDeleteProject', () => {
    it('deletes the project and clears the confirmation + navigates away on success', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setDeleteProjectConfirm(true))
      act(() => result.current.confirmDeleteProject())

      expect(deleteProjectMutateMock).toHaveBeenCalledWith(
        { projectId: 55 },
        expect.objectContaining({ onSettled: expect.any(Function), onSuccess: expect.any(Function) })
      )

      const { onSettled, onSuccess } = deleteProjectMutateMock.mock.calls[0][1]
      act(() => onSettled())
      expect(result.current.deleteProjectConfirm).toBe(false)

      act(() => onSuccess())
      expect(navigateMock).toHaveBeenCalledWith({ to: '/manage/projects' })
    })

    it('does nothing when the project has not loaded yet', () => {
      apiMock.project.getProject.mockReturnValue({ data: undefined, isLoading: true })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.confirmDeleteProject())

      expect(deleteProjectMutateMock).not.toHaveBeenCalled()
    })
  })

  describe('confirmDeleteChallenge', () => {
    it('deletes the selected challenge and clears the selection on settle', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setDeleteChallengeId(2))
      act(() => result.current.confirmDeleteChallenge())

      expect(deleteChallengeMutateMock).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ onSettled: expect.any(Function) })
      )

      const { onSettled } = deleteChallengeMutateMock.mock.calls[0][1]
      act(() => onSettled())
      expect(result.current.deleteChallengeId).toBeNull()
    })

    it('does nothing when no challenge is selected for deletion', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.confirmDeleteChallenge())

      expect(deleteChallengeMutateMock).not.toHaveBeenCalled()
    })
  })

  describe('toggleChallengePin', () => {
    it('adds a challenge id to the pinned list and persists it via user settings', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.toggleChallengePin(9))

      expect(updateSettingsMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 7,
          properties: expect.objectContaining({
            mr4: expect.objectContaining({
              settings: { pinned: { challenges: [9] } },
            }),
          }),
        })
      )
    })

    it('removes a challenge id that is already pinned', () => {
      useAuthContextMock.mockReturnValue({
        user: makeUser({
          id: 7,
          properties: { mr4: { settings: { pinned: { challenges: [9] } } } },
        }),
        isAuthenticated: true,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.toggleChallengePin(9))

      expect(updateSettingsMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 7,
          properties: expect.objectContaining({
            mr4: expect.objectContaining({ settings: { pinned: { challenges: [] } } }),
          }),
        })
      )
    })

    it('does nothing when there is no authenticated user', () => {
      useAuthContextMock.mockReturnValue({
        user: undefined,
        isAuthenticated: false,
        authLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.toggleChallengePin(9))

      expect(updateSettingsMutateMock).not.toHaveBeenCalled()
    })
  })

  describe('toggleChallengeEnabled', () => {
    it('flips the enabled flag for the given challenge', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.toggleChallengeEnabled(defaultChallenges[0]))

      expect(updateChallengeMutateMock).toHaveBeenCalledWith({
        challengeId: 1,
        updates: { enabled: false },
      })
    })

    it('does nothing when the challenge has no id', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() =>
        result.current.toggleChallengeEnabled({ enabled: true } as unknown as Challenge)
      )

      expect(updateChallengeMutateMock).not.toHaveBeenCalled()
    })
  })

  describe('archiveChallenge', () => {
    it('inverts the isArchived flag it is given', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.archiveChallenge(1, false))

      expect(archiveChallengeMutateMock).toHaveBeenCalledWith({
        challengeId: 1,
        isArchived: true,
      })
    })
  })

  describe('rebuildChallenge', () => {
    it('opens the rebuild modal for a challenge found in the current list', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.rebuildChallenge(2))

      expect(result.current.rebuildModalChallenge).toEqual(defaultChallenges[1])
    })

    it('leaves the rebuild modal closed when the challenge id is not found', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.rebuildChallenge(999))

      expect(result.current.rebuildModalChallenge).toBeNull()
    })
  })

  describe('modal and view state setters', () => {
    it('updates viewMode, clone/delete modal state directly', () => {
      const { result } = renderHook(() => useManageProjectDetailContext(), { wrapper })

      act(() => result.current.setViewMode('list'))
      expect(result.current.viewMode).toBe('list')

      act(() => result.current.setCloneModalChallenge({ id: 4, name: 'Cloned' }))
      expect(result.current.cloneModalChallenge).toEqual({ id: 4, name: 'Cloned' })

      act(() => result.current.setCloneModalChallenge(null))
      expect(result.current.cloneModalChallenge).toBeNull()

      act(() => result.current.setDeleteProjectConfirm(true))
      expect(result.current.deleteProjectConfirm).toBe(true)
    })
  })
})
