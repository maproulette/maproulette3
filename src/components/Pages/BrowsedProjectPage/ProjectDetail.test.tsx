import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'

interface LinkMockProps {
  to: string
  params?: Record<string, string>
  children?: ReactNode
  className?: string
}

const { getProjectChallengesMock, useBrowsedProjectContextMock, toastSuccessMock, toastErrorMock } =
  vi.hoisted(() => ({
    getProjectChallengesMock: vi.fn(),
    useBrowsedProjectContextMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: {
        ...actual.api.project,
        getProjectChallenges: getProjectChallengesMock,
      },
    },
  }
})

vi.mock('@/components/Pages/BrowsedProjectPage/contexts/BrowsedProjectContext', () => ({
  useBrowsedProjectContext: useBrowsedProjectContextMock,
}))

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

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { logger } from '@/lib/logger'
import { ProjectDetail } from './ProjectDetail'

const makeProject = (overrides: Partial<Project> & { id: number }): Project =>
  ({
    name: `project-${overrides.id}`,
    enabled: true,
    ...overrides,
  }) as unknown as Project

const makeChallenge = (overrides: Partial<Challenge> & { id: number }): Challenge =>
  ({
    name: `challenge-${overrides.id}`,
    ...overrides,
  }) as unknown as Challenge

