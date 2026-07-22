import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { BulkDeleteDialog } from './BulkDeleteDialog'

afterEach(() => cleanup())

describe('BulkDeleteDialog', () => {
  it('renders nothing observable when closed', () => {
    render(<BulkDeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} count={3} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows singular title copy for a single task', () => {
    render(<BulkDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={1} />)
    expect(screen.getByRole('heading', { name: 'Delete 1 task?' })).toBeDefined()
  })

  it('shows plural title copy for multiple tasks', () => {
    render(<BulkDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={7} />)
    expect(screen.getByRole('heading', { name: 'Delete 7 tasks?' })).toBeDefined()
  })

  it('calls onOpenChange(false) and not onConfirm when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<BulkDeleteDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} count={2} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when Delete is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<BulkDeleteDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} count={2} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disables both actions and shows progress copy while busy', () => {
    render(<BulkDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} count={2} busy />)

    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(
      true
    )
    expect((screen.getByRole('button', { name: 'Deleting…' }) as HTMLButtonElement).disabled).toBe(
      true
    )
  })
})
