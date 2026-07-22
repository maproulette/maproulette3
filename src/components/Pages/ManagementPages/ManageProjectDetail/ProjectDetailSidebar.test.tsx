import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import { ProjectDetailSidebar } from './ProjectDetailSidebar'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      params,
      search,
      className,
    }: {
      children?: ReactNode
      to?: string
      params?: Record<string, string>
      search?: Record<string, unknown>
      className?: string
    }) => (
      <a
        href={to}
        data-params={params ? JSON.stringify(params) : undefined}
        data-search={search ? JSON.stringify(search) : undefined}
        className={className}
      >
        {children}
      </a>
    ),
  }
})

function makeProject(props: Partial<Project> & { id: number }): Project {
  return { name: `project-${props.id}`, enabled: true, ...props } as Project
}

const baseProps = {
  projectId: '10',
  project: undefined,
  projectData: undefined,
  isLoadingProject: false,
  isLoadingChallenges: false,
  filteredChallengesCount: 0,
  challengeSummary: { total: 0, enabled: 0, tasksRemaining: 0 },
  onArchiveProject: vi.fn(),
  onToggleEnabled: vi.fn(),
  onDeleteProject: vi.fn(),
}

// The real page always derives `project` and `projectData` from the same
// query result (see ManageProjectDetailContent), so tests mirror that by
// passing one fixture for both props unless a prop-mismatch case is what's
// under test.
const renderSidebar = (
  projectFixture: Project | undefined,
  overrides: Partial<React.ComponentProps<typeof ProjectDetailSidebar>> = {}
) =>
  render(
    <ProjectDetailSidebar
      {...baseProps}
      project={projectFixture}
      projectData={projectFixture}
      {...overrides}
    />
  )