// `navigator.language`/`navigator.languages` are accessor properties on
// `Navigator.prototype`, not own properties, so a plain `{ ...navigator }`
// spread silently drops them. IntlProvider reads `navigator.language` to
// resolve the initial locale, so any test that stubs `navigator` must carry
// those fields forward explicitly or rendering breaks with a TypeError.
const stubNavigator = (
  overrides: Omit<Partial<Navigator>, 'clipboard'> & { clipboard?: Partial<Clipboard> }
) => {
  vi.stubGlobal('navigator', {
    language: navigator.language,
    languages: navigator.languages,
    ...overrides,
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

beforeEach(() => {
  vi.clearAllMocks()
  getProjectChallengesMock.mockReturnValue({ data: [] })
})

describe('ProjectDetail', () => {
  it('renders the project name, id, and enabled status', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 5, name: 'roads', displayName: 'Roads Project', enabled: true }),
    })

    render(<ProjectDetail />)

    expect(screen.getByText('Roads Project')).toBeDefined()
    expect(screen.getByText('ID 5')).toBeDefined()
    expect(screen.getByTitle('Discoverable')).toBeDefined()
  })

  it('falls back to the internal name when there is no display name', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 5, name: 'internal-name', displayName: undefined }),
    })

    render(<ProjectDetail />)

    expect(screen.getByText('internal-name')).toBeDefined()
  })

  it('shows Featured and Archived badges only when applicable', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, featured: true, isArchived: true }),
    })

    render(<ProjectDetail />)

    expect(screen.getByText('Featured')).toBeDefined()
    expect(screen.getByText('Archived')).toBeDefined()
  })

  it('omits Featured/Archived badges and owner text when not applicable', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, featured: false, isArchived: false, owner: undefined }),
    })

    render(<ProjectDetail />)

    expect(screen.queryByText('Featured')).toBeNull()
    expect(screen.queryByText('Archived')).toBeNull()
    expect(screen.queryByText(/by /)).toBeNull()
  })

  it('shows the description when present and omits it when absent', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, description: 'A project about roads' }),
    })
    const { rerender } = render(<ProjectDetail />)
    expect(screen.getByText('A project about roads')).toBeDefined()

    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, description: undefined }),
    })
    rerender(<ProjectDetail />)
    expect(screen.queryByText('A project about roads')).toBeNull()
  })

  it('computes completion percentage, challenge count, and remaining tasks from the challenge list', () => {
    useBrowsedProjectContextMock.mockReturnValue({ project: makeProject({ id: 1 }) })
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({
          id: 1,
          completionPercentage: 50,
          completionMetrics: { tasksRemaining: 5 } as Challenge['completionMetrics'],
        }),
        makeChallenge({
          id: 2,
          completionPercentage: 100,
          completionMetrics: { tasksRemaining: 0 } as Challenge['completionMetrics'],
        }),
      ],
    })

    render(<ProjectDetail />)

    // remaining = 5 + 0 = 5; totalTasks = round(5 / (1 - 0.5)) + 0 = 10; completed = 5 -> 50%
    expect(screen.getByText('50% complete')).toBeDefined()
    expect(screen.getByText('5 / 10')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined() // challenge count
    expect(screen.getByText('5')).toBeDefined() // tasks remaining
  })

  it('omits the progress bar section when there are no tasks at all', () => {
    useBrowsedProjectContextMock.mockReturnValue({ project: makeProject({ id: 1 }) })
    getProjectChallengesMock.mockReturnValue({ data: [] })

    render(<ProjectDetail />)

    expect(screen.queryByText(/% complete/)).toBeNull()
    expect(screen.getByText('Challenges')).toBeDefined()
  })

  it('shows created/modified dates only when present', () => {
    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, created: undefined, modified: undefined }),
    })
    const { rerender } = render(<ProjectDetail />)
    expect(screen.queryByText('Created')).toBeNull()
    expect(screen.queryByText('Modified')).toBeNull()

    useBrowsedProjectContextMock.mockReturnValue({
      project: makeProject({ id: 1, created: 1704067200000, modified: undefined }),
    })
    rerender(<ProjectDetail />)
    expect(screen.getByText('Created')).toBeDefined()
    expect(screen.queryByText('Modified')).toBeNull()
  })

  describe('share button', () => {
    beforeEach(() => {
      useBrowsedProjectContextMock.mockReturnValue({
        project: makeProject({ id: 9, name: 'roads', displayName: 'Roads Project' }),
      })
    })

    it('uses navigator.share when available, without falling back to the clipboard', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      // userEvent.setup() installs its own navigator.clipboard stub, clobbering
      // any clipboard mock set up before it - so stub navigator only after setup().
      const user = userEvent.setup()
      stubNavigator({ share: shareMock, clipboard: { writeText: writeTextMock } })

      render(<ProjectDetail />)
      await user.click(screen.getByRole('button', { name: /share/i }))

      expect(shareMock).toHaveBeenCalledWith({
        title: 'Roads Project',
        url: `${window.location.origin}/project/9`,
      })
      expect(writeTextMock).not.toHaveBeenCalled()
    })

    it('falls back to copying the link to the clipboard when navigator.share is unavailable', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      stubNavigator({ share: undefined, clipboard: { writeText: writeTextMock } })

      render(<ProjectDetail />)
      await user.click(screen.getByRole('button', { name: /share/i }))

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/project/9`)
      })
      expect(toastSuccessMock).toHaveBeenCalledWith('Link copied to clipboard')
    })

    it('falls back to the clipboard when navigator.share rejects with a non-abort error', async () => {
      const shareMock = vi.fn().mockRejectedValue(new Error('share failed'))
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      stubNavigator({ share: shareMock, clipboard: { writeText: writeTextMock } })

      render(<ProjectDetail />)
      await user.click(screen.getByRole('button', { name: /share/i }))

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/project/9`)
      })
      expect(toastSuccessMock).toHaveBeenCalledWith('Link copied to clipboard')
    })

    it('does nothing when the user aborts the native share dialog', async () => {
      const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
      const shareMock = vi.fn().mockRejectedValue(abortError)
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      stubNavigator({ share: shareMock, clipboard: { writeText: writeTextMock } })

      render(<ProjectDetail />)
      await user.click(screen.getByRole('button', { name: /share/i }))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledTimes(1)
      })
      // Flush the microtask queue so the rejected share() promise's catch
      // handler (which decides whether to fall back) has had a chance to run.
      await Promise.resolve()
      await Promise.resolve()

      expect(writeTextMock).not.toHaveBeenCalled()
      expect(toastSuccessMock).not.toHaveBeenCalled()
      expect(toastErrorMock).not.toHaveBeenCalled()
    })

    it('shows an error toast and logs when both share and the clipboard fallback fail', async () => {
      const shareMock = vi.fn().mockRejectedValue(new Error('share failed'))
      const writeTextMock = vi.fn().mockRejectedValue(new Error('clipboard denied'))
      const user = userEvent.setup()
      stubNavigator({ share: shareMock, clipboard: { writeText: writeTextMock } })

      render(<ProjectDetail />)
      await user.click(screen.getByRole('button', { name: /share/i }))

      await waitFor(() => {
        expect(toastErrorMock).toHaveBeenCalledWith('Failed to share project')
      })
      expect(logger.error).toHaveBeenCalledWith(
        'Error copying to clipboard',
        expect.objectContaining({ error: expect.any(Error) })
      )
    })
  })
})
