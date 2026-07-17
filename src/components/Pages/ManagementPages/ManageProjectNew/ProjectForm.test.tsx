import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/types/User'
import { ProjectForm } from './ProjectForm.tsx'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const regularUser = { grants: [] } as unknown as User

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const renderForm = () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(<ProjectForm onSubmit={onSubmit} onCancel={onCancel} />)
  return { onSubmit, onCancel }
}

describe('ProjectForm validation (projectFormSchema)', () => {
  beforeEach(() => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('shows a required-field error for an empty project name on submit', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(await screen.findByText('Project name is required')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a required-field error for an empty display name on submit', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(await screen.findByText('Display name is required')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits successfully once required fields are filled in', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
    await user.type(screen.getByPlaceholderText('My Project'), 'My Project')
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await screen.findByRole('button', { name: /create project/i })
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-project',
        displayName: 'My Project',
        enabled: true,
        featured: false,
      })
    )
  })

  it('does not render the featured toggle for a non-super-user', () => {
    renderForm()
    expect(screen.queryByText('Featured')).toBeNull()
  })
})
