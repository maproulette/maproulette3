import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'

interface StubLinkProps {
  to?: string
  params?: Record<string, string>
  search?: Record<string, unknown>
  className?: string
  children?: ReactNode
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, className, children }: StubLinkProps) => {
    const href = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => acc.replace(`$${key}`, value),
          to ?? ''
        )
      : to
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

const { useManageProjectsContextMock } = vi.hoisted(() => ({
  useManageProjectsContextMock: vi.fn(),
}))

vi.mock('./ManageProjectsContext', () => ({
  useManageProjectsContext: useManageProjectsContextMock,
}))

import { ManageProjectsContent } from './ManageProjectsContent'

afterEach(() => cleanup())

const makeProject = (overrides: Partial<Project>): Project =>
  ({
    name: overrides.name ?? 'project',
    enabled: true,
    deleted: false,
    featured: false,
    ...overrides,
  }) as Project

const baseContext = (overrides: Record<string, unknown> = {}) => ({
  projectsToShow: [] as Project[],
  isLoading: false,
  isFetching: false,
  hasNextPage: false,
  searchQuery: '',
  setSearchQuery: vi.fn(),
  onlyEnabled: false,
  setOnlyEnabled: vi.fn(),
  onlyOwned: false,
  setOnlyOwned: vi.fn(),
  onlyShowArchived: false,
  setOnlyShowArchived: vi.fn(),
  onlyShowPinned: false,
  setOnlyShowPinned: vi.fn(),
  viewMode: 'list',
  setViewMode: vi.fn(),
  showPanel: true,
  setShowPanel: vi.fn(),
  loadMore: vi.fn(),
  pinnedProjectIds: [] as number[],
  toggleProjectPin: vi.fn(),
  challengeCountsByProjectId: {} as Record<number, number>,
  updateProject: vi.fn(),
  handleExportCsv: vi.fn(),
  handleArchiveProject: vi.fn(),
  deleteProjectConfirm: null as { projectId: number; projectName: string } | null,
  handleDeleteProject: vi.fn(),
  confirmDeleteProject: vi.fn(),
  setDeleteProjectConfirm: vi.fn(),
  ...overrides,
})

const setup = (overrides: Record<string, unknown> = {}) => {
  const context = baseContext(overrides)
  useManageProjectsContextMock.mockReturnValue(context)
  render(<ManageProjectsContent />)
  return context
}

describe('ManageProjectsContent', () => {
  it('renders nothing in the list area while loading', () => {
    setup({ isLoading: true })

    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByText('No projects found')).toBeNull()
  })

  it('shows an empty state with a create-project action when there are no projects to show', () => {
    setup({ isLoading: false, projectsToShow: [] })

    expect(screen.getByText('No projects found')).toBeDefined()
    expect(screen.getByText('Get started by creating your first project.')).toBeDefined()
  })

  it('renders a table of projects in list view mode', () => {
    const projects = [makeProject({ id: 1, displayName: 'Project One' })]
    setup({ viewMode: 'list', projectsToShow: projects })

    expect(screen.getByRole('link', { name: 'Project One' })).toBeDefined()
  })

  it('renders project cards in grid view mode, with the challenge count applied', () => {
    const projects = [makeProject({ id: 1, displayName: 'Project One' })]
    setup({
      viewMode: 'grid',
      projectsToShow: projects,
      challengeCountsByProjectId: { 1: 4 },
    })

    expect(screen.getByText('Total Challenges: 4')).toBeDefined()
  })

  it('calls setSearchQuery as the user types in the search bar', async () => {
    const user = userEvent.setup()
    const context = setup()

    await user.type(screen.getByPlaceholderText('Search projects...'), 'abc')

    expect(context.setSearchQuery).toHaveBeenCalled()
  })

  it('toggles the discoverable/owned/pinned/archived filters', async () => {
    const user = userEvent.setup()
    const context = setup()

    await user.click(screen.getByRole('switch', { name: 'Discoverable' }))
    expect(context.setOnlyEnabled).toHaveBeenCalledWith(true)

    await user.click(screen.getByRole('switch', { name: 'Owned' }))
    expect(context.setOnlyOwned).toHaveBeenCalledWith(true)

    await user.click(screen.getByRole('switch', { name: 'Pinned' }))
    expect(context.setOnlyShowPinned).toHaveBeenCalledWith(true)

    await user.click(screen.getByRole('switch', { name: 'Archived' }))
    expect(context.setOnlyShowArchived).toHaveBeenCalledWith(true)
  })

  it('clears every filter when "Clear filters" is clicked', async () => {
    const user = userEvent.setup()
    const context = setup({ onlyEnabled: true, onlyOwned: true })

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(context.setOnlyEnabled).toHaveBeenCalledWith(false)
    expect(context.setOnlyOwned).toHaveBeenCalledWith(false)
    expect(context.setOnlyShowPinned).toHaveBeenCalledWith(false)
    expect(context.setOnlyShowArchived).toHaveBeenCalledWith(false)
  })

  it('disables the "Clear filters" button when no filters are active', () => {
    setup()

    const button = screen.getByRole('button', { name: /clear filters/i }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('switches view mode when the grid/list toggle is used', async () => {
    const user = userEvent.setup()
    const context = setup({ viewMode: 'list' })

    await user.click(screen.getByRole('radio', { name: /grid view/i }))

    expect(context.setViewMode).toHaveBeenCalledWith('grid')
  })

  it('shows a "Load More" button when there is a next page, and calls loadMore on click', async () => {
    const user = userEvent.setup()
    const projects = [makeProject({ id: 1, displayName: 'Project One' })]
    const context = setup({ projectsToShow: projects, hasNextPage: true })

    await user.click(screen.getByRole('button', { name: /load more/i }))

    expect(context.loadMore).toHaveBeenCalled()
  })

  it('shows an end-of-list message when there is no next page and projects are present', () => {
    const projects = [makeProject({ id: 1, displayName: 'Project One' })]
    setup({ projectsToShow: projects, hasNextPage: false })

    expect(screen.getByText("You've reached the end of the list")).toBeDefined()
  })

  it('hides the side panel when the hide-panel button is clicked', async () => {
    const user = userEvent.setup()
    const context = setup({ showPanel: true })

    await user.click(screen.getByRole('button', { name: /hide panel/i }))

    expect(context.setShowPanel).toHaveBeenCalledWith(false)
  })

  it('shows a button to re-open the side panel when it is hidden', async () => {
    const user = userEvent.setup()
    const context = setup({ showPanel: false })

    expect(screen.queryByText('About Projects')).toBeNull()
    await user.click(screen.getByRole('button', { name: /show panel/i }))

    expect(context.setShowPanel).toHaveBeenCalledWith(true)
  })

  it('renders a delete confirmation dialog with the pending project name, and confirms deletion', async () => {
    const user = userEvent.setup()
    const context = setup({
      deleteProjectConfirm: { projectId: 9, projectName: 'Doomed Project' },
    })

    expect(screen.getByText(/This will delete the project "Doomed Project"/)).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(context.confirmDeleteProject).toHaveBeenCalled()
  })

  it('does not render the delete confirmation dialog content when there is no pending deletion', () => {
    setup({ deleteProjectConfirm: null })

    expect(screen.queryByText('Delete project?')).toBeNull()
  })
})
