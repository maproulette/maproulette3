import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { TaskPriority } from '@/types/Priority'
import { DefaultPrioritySelect } from './DefaultPrioritySelect'

const { usePrioritizationContextMock } = vi.hoisted(() => ({
  usePrioritizationContextMock: vi.fn(),
}))

vi.mock('../PrioritizationContext', () => ({
  usePrioritizationContext: usePrioritizationContextMock,
}))

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DefaultPrioritySelect', () => {
  it('renders a radio option for each priority tier', () => {
    usePrioritizationContextMock.mockReturnValue({
      draft: { defaultPriority: TaskPriority.MEDIUM },
      setDefaultPriority: vi.fn(),
    })

    render(<DefaultPrioritySelect />)

    expect(screen.getByRole('radio', { name: /high/i })).toBeDefined()
    expect(screen.getByRole('radio', { name: /medium/i })).toBeDefined()
    expect(screen.getByRole('radio', { name: /low/i })).toBeDefined()
  })

  it('marks the radio matching the current draft default priority as checked', () => {
    usePrioritizationContextMock.mockReturnValue({
      draft: { defaultPriority: TaskPriority.LOW },
      setDefaultPriority: vi.fn(),
    })

    render(<DefaultPrioritySelect />)

    expect(screen.getByRole('radio', { name: /low/i }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: /high/i }).getAttribute('aria-checked')).toBe('false')
    expect(screen.getByRole('radio', { name: /medium/i }).getAttribute('aria-checked')).toBe(
      'false'
    )
  })

  it('calls setDefaultPriority with the numeric priority value when a different option is clicked', async () => {
    const setDefaultPriority = vi.fn()
    usePrioritizationContextMock.mockReturnValue({
      draft: { defaultPriority: TaskPriority.MEDIUM },
      setDefaultPriority,
    })
    const user = userEvent.setup()

    render(<DefaultPrioritySelect />)
    await user.click(screen.getByRole('radio', { name: /high/i }))

    expect(setDefaultPriority).toHaveBeenCalledWith(TaskPriority.HIGH)
  })

  it('calls setDefaultPriority with Low when the low option is clicked', async () => {
    const setDefaultPriority = vi.fn()
    usePrioritizationContextMock.mockReturnValue({
      draft: { defaultPriority: TaskPriority.HIGH },
      setDefaultPriority,
    })
    const user = userEvent.setup()

    render(<DefaultPrioritySelect />)
    await user.click(screen.getByRole('radio', { name: /low/i }))

    expect(setDefaultPriority).toHaveBeenCalledWith(TaskPriority.LOW)
  })
})