describe('ProjectDetailSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => cleanup())

  describe('loading state', () => {
    it('does not render taxonomy badges, metadata, or action buttons while loading', () => {
      render(<ProjectDetailSidebar {...baseProps} isLoadingProject />)

      expect(screen.queryByText('Featured')).toBeNull()
      expect(screen.queryByText('Archived')).toBeNull()
      expect(screen.queryByTitle('Discoverable')).toBeNull()
      expect(screen.queryByRole('button', { name: /archive project/i })).toBeNull()
      expect(screen.queryByRole('button', { name: /delete project/i })).toBeNull()
    })

    it('hides the stats block while challenges are still loading', () => {
      renderSidebar(makeProject({ id: 10 }), { isLoadingChallenges: true })

      expect(screen.queryByText('Challenges')).toBeNull()
      expect(screen.queryByText('Tasks remaining')).toBeNull()
    })
  })

  describe('badges', () => {
    it('shows no taxonomy badges for a plain project', () => {
      renderSidebar(makeProject({ id: 10 }))
      expect(screen.queryByText('Featured')).toBeNull()
      expect(screen.queryByText('Archived')).toBeNull()
    })

    it('shows the Featured badge for a featured project', () => {
      renderSidebar(makeProject({ id: 10, featured: true }))
      expect(screen.getByText('Featured')).toBeDefined()
      expect(screen.queryByText('Archived')).toBeNull()
    })

    it('shows the Archived badge for an archived project', () => {
      renderSidebar(makeProject({ id: 10, isArchived: true }))
      expect(screen.getByText('Archived')).toBeDefined()
    })

    it('shows both badges when featured and archived', () => {
      renderSidebar(makeProject({ id: 10, featured: true, isArchived: true }))
      expect(screen.getByText('Featured')).toBeDefined()
      expect(screen.getByText('Archived')).toBeDefined()
    })
  })

  describe('title and metadata', () => {
    it('prefers displayName over name for the title', () => {
      renderSidebar(makeProject({ id: 10, name: 'raw-name', displayName: 'Pretty Name' }))
      expect(screen.getByText('Pretty Name')).toBeDefined()
      expect(screen.queryByText('raw-name')).toBeNull()
    })

    it('falls back to name when displayName is absent', () => {
      renderSidebar(makeProject({ id: 10, name: 'raw-name', displayName: undefined }))
      expect(screen.getByText('raw-name')).toBeDefined()
    })

    it('shows the project id', () => {
      renderSidebar(makeProject({ id: 123 }), { projectId: '123' })
      expect(screen.getByText('ID 123')).toBeDefined()
    })

    it('renders the description when present', () => {
      renderSidebar(makeProject({ id: 10, description: 'A great project' }))
      expect(screen.getByText('A great project')).toBeDefined()
    })

    it('omits the description block when absent', () => {
      renderSidebar(makeProject({ id: 10 }))
      expect(screen.queryByText('A great project')).toBeNull()
    })
  })

  describe('action buttons', () => {
    it('invokes onArchiveProject / onToggleEnabled / onDeleteProject when clicked', async () => {
      const user = userEvent.setup()
      const onArchiveProject = vi.fn()
      const onToggleEnabled = vi.fn()
      const onDeleteProject = vi.fn()
      renderSidebar(makeProject({ id: 10, enabled: true, isArchived: false }), {
        onArchiveProject,
        onToggleEnabled,
        onDeleteProject,
      })

      await user.click(screen.getByRole('button', { name: 'Archive project' }))
      await user.click(screen.getByRole('button', { name: 'Disable project' }))
      await user.click(screen.getByRole('button', { name: 'Delete project' }))

      expect(onArchiveProject).toHaveBeenCalledTimes(1)
      expect(onToggleEnabled).toHaveBeenCalledTimes(1)
      expect(onDeleteProject).toHaveBeenCalledTimes(1)
    })

    it('labels the archive button as "Unarchive project" when already archived', () => {
      renderSidebar(makeProject({ id: 10, isArchived: true }))
      expect(screen.getByRole('button', { name: 'Unarchive project' })).toBeDefined()
    })

    it('labels the visibility button as "Enable project" when disabled', () => {
      renderSidebar(makeProject({ id: 10, enabled: false }))
      expect(screen.getByRole('button', { name: 'Enable project' })).toBeDefined()
    })

    it('does not render archive/enable/delete buttons when the project has no id yet', () => {
      renderSidebar({ name: 'no-id-project', enabled: true } as unknown as Project)
      expect(screen.queryByRole('button', { name: /archive project/i })).toBeNull()
      expect(screen.queryByRole('button', { name: /delete project/i })).toBeNull()
    })

    it('always renders the view/edit/create-challenge links regardless of loading state', () => {
      render(<ProjectDetailSidebar {...baseProps} isLoadingProject />)
      expect(screen.getByText('View project page').closest('a')?.getAttribute('href')).toBe(
        '/project/$projectId'
      )
      expect(screen.getByText('Edit project').closest('a')?.getAttribute('href')).toBe(
        '/manage/project/$projectId/edit'
      )
      const createLink = screen.getByText('Create challenge').closest('a')
      expect(createLink?.getAttribute('href')).toBe('/manage/challenge/new')
      expect(createLink?.getAttribute('data-search')).toBe(JSON.stringify({ projectId: 10 }))
    })
  })

  describe('stats', () => {
    it('shows challenge counts once loaded', () => {
      renderSidebar(makeProject({ id: 10 }), {
        filteredChallengesCount: 4,
        challengeSummary: { total: 6, enabled: 5, tasksRemaining: 42 },
      })

      expect(screen.getByText('Challenges')).toBeDefined()
      expect(screen.getByText('6')).toBeDefined()
      expect(screen.getByText('Shown')).toBeDefined()
      expect(screen.getByText('4')).toBeDefined()
      expect(screen.getByText('Discoverable')).toBeDefined()
      expect(screen.getByText('5')).toBeDefined()
      expect(screen.getByText('Tasks remaining')).toBeDefined()
      expect(screen.getByText('42')).toBeDefined()
    })
  })

  describe('status badge', () => {
    it('shows a discoverable badge for an enabled project', () => {
      renderSidebar(makeProject({ id: 10, enabled: true }))
      expect(screen.getByTitle('Discoverable')).toBeDefined()
    })

    it('shows a not-discoverable badge for a disabled project', () => {
      renderSidebar(makeProject({ id: 10, enabled: false }))
      expect(screen.getByTitle('Not discoverable')).toBeDefined()
    })
  })
})
