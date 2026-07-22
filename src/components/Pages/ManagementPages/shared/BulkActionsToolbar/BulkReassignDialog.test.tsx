import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { BulkReassignDialog } from './BulkReassignDialog'

const { findUsersMock } = vi.hoisted(() => ({
  findUsersMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        findUsers: findUsersMock,
      },
    },
  }
})

const fakeUsers = [
  { id: 101, osmProfile: { displayName: 'Alice Mapper', avatarURL: '' } },
  { id: 102, osmProfile: { displayName: 'Alan Reviewer', avatarURL: '' } },
] as unknown as User[]

afterEach(() => cleanup())

beforeEach(() => {
  findUsersMock.mockReset()
  findUsersMock.mockReturnValue({ data: [] })
})

describe('BulkReassignDialog', () => {
  it('renders nothing observable when closed', () => {
    render(<BulkReassignDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} count={3} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('disables Reassign until a user is selected', () => {
    render(<BulkReassignDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={2} />)
    expect((screen.getByRole('button', { name: 'Reassign' }) as HTMLButtonElement).disabled).toBe(
      true
    )
  })

  it('does not search until the user types a query', async () => {
    render(<BulkReassignDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={2} />)
    expect(findUsersMock).toHaveBeenCalledWith('', 8, false)
  })

  it('searches as the user types and lists matching users', async () => {
    const user = userEvent.setup()
    findUsersMock.mockReturnValue({ data: fakeUsers })
    render(<BulkReassignDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={2} />)

    await user.type(screen.getByPlaceholderText('Search OSM username'), 'al')

    expect(findUsersMock).toHaveBeenLastCalledWith('al', 8, true)
    expect(screen.getByText('Alice Mapper')).toBeDefined()
    expect(screen.getByText('Alan Reviewer')).toBeDefined()
  })

  it('calls onConfirm with the selected user id', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    findUsersMock.mockReturnValue({ data: fakeUsers })
    render(<BulkReassignDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} count={2} />)

    await user.type(screen.getByPlaceholderText('Search OSM username'), 'al')
    await user.click(screen.getByText('Alan Reviewer'))
    expect((screen.getByRole('button', { name: 'Reassign' }) as HTMLButtonElement).disabled).toBe(
      false
    )

    await user.click(screen.getByRole('button', { name: 'Reassign' }))

    expect(onConfirm).toHaveBeenCalledWith(102)
  })

  it('calls onOpenChange(false) and not onConfirm when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    findUsersMock.mockReturnValue({ data: fakeUsers })
    render(<BulkReassignDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} count={2} />)

    await user.type(screen.getByPlaceholderText('Search OSM username'), 'al')
    await user.click(screen.getByText('Alan Reviewer'))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('disables both actions while busy', () => {
    render(<BulkReassignDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={2} busy />)
    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(
      true
    )
    expect(
      (screen.getByRole('button', { name: 'Reassigning…' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })
})
