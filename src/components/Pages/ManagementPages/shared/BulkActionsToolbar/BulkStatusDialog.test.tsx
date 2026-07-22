import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { BulkStatusDialog } from './BulkStatusDialog'

afterEach(() => cleanup())

describe('BulkStatusDialog', () => {
  it('renders nothing observable when closed', () => {
    render(<BulkStatusDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('defaults to "Fixed" and applies that status when confirmed without changing it', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<BulkStatusDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />)

    expect(screen.getByRole('combobox').textContent).toBe('Fixed')

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onConfirm).toHaveBeenCalledWith(1)
  })

  it('applies the newly selected status when confirmed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<BulkStatusDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Validated' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onConfirm).toHaveBeenCalledWith(8)
  })

  it('calls onOpenChange(false) and not onConfirm when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<BulkStatusDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
