import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { VisibilityToggle } from './VisibilityToggle'

afterEach(() => cleanup())

describe('VisibilityToggle', () => {
  it('renders as unchecked when not enabled', () => {
    render(<VisibilityToggle id={1} enabled={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })

  it('renders as checked when enabled', () => {
    render(<VisibilityToggle id={1} enabled onToggle={vi.fn()} />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('renders the optional label and associates it with the switch', () => {
    render(<VisibilityToggle id={1} enabled={false} onToggle={vi.fn()} label="Visible" />)
    expect(screen.getByLabelText('Visible')).toBe(screen.getByRole('switch'))
  })

  it('renders disabled and does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<VisibilityToggle id={1} enabled={false} onToggle={onToggle} disabled />)

    const toggle = screen.getByRole('switch')
    expect(toggle.getAttribute('disabled')).not.toBeNull()

    await user.click(toggle)

    expect(onToggle).not.toHaveBeenCalled()
  })

  it('calls onToggle with the id and new checked state when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<VisibilityToggle id={42} enabled={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('switch'))

    expect(onToggle).toHaveBeenCalledWith(42, true)
  })

  it('toggling back from enabled calls onToggle with false', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<VisibilityToggle id={42} enabled onToggle={onToggle} />)

    await user.click(screen.getByRole('switch'))

    expect(onToggle).toHaveBeenCalledWith(42, false)
  })

  it('shows an error toast when onToggle rejects, without throwing', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockRejectedValue(new Error('network error'))
    render(<VisibilityToggle id={1} enabled={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('switch'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
