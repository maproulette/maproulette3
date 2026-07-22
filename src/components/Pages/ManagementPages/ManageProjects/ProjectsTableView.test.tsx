import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import { ProjectsTableView } from './ProjectsTableView'

interface StubLinkProps {
  to?: string
  params?: Record<string, string>
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, className, children, ...rest }: StubLinkProps) => {
    const href = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => acc.replace(`$${key}`, value),
          to ?? ''
        )
      : to
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    )
  },
}))

afterEach(() => cleanup())

const makeProject = (overrides: Partial<Project>): Project =>
  ({
    name: overrides.name ?? 'project',
    enabled: true,
    deleted: false,
    featured: false,
    ...overrides,
  }) as Project

const activeProject = makeProject({
  id: 1,
  name: 'active-project',
  displayName: 'Active Project',
  enabled: true,
  isArchived: false,
  description: 'A helpful description',
})

const archivedProject = makeProject({
  id: 2,
  name: 'archived-project',
  displayName: 'Archived Project',
  enabled: false,
  isArchived: true,
})

describe('ProjectsTableView', () => {
  it('renders the expected column headers', () => {
    render(<ProjectsTableView projects={[activeProject]} />)

    expect(screen.getByText('Status')).toBeDefined()
    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('ID')).toBeDefined()
    expect(screen.getByText('Challenges')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
    expect(screen.getByText('Actions')).toBeDefined()
  })

  it('renders project name as a link to the project detail page, plus id/description/challenge count', () => {
    render(
      <ProjectsTableView
        projects={[activeProject]}
        challengeCountsByProjectId={{ 1: 7 }}
      />
    )

    const link = screen.getByRole('link', { name: 'Active Project' })
    expect(link.getAttribute('href')).toBe('/manage/project/1')
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('7')).toBeDefined()
    expect(screen.getByText('A helpful description')).toBeDefined()
  })

  it('falls back to an em dash for missing description and challenge count', () => {
    render(<ProjectsTableView projects={[archivedProject]} />)

    const dashes = screen.getAllByText('—')
    // one for description, one for challenge count (pin column also renders a dash,
    // but archivedProject is not pinned so that's a third possible dash)
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('shows a clickable pin toggle when onTogglePin is provided, and calls it with the project id', async () => {
    const user = userEvent.setup()
    const onTogglePin = vi.fn()
    render(
      <ProjectsTableView projects={[activeProject]} pinnedProjectIds={[]} onTogglePin={onTogglePin} />
    )

    await user.click(screen.getByRole('button', { name: /pin project/i }))

    expect(onTogglePin).toHaveBeenCalledWith(1)
  })

  it('shows an unpin label for an already-pinned project when onTogglePin is provided', () => {
    render(
      <ProjectsTableView
        projects={[activeProject]}
        pinnedProjectIds={[1]}
        onTogglePin={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /unpin project/i })).toBeDefined()
  })

  it('renders a static pin icon (no button) for a pinned project when onTogglePin is absent', () => {
    render(<ProjectsTableView projects={[activeProject]} pinnedProjectIds={[1]} />)

    expect(screen.queryByRole('button', { name: /pin project/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /unpin project/i })).toBeNull()
    const row = screen.getAllByRole('row')[1]
    expect(within(row).getByTitle('Pinned')).toBeDefined()
  })

  it('opens the row actions menu with view/edit/add-challenge links', async () => {
    const user = userEvent.setup()
    render(<ProjectsTableView projects={[activeProject]} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    expect(await screen.findByRole('menuitem', { name: /view project/i })).toBeDefined()
    const editLink = screen.getByRole('menuitem', { name: /edit project/i })
    expect(editLink.getAttribute('href')).toBe('/manage/project/1/edit')
    expect(screen.getByRole('menuitem', { name: /add challenge/i })).toBeDefined()
  })

  it('does not render the export CSV action when onExportCsv is absent', async () => {
    const user = userEvent.setup()
    render(<ProjectsTableView projects={[activeProject]} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    expect(await screen.findByRole('menuitem', { name: /view project/i })).toBeDefined()
    expect(screen.queryByRole('menuitem', { name: /export csv/i })).toBeNull()
  })

  it('invokes onExportCsv with the project id when the export action is clicked', async () => {
    const user = userEvent.setup()
    const onExportCsv = vi.fn()
    render(<ProjectsTableView projects={[activeProject]} onExportCsv={onExportCsv} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(await screen.findByRole('menuitem', { name: /export csv/i }))

    expect(onExportCsv).toHaveBeenCalledWith(1)
  })

  it('copies the project URL to the clipboard when "Copy URL" is clicked', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ProjectsTableView projects={[activeProject]} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(await screen.findByRole('menuitem', { name: /copy url/i }))

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/manage/project/1'))
    writeText.mockRestore()
  })

  it('invokes onArchiveProject with the current archived state, and labels the action accordingly', async () => {
    const user = userEvent.setup()
    const onArchiveProject = vi.fn()
    render(
      <ProjectsTableView projects={[archivedProject]} onArchiveProject={onArchiveProject} />
    )

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const menuItem = await screen.findByRole('menuitem', { name: /unarchive project/i })
    await user.click(menuItem)

    expect(onArchiveProject).toHaveBeenCalledWith(2, true)
  })

  it('invokes onDeleteProject with the project id and displayName (falling back to name)', async () => {
    const user = userEvent.setup()
    const onDeleteProject = vi.fn()
    const noDisplayNameProject = makeProject({ id: 3, name: 'internal-name' })
    render(
      <ProjectsTableView projects={[noDisplayNameProject]} onDeleteProject={onDeleteProject} />
    )

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(await screen.findByRole('menuitem', { name: /delete project/i }))

    expect(onDeleteProject).toHaveBeenCalledWith(3, 'internal-name')
  })

  it('renders one row per project', () => {
    render(<ProjectsTableView projects={[activeProject, archivedProject]} />)

    const rows = screen.getAllByRole('row')
    // header row + 2 data rows
    expect(rows).toHaveLength(3)
    expect(within(rows[1]).getByText('Active Project')).toBeDefined()
    expect(within(rows[2]).getByText('Archived Project')).toBeDefined()
  })
})
