import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { ManageChallengeEdit } from './index'

const {
  getChallengeMock,
  useUpdateChallengeMock,
  getProjectMock,
  getManagedProjectsMock,
  useAuthContextMock,
  useParamsMock,
  navigateMock,
  updateChallengeMutateAsync,
} = vi.hoisted(() => ({
  getChallengeMock: vi.fn(),
  useUpdateChallengeMock: vi.fn(),
  getProjectMock: vi.fn(),
  getManagedProjectsMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  useParamsMock: vi.fn(),
  navigateMock: vi.fn(),
  updateChallengeMutateAsync: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useParams: useParamsMock,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        getChallenge: getChallengeMock,
        useUpdateChallenge: useUpdateChallengeMock,
      },
      project: {
        ...actual.api.project,
        getProject: getProjectMock,
        getManagedProjects: getManagedProjectsMock,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const fakeUser = { osmProfile: { id: 1, displayName: 'TestUser' }, grants: [] } as unknown as User

const existingChallenge = {
  id: 5,
  parent: 10,
  name: 'Existing Challenge',
  description: 'Existing description',
  instruction: 'Existing instructions',
  difficulty: 2,
  overpassQL: 'existing overpass query',
  remoteGeoJson: '',
} as unknown as Challenge

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  useParamsMock.mockReturnValue({ challengeId: '5' })
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  getProjectMock.mockReturnValue({ data: undefined, isLoading: false })
  getManagedProjectsMock.mockReturnValue({ data: [], isLoading: false, isFetching: false })
  useUpdateChallengeMock.mockReturnValue({ mutateAsync: updateChallengeMutateAsync })
  updateChallengeMutateAsync.mockResolvedValue(undefined)
})

describe('ManageChallengeEdit', () => {
  it('shows loading skeletons while the challenge is being fetched', () => {
    getChallengeMock.mockReturnValue({ data: undefined, isLoading: true })

    render(<ManageChallengeEdit />)

    expect(screen.getByText('Challenge Editor')).toBeDefined()
    expect(screen.queryByRole('button', { name: /update challenge/i })).toBeNull()
  })

  it('converts the challengeId route param to a number and loads that challenge', () => {
    useParamsMock.mockReturnValue({ challengeId: '5' })
    getChallengeMock.mockReturnValue({ data: existingChallenge, isLoading: false })

    render(<ManageChallengeEdit />)

    expect(getChallengeMock).toHaveBeenCalledWith(5)
    expect(screen.getByDisplayValue('Existing Challenge')).toBeDefined()
  })

  it('submits the edited challenge and navigates back to the challenge page', async () => {
    const user = userEvent.setup()
    getChallengeMock.mockReturnValue({ data: existingChallenge, isLoading: false })

    render(<ManageChallengeEdit />)

    await user.click(screen.getByRole('button', { name: /update challenge/i }))

    expect(updateChallengeMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ challengeId: 5 })
    )
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/challenge/$challengeId',
      params: { challengeId: '5' },
    })
  })

  it('cancelling the form navigates back without saving', async () => {
    const user = userEvent.setup()
    getChallengeMock.mockReturnValue({ data: existingChallenge, isLoading: false })

    render(<ManageChallengeEdit />)

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(updateChallengeMutateAsync).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/challenge/$challengeId',
      params: { challengeId: '5' },
    })
  })
})
