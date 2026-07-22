import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'
import { ProjectForm } from './ProjectForm.tsx'

const { useAuthContextMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const regularUser = { grants: [] } as unknown as User
const superUser = { grants: [{ role: -1 }] } as unknown as User

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

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderForm()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('shows a success toast after a successful create submission', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
    await user.type(screen.getByPlaceholderText('My Project'), 'My Project')
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await vi.waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith('Project created successfully')
    )
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it('shows an error toast with the rejection message when onSubmit fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Name already taken'))
    const onCancel = vi.fn()
    render(<ProjectForm onSubmit={onSubmit} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
    await user.type(screen.getByPlaceholderText('My Project'), 'My Project')
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await vi.waitFor(() => expect(toastErrorMock).toHaveBeenCalledWith('Name already taken'))
    expect(toastSuccessMock).not.toHaveBeenCalled()
  })
})

describe('ProjectForm (super user)', () => {
  beforeEach(() => {
    useAuthContextMock.mockReturnValue({
      user: superUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('renders the featured toggle for a super user, defaulting to off', () => {
    renderForm()
    expect(screen.getByText('Featured')).toBeDefined()
  })

  it('includes featured: true in the submission once the toggle is switched on', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
    await user.type(screen.getByPlaceholderText('My Project'), 'My Project')
    await user.click(screen.getByRole('switch', { name: 'Featured' }))
    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ featured: true }))
  })
})

describe('ProjectForm edit mode', () => {
  const existingProject = {
    id: 5,
    name: 'existing-project',
    displayName: 'Existing Project',
    description: 'An existing description',
    enabled: false,
    featured: false,
    deleted: false,
  } as Project

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

  const renderEditForm = (project: Project = existingProject) => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()
    render(<ProjectForm project={project} onSubmit={onSubmit} onCancel={onCancel} />)
    return { onSubmit, onCancel }
  }

  it('pre-populates the fields from the given project', () => {
    renderEditForm()

    expect(screen.getByDisplayValue('existing-project')).toBeDefined()
    expect(screen.getByDisplayValue('Existing Project')).toBeDefined()
    expect(screen.getByDisplayValue('An existing description')).toBeDefined()
  })

  it('shows "Update Project" instead of "Create Project" as the submit label', () => {
    renderEditForm()

    expect(screen.getByRole('button', { name: 'Update Project' })).toBeDefined()
    expect(screen.queryByRole('button', { name: /create project/i })).toBeNull()
  })

  it('submits the existing values unchanged, including a disabled "enabled" flag', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderEditForm()

    await user.click(screen.getByRole('button', { name: 'Update Project' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'existing-project',
      displayName: 'Existing Project',
      description: 'An existing description',
      enabled: false,
      featured: false,
    })
  })

  it('shows an update-specific success toast', async () => {
    const user = userEvent.setup()
    renderEditForm()

    await user.click(screen.getByRole('button', { name: 'Update Project' }))

    await vi.waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith('Project updated successfully')
    )
  })
})
