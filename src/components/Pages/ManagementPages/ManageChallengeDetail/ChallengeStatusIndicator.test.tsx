import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient } from '@/test/queryClient'
import { act, cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { ChallengeStatusIndicator } from './ChallengeStatusIndicator'

// The component reads useQueryClient() to hand off to api.challenge.refreshChallenge.
const renderWithQueryClient = (ui: ReactElement) => {
  const client = createTestQueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const { refreshChallengeMock } = vi.hoisted(() => ({
  refreshChallengeMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        refreshChallenge: refreshChallengeMock,
      },
    },
  }
})

const makeChallenge = (overrides: Partial<Challenge> = {}): Challenge =>
  ({ id: 1, status: 0, statusMessage: null, ...overrides }) as Challenge

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChallengeStatusIndicator', () => {
  it('renders nothing for status None/Ready/Finished/undefined', () => {
    for (const status of [0, 3, 5, undefined]) {
      const { container, unmount } = renderWithQueryClient(
        <ChallengeStatusIndicator challenge={makeChallenge({ status })} challengeId={1} />
      )
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })

  it('shows a building alert and triggers an immediate refresh when status is Building', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator challenge={makeChallenge({ status: 1 })} challengeId={1} />
    )

    expect(screen.getByText('Tasks Building...')).toBeDefined()
    expect(refreshChallengeMock).toHaveBeenCalledTimes(1)
    expect(refreshChallengeMock).toHaveBeenCalledWith(1, expect.anything())
  })

  it('shows an "updating" message instead when the backend reports task status updates', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator
        challenge={makeChallenge({ status: 1, statusMessage: 'Updating Task Statuses' })}
        challengeId={1}
      />
    )

    expect(screen.getByText('Tasks Updating...')).toBeDefined()
  })

  it('auto-refreshes every 10 seconds while building, and stops once unmounted', () => {
    // vi.useRealTimers() must run inside the test body (not the shared afterEach) -
    // restoring timers from a hook after fake timers were active deadlocks under
    // this project's vitest+happy-dom setup.
    try {
      vi.useFakeTimers()
      const { unmount } = renderWithQueryClient(
        <ChallengeStatusIndicator challenge={makeChallenge({ status: 1 })} challengeId={1} />
      )
      expect(refreshChallengeMock).toHaveBeenCalledTimes(1)

      act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(refreshChallengeMock).toHaveBeenCalledTimes(2)

      act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(refreshChallengeMock).toHaveBeenCalledTimes(3)

      unmount()
      act(() => {
        vi.advanceTimersByTime(30000)
      })
      expect(refreshChallengeMock).toHaveBeenCalledTimes(3)
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows a Failed alert with a sanitized (HTML-stripped) status message', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator
        challenge={makeChallenge({
          status: 2,
          statusMessage: '<b>Bad&nbsp;query:</b> failure &amp; retry',
        })}
        challengeId={1}
      />
    )

    expect(screen.getByText('Tasks Failed to Build')).toBeDefined()
    expect(screen.getByText('Bad query: failure & retry')).toBeDefined()
  })

  it('shows a generic Failed body when there is no status message', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator challenge={makeChallenge({ status: 2 })} challengeId={1} />
    )

    expect(
      screen.getByText(
        'The challenge failed to build tasks. Please check the challenge configuration and try again.'
      )
    ).toBeDefined()
  })

  it('shows the Partially Loaded alert for status 4', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator challenge={makeChallenge({ status: 4 })} challengeId={1} />
    )

    expect(screen.getByText('Challenge Partially Loaded')).toBeDefined()
  })

  it('shows the Deleting Tasks alert for status 6', () => {
    renderWithQueryClient(
      <ChallengeStatusIndicator challenge={makeChallenge({ status: 6 })} challengeId={1} />
    )

    expect(screen.getByText('Deleting Tasks...')).toBeDefined()
  })

  it('re-triggers the initial refresh when the challengeId changes while building', () => {
    const client = createTestQueryClient()
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <ChallengeStatusIndicator challenge={makeChallenge({ status: 1 })} challengeId={1} />
      </QueryClientProvider>
    )
    expect(refreshChallengeMock).toHaveBeenCalledTimes(1)

    rerender(
      <QueryClientProvider client={client}>
        <ChallengeStatusIndicator challenge={makeChallenge({ status: 1 })} challengeId={2} />
      </QueryClientProvider>
    )
    expect(refreshChallengeMock).toHaveBeenCalledTimes(2)
    expect(refreshChallengeMock).toHaveBeenLastCalledWith(2, expect.anything())
  })
})
