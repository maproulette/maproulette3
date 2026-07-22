import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import { MoveChallengeModal } from './index'

const { getManagedProjectsMock, useMoveChallengeContextMock } = vi.hoisted(() => ({
  getManagedProjectsMock: vi.fn(),
  useMoveChallengeContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: {
        ...actual.api.project,
        getManagedProjects: getManagedProjectsMock,
      },
    },
  }
})

vi.mock('@/contexts/MoveChallengeContext', () => ({
  useMoveChallengeContext: useMoveChallengeContextMock,
}))

const makeProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: 1,
    name: 'project-one',
    displayName: 'Project One',
    ...overrides,
  }) as unknown as Project

afterEach(() => cleanup())

const closeMoveModal = vi.fn()
const moveChallengeTo = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  useMoveChallengeContextMock.mockReturnValue({
    challenge: { id: 42, name: 'Fix sidewalks' },
    currentProjectId: 1,
    isOpen: true,
    closeMoveModal,
    moveChallengeTo,
    isPending: false,
    isError: false,
  })
  getManagedProjectsMock.mockReturnValue({ data: [], isLoading: false })
})

describe('MoveChallengeModal', () => {
  it('does not render dialog content when closed', () => {
    useMoveChallengeContextMock.mockReturnValue({
      challenge: null,
      currentProjectId: 1,
      isOpen: false,
      closeMoveModal,
      moveChallengeTo,
      isPending: false,
      isError: false,
    })

    render(<MoveChallengeModal />)

    expect(screen.queryByText('Move Challenge')).toBeNull()
  })

  it('shows a loading spinner while candidate projects are loading', () => {
    getManagedProjectsMock.mockReturnValue({ data: [], isLoading: true })

    render(<MoveChallengeModal />)

    expect(screen.getByText('Move Challenge')).toBeDefined()
    expect(screen.queryByText(/no other projects found/i)).toBeNull()
  })

  it('shows the "no projects" message when there are no candidate projects', () => {
    getManagedProjectsMock.mockReturnValue({ data: [], isLoading: false })

    render(<MoveChallengeModal />)

    expect(screen.getByText(/no other projects found/i)).toBeDefined()
  })

  it('excludes the current project from the candidate list', () => {
    getManagedProjectsMock.mockReturnValue({
      data: [
        makeProject({ id: 1, displayName: 'Current Project' }),
        makeProject({ id: 2, displayName: 'Other Project' }),
      ],
      isLoading: false,
    })

    render(<MoveChallengeModal />)

    expect(screen.queryByText('Current Project')).toBeNull()
    expect(screen.getByText('Other Project')).toBeDefined()
  })

  it('shows the challenge name being moved in the description', () => {
    getManagedProjectsMock.mockReturnValue({ data: [], isLoading: false })

    render(<MoveChallengeModal />)

    expect(screen.getByText(/Fix sidewalks/)).toBeDefined()
  })

  it('confirm: clicking a candidate project calls moveChallengeTo with that project id', async () => {
    const user = userEvent.setup()
    getManagedProjectsMock.mockReturnValue({
      data: [makeProject({ id: 2, displayName: 'Target Project' })],
      isLoading: false,
    })

    render(<MoveChallengeModal />)

    await user.click(screen.getByText('Target Project'))

    expect(moveChallengeTo).toHaveBeenCalledWith(2)
    expect(closeMoveModal).not.toHaveBeenCalled()
  })

  it('cancel: closing the dialog calls closeMoveModal and never moveChallengeTo', async () => {
    const user = userEvent.setup()
    getManagedProjectsMock.mockReturnValue({
      data: [makeProject({ id: 2, displayName: 'Target Project' })],
      isLoading: false,
    })

    render(<MoveChallengeModal />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(closeMoveModal).toHaveBeenCalledTimes(1)
    expect(moveChallengeTo).not.toHaveBeenCalled()
  })

  it('disables candidate buttons while a move is pending', () => {
    useMoveChallengeContextMock.mockReturnValue({
      challenge: { id: 42, name: 'Fix sidewalks' },
      currentProjectId: 1,
      isOpen: true,
      closeMoveModal,
      moveChallengeTo,
      isPending: true,
      isError: false,
    })
    getManagedProjectsMock.mockReturnValue({
      data: [makeProject({ id: 2, displayName: 'Target Project' })],
      isLoading: false,
    })

    render(<MoveChallengeModal />)

    expect(screen.getByRole('button', { name: /target project/i })).toHaveProperty('disabled', true)
  })

  it('shows an error message when the move mutation fails', () => {
    useMoveChallengeContextMock.mockReturnValue({
      challenge: { id: 42, name: 'Fix sidewalks' },
      currentProjectId: 1,
      isOpen: true,
      closeMoveModal,
      moveChallengeTo,
      isPending: false,
      isError: true,
    })

    render(<MoveChallengeModal />)

    expect(screen.getByText(/failed to move challenge/i)).toBeDefined()
  })

  it('filters candidate projects as the user types in the search bar', async () => {
    const user = userEvent.setup()
    getManagedProjectsMock.mockReturnValue({
      data: [makeProject({ id: 2, displayName: 'Alpha Project' })],
      isLoading: false,
    })

    render(<MoveChallengeModal />)

    await user.type(screen.getByPlaceholderText('Search projects...'), 'alpha')

    expect(getManagedProjectsMock).toHaveBeenCalledWith(
      expect.objectContaining({ searchString: 'alpha' })
    )
  })
})
