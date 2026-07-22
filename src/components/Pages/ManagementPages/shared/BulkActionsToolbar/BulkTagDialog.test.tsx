import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { BulkTagDialog } from './BulkTagDialog'

// BulkTagDialog renders TagInput, which calls api.task.searchKeywords for
// suggestions. Stub it out so the dialog doesn't need a QueryClientProvider.
vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      task: {
        ...actual.api.task,
        searchKeywords: () => ({ data: [] }),
      },
    },
  }
})

afterEach(() => cleanup())

describe('BulkTagDialog', () => {
  it('renders nothing observable when closed', () => {
    render(<BulkTagDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('disables Apply until at least one tag has been entered', async () => {
    const user = userEvent.setup()
    render(<BulkTagDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />)

    expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(true)

    await user.type(screen.getByPlaceholderText('Add a tag…'), 'litter{enter}')

    expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(
      false
    )
  })

  it('calls onConfirm with the entered tags', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<BulkTagDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />)

    const input = screen.getByPlaceholderText('Add a tag…')
    await user.type(input, 'litter{enter}')
    await user.type(input, 'graffiti{enter}')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onConfirm).toHaveBeenCalledWith(['litter', 'graffiti'])
  })

  it('calls onOpenChange(false) and not onConfirm when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<BulkTagDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    await user.type(screen.getByPlaceholderText('Add a tag…'), 'litter{enter}')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
