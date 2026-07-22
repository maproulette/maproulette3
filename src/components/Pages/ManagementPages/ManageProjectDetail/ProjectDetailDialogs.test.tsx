import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { ProjectDetailDialogs } from './ProjectDetailDialogs'

vi.mock(
  '@/components/Pages/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal',
  () => ({
    CloneChallengeModal: ({
      open,
      onOpenChange,
      challengeId,
      challengeName,
      currentProjectId,
    }: {
      open: boolean
      onOpenChange: (open: boolean) => void
      challengeId: number
      challengeName: string
      currentProjectId?: number
    }) =>
      open ? (
        <div data-testid="clone-modal">
          <span>
            Clone {challengeName} ({challengeId}) from {currentProjectId}
          </span>
          <button type="button" onClick={() => onOpenChange(false)}>
            fake-clone-close
          </button>
        </div>
      ) : null,
  })
)

vi.mock('@/components/Pages/ManagementPages/shared/RebuildTasksDialog', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/components/Pages/ManagementPages/shared/RebuildTasksDialog')
    >()
  return {
    ...actual,
    RebuildTasksDialog: ({
      open,
      onOpenChange,
      challengeId,
      sourceType,
    }: {
      open: boolean
      onOpenChange: (open: boolean) => void
      challengeId: number
      sourceType?: string
    }) =>
      open ? (
        <div data-testid="rebuild-modal">
          <span>
            Rebuild {challengeId} ({sourceType})
          </span>
          <button type="button" onClick={() => onOpenChange(false)}>
            fake-rebuild-close
          </button>
        </div>
      ) : null,
  }
})

vi.mock('../MoveChallengeModal', () => ({
  MoveChallengeModal: () => <div data-testid="move-modal" />,
}))

function makeChallenge(props: Partial<Challenge> & { id: number }): Challenge {
  return { name: `challenge-${props.id}`, enabled: true, ...props } as Challenge
}

const baseProps = {
  projectId: '10',
  cloneModalChallenge: null,
  setCloneModalChallenge: vi.fn(),
  rebuildModalChallenge: null,
  setRebuildModalChallenge: vi.fn(),
  deleteChallengeId: null,
  setDeleteChallengeId: vi.fn(),
  confirmDeleteChallenge: vi.fn(),
  deleteProjectConfirm: false,
  setDeleteProjectConfirm: vi.fn(),
  confirmDeleteProject: vi.fn(),
}

