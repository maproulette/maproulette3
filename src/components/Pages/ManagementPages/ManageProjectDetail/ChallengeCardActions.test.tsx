import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { ChallengeCardActions } from './ChallengeCardActions'

const { openMoveModalMock } = vi.hoisted(() => ({
  openMoveModalMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      params,
      className,
    }: {
      children?: ReactNode
      to?: string
      params?: Record<string, string>
      className?: string
    }) => (
      <a href={to} data-params={params ? JSON.stringify(params) : undefined} className={className}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/contexts/MoveChallengeContext', () => ({
  useMoveChallengeContext: () => ({
    challenge: null,
    currentProjectId: 1,
    isOpen: false,
    openMoveModal: openMoveModalMock,
    closeMoveModal: vi.fn(),
    moveChallengeTo: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

function makeChallenge(props: Partial<Challenge> & { id: number }): Challenge {
  return { name: `challenge-${props.id}`, enabled: true, isArchived: false, ...props } as Challenge
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Open menu' }))
}

describe('ChallengeCardActions', () => {
  const onTogglePin = vi.fn()
  const onToggleEnabled = vi.fn()
  const onClone = vi.fn()
  const onArchive = vi.fn()
  const onRebuild = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => cleanup())

  const renderActions = (challenge: Challenge, isPinned = false) =>
    render(
      <ChallengeCardActions
        challenge={challenge}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        onToggleEnabled={onToggleEnabled}
        onClone={onClone}
        onArchive={onArchive}
        onRebuild={onRebuild}
        onDelete={onDelete}
      />
    )

  describe('pin button', () => {
    it('invokes onTogglePin with the challenge id when unpinned', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1 }), false)

      await user.click(screen.getByRole('button', { name: 'Pin challenge' }))

      expect(onTogglePin).toHaveBeenCalledWith(1)
    })

    it('shows the unpin label and invokes onTogglePin when already pinned', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1 }), true)

      const button = screen.getByRole('button', { name: 'Unpin challenge' })
      await user.click(button)

      expect(onTogglePin).toHaveBeenCalledWith(1)
    })

    it('is not rendered when the challenge has no id', () => {
      renderActions({ name: 'no-id-challenge', enabled: true } as unknown as Challenge)

      expect(screen.queryByRole('button', { name: 'Pin challenge' })).toBeNull()
    })
  })

  describe('visibility toggle button', () => {
    it('invokes onToggleEnabled with the challenge and shows "make not discoverable" when enabled', async () => {
      const user = userEvent.setup()
      const challenge = makeChallenge({ id: 1, enabled: true })
      renderActions(challenge)

      await user.click(screen.getByRole('button', { name: 'Make not discoverable' }))

      expect(onToggleEnabled).toHaveBeenCalledWith(challenge)
    })

    it('shows "make discoverable" when the challenge is disabled', async () => {
      const user = userEvent.setup()
      const challenge = makeChallenge({ id: 1, enabled: false })
      renderActions(challenge)

      await user.click(screen.getByRole('button', { name: 'Make discoverable' }))

      expect(onToggleEnabled).toHaveBeenCalledWith(challenge)
    })
  })

  describe('overflow menu', () => {
    it('shows "Start challenge" only when tasks remain', async () => {
      const user = userEvent.setup()
      renderActions(
        makeChallenge({
          id: 1,
          completionMetrics: { tasksRemaining: 2 } as Challenge['completionMetrics'],
        })
      )

      await openMenu(user)

      expect(screen.getByText('Start challenge')).toBeDefined()
    })

    it('hides "Start challenge" when there are no tasks remaining', async () => {
      const user = userEvent.setup()
      renderActions(
        makeChallenge({
          id: 1,
          completionMetrics: { tasksRemaining: 0 } as Challenge['completionMetrics'],
        })
      )

      await openMenu(user)

      expect(screen.queryByText('Start challenge')).toBeNull()
    })

    it('always renders an edit challenge link', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 42 }))

      await openMenu(user)

      const editLink = screen.getByText('Edit challenge').closest('a')
      expect(editLink?.getAttribute('href')).toBe('/manage/challenge/$challengeId/edit')
      expect(editLink?.getAttribute('data-params')).toBe(JSON.stringify({ challengeId: '42' }))
    })

    it('invokes openMoveModal with the challenge id and name when moving', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1, name: 'My Challenge' }))

      await openMenu(user)
      await user.click(screen.getByText('Move challenge'))

      expect(openMoveModalMock).toHaveBeenCalledWith({ id: 1, name: 'My Challenge' })
    })

    it('invokes onClone with the challenge id and name', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1, name: 'My Challenge' }))

      await openMenu(user)
      await user.click(screen.getByText('Clone challenge'))

      expect(onClone).toHaveBeenCalledWith({ id: 1, name: 'My Challenge' })
    })

    it('invokes onArchive with the current isArchived flag and shows "Archive challenge" when not archived', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1, isArchived: false }))

      await openMenu(user)
      await user.click(screen.getByText('Archive challenge'))

      expect(onArchive).toHaveBeenCalledWith(1, false)
    })

    it('shows "Unarchive challenge" and invokes onArchive when already archived', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1, isArchived: true }))

      await openMenu(user)
      await user.click(screen.getByText('Unarchive challenge'))

      expect(onArchive).toHaveBeenCalledWith(1, true)
    })

    it('invokes onRebuild with the challenge id', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 7 }))

      await openMenu(user)
      await user.click(screen.getByText('Rebuild tasks'))

      expect(onRebuild).toHaveBeenCalledWith(7)
    })

    it('invokes onToggleEnabled from the "Disable challenge" menu item when enabled', async () => {
      const user = userEvent.setup()
      const challenge = makeChallenge({ id: 1, enabled: true })
      renderActions(challenge)

      await openMenu(user)
      await user.click(screen.getByText('Disable challenge'))

      expect(onToggleEnabled).toHaveBeenCalledWith(challenge)
    })

    it('shows "Enable challenge" from the menu when disabled', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 1, enabled: false }))

      await openMenu(user)

      expect(screen.getByText('Enable challenge')).toBeDefined()
    })

    it('invokes onDelete with the challenge id', async () => {
      const user = userEvent.setup()
      renderActions(makeChallenge({ id: 9 }))

      await openMenu(user)
      await user.click(screen.getByText('Delete challenge'))

      expect(onDelete).toHaveBeenCalledWith(9)
    })

    it('only renders "Edit challenge" and "Move challenge" when the challenge has no id', async () => {
      const user = userEvent.setup()
      renderActions({ name: 'no-id-challenge', enabled: true } as unknown as Challenge)

      await openMenu(user)

      expect(screen.getByText('Edit challenge')).toBeDefined()
      expect(screen.getByText('Move challenge')).toBeDefined()
      expect(screen.queryByText('Clone challenge')).toBeNull()
      expect(screen.queryByText('Archive challenge')).toBeNull()
      expect(screen.queryByText('Rebuild tasks')).toBeNull()
      expect(screen.queryByText('Delete challenge')).toBeNull()
    })
  })
})
