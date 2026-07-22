import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@/test/testUtils'
import type { User } from '@/types/User'
import { BulkActionsToolbar } from './BulkActionsToolbar'

const {
  bulkUpdateStatusMock,
  bulkAddTagsMock,
  bulkDeleteMock,
  bulkArchiveMock,
  bulkReassignMock,
  bulkClearLockMock,
  findUsersMock,
  searchKeywordsMock,
  toastSuccessMock,
  toastErrorMock,
  toastWarningMock,
} = vi.hoisted(() => ({
  bulkUpdateStatusMock: vi.fn(),
  bulkAddTagsMock: vi.fn(),
  bulkDeleteMock: vi.fn(),
  bulkArchiveMock: vi.fn(),
  bulkReassignMock: vi.fn(),
  bulkClearLockMock: vi.fn(),
  findUsersMock: vi.fn(),
  searchKeywordsMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastWarningMock: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock, warning: toastWarningMock },
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      task: {
        ...actual.api.task,
        useBulkUpdateStatus: bulkUpdateStatusMock,
        useBulkAddTags: bulkAddTagsMock,
        useBulkDelete: bulkDeleteMock,
        useBulkArchive: bulkArchiveMock,
        useBulkReassign: bulkReassignMock,
        useBulkClearLock: bulkClearLockMock,
        searchKeywords: searchKeywordsMock,
      },
      user: {
        ...actual.api.user,
        findUsers: findUsersMock,
      },
    },
  }
})

const fakeUser = {
  id: 55,
  osmProfile: { displayName: 'Rita Reviewer', avatarURL: '' },
} as unknown as User

const makeMutation = (result: unknown = undefined) => ({
  mutateAsync: vi.fn().mockResolvedValue(result),
  isPending: false,
})

let mutations: {
  status: ReturnType<typeof makeMutation>
  tags: ReturnType<typeof makeMutation>
  del: ReturnType<typeof makeMutation>
  archive: ReturnType<typeof makeMutation>
  reassign: ReturnType<typeof makeMutation>
  clearLock: ReturnType<typeof makeMutation>
}

beforeEach(() => {
  mutations = {
    status: makeMutation(),
    tags: makeMutation(),
    del: makeMutation({ requested: 2, deleted: 2, denied: [] }),
    archive: makeMutation(),
    reassign: makeMutation({ requested: 2, updated: 2 }),
    clearLock: makeMutation(),
  }
  bulkUpdateStatusMock.mockReturnValue(mutations.status)
  bulkAddTagsMock.mockReturnValue(mutations.tags)
  bulkDeleteMock.mockReturnValue(mutations.del)
  bulkArchiveMock.mockReturnValue(mutations.archive)
  bulkReassignMock.mockReturnValue(mutations.reassign)
  bulkClearLockMock.mockReturnValue(mutations.clearLock)
  findUsersMock.mockReturnValue({ data: [fakeUser] })
  searchKeywordsMock.mockReturnValue({ data: [] })
  toastSuccessMock.mockReset()
  toastErrorMock.mockReset()
  toastWarningMock.mockReset()
})

afterEach(() => cleanup())

describe('BulkActionsToolbar', () => {
  it('renders nothing when there is no selection', () => {
    const { container } = render(<BulkActionsToolbar selectedIds={[]} onClearSelection={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the selected count and clears selection immediately via the Clear button', async () => {
    const user = userEvent.setup()
    const onClearSelection = vi.fn()
    render(<BulkActionsToolbar selectedIds={[1, 2, 3]} onClearSelection={onClearSelection} />)

    expect(screen.getByText('3 selected')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onClearSelection).toHaveBeenCalledTimes(1)
    expect(mutations.del.mutateAsync).not.toHaveBeenCalled()
  })

  it('runs a bulk status update for the selected ids and clears the selection', async () => {
    const user = userEvent.setup()
    const onClearSelection = vi.fn()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={onClearSelection} />)

    await user.click(screen.getByRole('button', { name: /Change status/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'Pick a status…' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }))

    expect(mutations.status.mutateAsync).toHaveBeenCalledWith({ taskIds: [1, 2], status: 1 })
    await waitFor(() => expect(toastSuccessMock).toHaveBeenCalledWith('Updated 2 tasks'))
    expect(onClearSelection).toHaveBeenCalledTimes(1)
  })

  it('cancelling the status dialog does not run the mutation', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Change status/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'Pick a status…' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(mutations.status.mutateAsync).not.toHaveBeenCalled()
  })

  it('runs a bulk tag update with the entered tags', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Tag' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText('Add a tag…'), 'litter{enter}')
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }))

    expect(mutations.tags.mutateAsync).toHaveBeenCalledWith({ taskIds: [1, 2], tags: ['litter'] })
  })

  it('archives tasks directly from the dropdown, without a confirmation dialog', async () => {
    const user = userEvent.setup()
    const onClearSelection = vi.fn()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={onClearSelection} />)

    await user.click(screen.getByRole('button', { name: /^Archive/i }))
    await user.click(await screen.findByRole('menuitem', { name: /^Archive$/i }))

    expect(mutations.archive.mutateAsync).toHaveBeenCalledWith({
      taskIds: [1, 2],
      archived: true,
    })
    expect(onClearSelection).toHaveBeenCalledTimes(1)
  })

  it('unarchives tasks directly from the dropdown', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /^Archive/i }))
    await user.click(await screen.findByRole('menuitem', { name: /^Unarchive$/i }))

    expect(mutations.archive.mutateAsync).toHaveBeenCalledWith({
      taskIds: [1, 2],
      archived: false,
    })
  })

  it('reassigns the selected tasks to the chosen user', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Reassign/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText('Search OSM username'), 'rita')
    await user.click(within(dialog).getByText('Rita Reviewer'))
    await user.click(within(dialog).getByRole('button', { name: 'Reassign' }))

    expect(mutations.reassign.mutateAsync).toHaveBeenCalledWith({ taskIds: [1, 2], userId: 55 })
  })

  it('clears locks for the selected tasks', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Clear lock/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Clear lock' }))

    expect(mutations.clearLock.mutateAsync).toHaveBeenCalledWith([1, 2])
  })

  it('deletes the selected tasks after confirmation and reports a partial-denial warning', async () => {
    const user = userEvent.setup()
    mutations.del.mutateAsync.mockResolvedValue({ requested: 3, deleted: 2, denied: [9] })
    render(<BulkActionsToolbar selectedIds={[1, 2, 9]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(mutations.del.mutateAsync).toHaveBeenCalledWith([1, 2, 9])
    await waitFor(() =>
      expect(toastWarningMock).toHaveBeenCalledWith('Deleted 2 tasks; 1 could not be deleted')
    )
  })

  it('cancelling the delete dialog does not run the mutation', async () => {
    const user = userEvent.setup()
    render(<BulkActionsToolbar selectedIds={[1, 2]} onClearSelection={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(mutations.del.mutateAsync).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
