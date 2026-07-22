import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { SavedChallengesSection } from './SavedChallengesSection'

interface LinkMockProps {
  to: string
  params?: Record<string, string>
  children?: ReactNode
  className?: string
}

const { savedChallengesMock } = vi.hoisted(() => ({
  savedChallengesMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        savedChallenges: savedChallengesMock,
      },
    },
  }
})

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children, className }: LinkMockProps) => {
    const href = params ? Object.values(params).reduce((p, v) => p.replace(/\$\w+/, v), to) : to
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

const makeChallenge = (overrides: Partial<Challenge> = {}): Challenge =>
  ({
    id: 1,
    name: 'Test Challenge',
    completionPercentage: 0,
    completionMetrics: { tasksRemaining: 0 },
    ...overrides,
  }) as unknown as Challenge

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SavedChallengesSection', () => {
  it('shows a loader while challenges are loading', () => {
    savedChallengesMock.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(<SavedChallengesSection userId={1} />)

    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows an error message when the request fails', () => {
    savedChallengesMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error() })

    render(<SavedChallengesSection userId={1} />)

    expect(screen.getByText('Failed to load')).toBeDefined()
  })

  it('shows an empty state when there are no saved challenges', () => {
    savedChallengesMock.mockReturnValue({ data: [], isLoading: false, error: null })

    render(<SavedChallengesSection userId={1} />)

    expect(screen.getByText('No saved challenges')).toBeDefined()
    expect(screen.getByText('Save challenges to work on later')).toBeDefined()
  })

  it('renders each saved challenge with name, remaining tasks, and completion percentage', () => {
    savedChallengesMock.mockReturnValue({
      data: [
        makeChallenge({
          id: 7,
          name: 'Fix the Roads',
          completionPercentage: 42,
          completionMetrics: { tasksRemaining: 8 } as Challenge['completionMetrics'],
        }),
      ],
      isLoading: false,
      error: null,
    })

    render(<SavedChallengesSection userId={1} />)

    expect(screen.getByText('1')).toBeDefined() // count badge
    expect(screen.getByText('Fix the Roads')).toBeDefined()
    expect(screen.getByText('8 remaining')).toBeDefined()
    expect(screen.getByText('42%')).toBeDefined()
  })

  it('defaults remaining count and completion percentage to 0 when missing', () => {
    savedChallengesMock.mockReturnValue({
      data: [makeChallenge({ completionMetrics: undefined, completionPercentage: undefined })],
      isLoading: false,
      error: null,
    })

    render(<SavedChallengesSection userId={1} />)

    expect(screen.getByText('0 remaining')).toBeDefined()
    expect(screen.getByText('0%')).toBeDefined()
  })

  it('links each challenge to its detail page', () => {
    savedChallengesMock.mockReturnValue({
      data: [makeChallenge({ id: 99 })],
      isLoading: false,
      error: null,
    })

    render(<SavedChallengesSection userId={1} />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/challenge/99')
  })
})
