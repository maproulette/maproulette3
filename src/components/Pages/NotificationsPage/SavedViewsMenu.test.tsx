import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTER_STATE } from '@/hooks/useNotificationFilters'
import { cleanup, render, screen, waitFor } from '@/test/testUtils'
import { SavedViewsMenu } from './SavedViewsMenu'

const { useNotificationsPageContextMock, toastMock } = vi.hoisted(() => ({
  useNotificationsPageContextMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/contexts/NotificationsPageContext', () => ({
  useNotificationsPageContext: useNotificationsPageContextMock,
}))

vi.mock('sonner', () => ({
  toast: toastMock,
}))

const STORAGE_KEY = 'mr4:notifications:savedViews'

const applyFilterState = vi.fn()

const setupContext = (overrides: Record<string, unknown> = {}) => {
  useNotificationsPageContextMock.mockReturnValue({
    filters: {
      currentState: { ...DEFAULT_FILTER_STATE, category: 'mention' },
      applyFilterState,
      hasActiveFilters: true,
      ...overrides,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  setupContext()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('SavedViewsMenu', () => {
  it('shows an empty state when there are no saved views', async () => {
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))

    expect(await screen.findByText('No saved views yet.')).toBeDefined()
  })

  it('disables "Save current as…" when there are no active filters', async () => {
    const user = userEvent.setup()
    setupContext({ hasActiveFilters: false })
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))

    const saveItem = await screen.findByText('Save current as…')
    expect(saveItem.closest('[role="menuitem"]')?.getAttribute('data-disabled')).toBe('')
  })

  it('saves the current filter state under a new name and persists it to localStorage', async () => {
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))
    await user.click(await screen.findByText('Save current as…'))
    await user.type(screen.getByLabelText('Saved view name'), 'My view')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(toastMock.success).toHaveBeenCalled())
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      name: 'My view',
      state: { ...DEFAULT_FILTER_STATE, category: 'mention' },
    })
  })

  it('shows an error toast and does not save when the name is blank', async () => {
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))
    await user.click(await screen.findByText('Save current as…'))
    await user.keyboard('{Enter}')

    expect(toastMock.error).toHaveBeenCalledWith('View name is required')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('applies a saved view and closes the menu', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'v1', name: 'My saved view', state: DEFAULT_FILTER_STATE }])
    )
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))
    await user.click(await screen.findByText('My saved view'))

    expect(applyFilterState).toHaveBeenCalledWith(DEFAULT_FILTER_STATE)
    expect(toastMock.success).toHaveBeenCalledWith('Applied view "My saved view"')
    await waitFor(() => expect(screen.queryByText('My saved view')).toBeNull())
  })

  it('renames a saved view', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'v1', name: 'Old name', state: DEFAULT_FILTER_STATE }])
    )
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))
    await user.click(await screen.findByRole('button', { name: 'Rename Old name' }))
    const input = screen.getByLabelText('Rename saved view')
    await user.clear(input)
    await user.type(input, 'New name')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      expect(stored[0].name).toBe('New name')
    })
    expect(screen.getByText('New name')).toBeDefined()
  })

  it('deletes a saved view', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'v1', name: 'Doomed view', state: DEFAULT_FILTER_STATE }])
    )
    const user = userEvent.setup()
    render(<SavedViewsMenu />)

    await user.click(screen.getByRole('button', { name: /Saved views/ }))
    await user.click(await screen.findByRole('button', { name: 'Delete Doomed view' }))

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      expect(stored).toHaveLength(0)
    })
    expect(screen.queryByText('Doomed view')).toBeNull()
  })

  it('shows the saved view count as a badge on the trigger', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'v1', name: 'A', state: DEFAULT_FILTER_STATE },
        { id: 'v2', name: 'B', state: DEFAULT_FILTER_STATE },
      ])
    )
    render(<SavedViewsMenu />)

    expect(screen.getByText('2')).toBeDefined()
  })
})
