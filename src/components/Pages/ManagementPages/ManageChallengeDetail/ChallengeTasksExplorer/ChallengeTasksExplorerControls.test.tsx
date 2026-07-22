import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { ChallengeTasksExplorerControls } from './ChallengeTasksExplorerControls'
import type { SortField } from './constants'

const { useExplorerContextMock } = vi.hoisted(() => ({
  useExplorerContextMock: vi.fn(),
}))

vi.mock('./ChallengeTasksExplorerContext', () => ({
  useExplorerContext: useExplorerContextMock,
}))

const initialEnabled = (values: readonly number[]) =>
  Object.fromEntries(values.map((v) => [v, true])) as Record<number, boolean>

interface ContextOverrides {
  enabled?: boolean
  statusEnabled?: Record<number, boolean>
  priorityEnabled?: Record<number, boolean>
  sortField?: SortField
  sortDesc?: boolean
  filtersDirty?: boolean
  setStatusChecked?: ReturnType<typeof vi.fn>
  setPriorityChecked?: ReturnType<typeof vi.fn>
  setSortField?: ReturnType<typeof vi.fn>
  setSortDesc?: ReturnType<typeof vi.fn>
  clearFilters?: ReturnType<typeof vi.fn>
}

const setContext = (overrides: ContextOverrides = {}) => {
  const value = {
    enabled: true,
    statusEnabled: initialEnabled([0, 1, 2, 3, 4, 5, 6, 9]),
    priorityEnabled: initialEnabled([0, 1, 2]),
    sortField: 'id' as SortField,
    sortDesc: true,
    filtersDirty: false,
    setStatusChecked: vi.fn(),
    setPriorityChecked: vi.fn(),
    setSortField: vi.fn(),
    setSortDesc: vi.fn(),
    clearFilters: vi.fn(),
    ...overrides,
  }
  useExplorerContextMock.mockReturnValue(value)
  return value
}

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChallengeTasksExplorerControls', () => {
  it('renders nothing when the explorer is not enabled', () => {
    setContext({ enabled: false })
    const { container } = render(<ChallengeTasksExplorerControls countLabel="Showing 3 of 3" />)

    expect(container.innerHTML).toBe('')
  })

  it('renders the count label passed in as a prop', () => {
    setContext()
    render(<ChallengeTasksExplorerControls countLabel="Showing 5 of 30 tasks" />)

    expect(screen.getByText('Showing 5 of 30 tasks')).toBeDefined()
  })

  it('checking a status checkbox calls setStatusChecked with the status id and checked state', async () => {
    const user = userEvent.setup()
    const { setStatusChecked } = setContext()
    render(<ChallengeTasksExplorerControls countLabel="" />)

    await user.click(screen.getByRole('button', { name: /Status/i }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Fixed' }))

    expect(setStatusChecked).toHaveBeenCalledWith(1, false)
  })

  it('checking a priority checkbox calls setPriorityChecked with the priority id and checked state', async () => {
    const user = userEvent.setup()
    const { setPriorityChecked } = setContext()
    render(<ChallengeTasksExplorerControls countLabel="" />)

    await user.click(screen.getByRole('button', { name: /Priority/i }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'High' }))

    expect(setPriorityChecked).toHaveBeenCalledWith(0, false)
  })

  it('disables the Clear button when filters are not dirty, enables it when dirty', () => {
    setContext({ filtersDirty: false })
    const { rerender } = render(<ChallengeTasksExplorerControls countLabel="" />)
    expect((screen.getByRole('button', { name: /Clear/i }) as HTMLButtonElement).disabled).toBe(
      true
    )

    setContext({ filtersDirty: true })
    rerender(<ChallengeTasksExplorerControls countLabel="" />)
    expect((screen.getByRole('button', { name: /Clear/i }) as HTMLButtonElement).disabled).toBe(
      false
    )
  })

  it('clicking Clear calls clearFilters', async () => {
    const user = userEvent.setup()
    const { clearFilters } = setContext({ filtersDirty: true })
    render(<ChallengeTasksExplorerControls countLabel="" />)

    await user.click(screen.getByRole('button', { name: /Clear/i }))

    expect(clearFilters).toHaveBeenCalledTimes(1)
  })

  it('toggling the sort direction button flips sortDesc', async () => {
    const user = userEvent.setup()
    const { setSortDesc } = setContext({ sortDesc: true })
    render(<ChallengeTasksExplorerControls countLabel="" />)

    expect(screen.getByRole('button', { name: /Desc/i })).toBeDefined()
    await user.click(screen.getByRole('button', { name: /Desc/i }))

    expect(setSortDesc).toHaveBeenCalledTimes(1)
    // called with an updater function, as it's a functional setState call
    const updater = setSortDesc.mock.calls[0][0] as (prev: boolean) => boolean
    expect(updater(true)).toBe(false)
  })

  it('shows the ascending label/icon when sortDesc is false', () => {
    setContext({ sortDesc: false })
    render(<ChallengeTasksExplorerControls countLabel="" />)

    expect(screen.getByRole('button', { name: /Asc/i })).toBeDefined()
  })

  it('selecting a sort field option calls setSortField', async () => {
    const user = userEvent.setup()
    const { setSortField } = setContext()
    render(<ChallengeTasksExplorerControls countLabel="" />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Priority' }))

    expect(setSortField).toHaveBeenCalledWith('priority')
  })
})