describe('ProjectDetailDialogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => cleanup())

  it('always renders the move challenge modal', () => {
    render(<ProjectDetailDialogs {...baseProps} />)
    expect(screen.getByTestId('move-modal')).toBeDefined()
  })

  describe('clone challenge modal', () => {
    it('is not rendered when there is no clone target', () => {
      render(<ProjectDetailDialogs {...baseProps} />)
      expect(screen.queryByTestId('clone-modal')).toBeNull()
    })

    it('renders with the challenge id/name and current project id when a clone target is set', () => {
      render(
        <ProjectDetailDialogs {...baseProps} cloneModalChallenge={{ id: 5, name: 'Fix roads' }} />
      )
      expect(screen.getByText('Clone Fix roads (5) from 10')).toBeDefined()
    })

    it('clears the clone target when the modal reports closed (cancel flow)', async () => {
      const user = userEvent.setup()
      const setCloneModalChallenge = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          cloneModalChallenge={{ id: 5, name: 'Fix roads' }}
          setCloneModalChallenge={setCloneModalChallenge}
        />
      )

      await user.click(screen.getByText('fake-clone-close'))

      expect(setCloneModalChallenge).toHaveBeenCalledWith(null)
    })
  })

  describe('rebuild tasks modal', () => {
    it('is not rendered when there is no rebuild target', () => {
      render(<ProjectDetailDialogs {...baseProps} />)
      expect(screen.queryByTestId('rebuild-modal')).toBeNull()
    })

    it('is not rendered when the rebuild target has no id', () => {
      render(
        <ProjectDetailDialogs
          {...baseProps}
          rebuildModalChallenge={{ name: 'no id' } as unknown as Challenge}
        />
      )
      expect(screen.queryByTestId('rebuild-modal')).toBeNull()
    })

    it('renders with the challenge id and inferred source type', () => {
      render(
        <ProjectDetailDialogs
          {...baseProps}
          rebuildModalChallenge={makeChallenge({ id: 8, overpassQL: 'way[highway]' })}
        />
      )
      expect(screen.getByText('Rebuild 8 (overpass)')).toBeDefined()
    })

    it('clears the rebuild target when the modal reports closed', async () => {
      const user = userEvent.setup()
      const setRebuildModalChallenge = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          rebuildModalChallenge={makeChallenge({ id: 8 })}
          setRebuildModalChallenge={setRebuildModalChallenge}
        />
      )

      await user.click(screen.getByText('fake-rebuild-close'))

      expect(setRebuildModalChallenge).toHaveBeenCalledWith(null)
    })
  })

  describe('delete challenge confirmation', () => {
    it('is closed when there is no challenge selected for deletion', () => {
      render(<ProjectDetailDialogs {...baseProps} />)
      expect(screen.queryByText('Delete challenge?')).toBeNull()
    })

    it('is open and shows a warning when a challenge is selected for deletion', () => {
      render(<ProjectDetailDialogs {...baseProps} deleteChallengeId={3} />)
      expect(screen.getByText('Delete challenge?')).toBeDefined()
      expect(
        screen.getByText(
          'This will delete this challenge and all its tasks. This action cannot be undone.'
        )
      ).toBeDefined()
    })

    it('cancel closes the dialog without invoking the delete callback', async () => {
      const user = userEvent.setup()
      const confirmDeleteChallenge = vi.fn()
      const setDeleteChallengeId = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          deleteChallengeId={3}
          confirmDeleteChallenge={confirmDeleteChallenge}
          setDeleteChallengeId={setDeleteChallengeId}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(confirmDeleteChallenge).not.toHaveBeenCalled()
      expect(setDeleteChallengeId).toHaveBeenCalledWith(null)
    })

    it('confirming delete invokes confirmDeleteChallenge', async () => {
      const user = userEvent.setup()
      const confirmDeleteChallenge = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          deleteChallengeId={3}
          confirmDeleteChallenge={confirmDeleteChallenge}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(confirmDeleteChallenge).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete project confirmation', () => {
    it('is closed by default', () => {
      render(<ProjectDetailDialogs {...baseProps} />)
      expect(screen.queryByText('Delete project?')).toBeNull()
    })

    it('is open and shows a warning when deleteProjectConfirm is true', () => {
      render(<ProjectDetailDialogs {...baseProps} deleteProjectConfirm />)
      expect(screen.getByText('Delete project?')).toBeDefined()
      expect(
        screen.getByText(
          'This will delete this project and all its challenges and tasks. This action cannot be undone.'
        )
      ).toBeDefined()
    })

    it('cancel closes the dialog without invoking the delete callback', async () => {
      const user = userEvent.setup()
      const confirmDeleteProject = vi.fn()
      const setDeleteProjectConfirm = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          deleteProjectConfirm
          confirmDeleteProject={confirmDeleteProject}
          setDeleteProjectConfirm={setDeleteProjectConfirm}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(confirmDeleteProject).not.toHaveBeenCalled()
      expect(setDeleteProjectConfirm).toHaveBeenCalledWith(false)
    })

    it('confirming delete invokes confirmDeleteProject', async () => {
      const user = userEvent.setup()
      const confirmDeleteProject = vi.fn()
      render(
        <ProjectDetailDialogs
          {...baseProps}
          deleteProjectConfirm
          confirmDeleteProject={confirmDeleteProject}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(confirmDeleteProject).toHaveBeenCalledTimes(1)
    })
  })
})
