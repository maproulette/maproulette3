import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'

const { apiProjectMock, useAuthContextMock, navigateMock, useParamsMock } = vi.hoisted(() => ({
  apiProjectMock: {
    getProject: vi.fn(),
    useUpdateProject: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
  navigateMock: vi.fn(),
  useParamsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { project: apiProjectMock },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useParams: useParamsMock,
}))

import { ManageProjectEdit } from './index'

const fakeUser = { grants: [] } as unknown as User

const existingProject = {
  id: 42,
  name: 'existing-project',
  displayName: 'Existing Project',
  description: 'An existing description',
  enabled: false,
  featured: false,
  deleted: false,
} as Project

let updateMutateAsync: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  useParamsMock.mockReturnValue({ projectId: '42' })
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  updateMutateAsync = vi.fn().mockResolvedValue(existingProject)
  apiProjectMock.useUpdateProject.mockReturnValue({ mutateAsync: updateMutateAsync })
  apiProjectMock.getProject.mockReturnValue({ data: existingProject, isLoading: false })
})

afterEach(() => cleanup())

describe('ManageProjectEdit', () => {
  it('fetches the project by the numeric id from the route params', () => {
    render(<ManageProjectEdit />)

    expect(apiProjectMock.getProject).toHaveBeenCalledWith(42)
  })

  it('shows a loading skeleton instead of the form while the project is loading', () => {
    apiProjectMock.getProject.mockReturnValue({ data: undefined, isLoading: true })

    render(<ManageProjectEdit />)

    expect(screen.queryByPlaceholderText('my-project')).toBeNull()
  })

  it('pre-populates the form fields with the fetched project once loaded', () => {
    render(<ManageProjectEdit />)

    expect(screen.getByDisplayValue('existing-project')).toBeDefined()
    expect(screen.getByDisplayValue('Existing Project')).toBeDefined()
    expect(screen.getByDisplayValue('An existing description')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Update Project' })).toBeDefined()
  })

  it('submits the updated values to useUpdateProject with the numeric project id, then navigates to the project detail page', async () => {
    const user = userEvent.setup()
    render(<ManageProjectEdit />)

    const nameInput = screen.getByDisplayValue('existing-project')
    await user.clear(nameInput)
    await user.type(nameInput, 'renamed-project')
    await user.click(screen.getByRole('button', { name: 'Update Project' }))

    expect(updateMutateAsync).toHaveBeenCalledWith({
      projectId: 42,
      updates: {
        name: 'renamed-project',
        displayName: 'Existing Project',
        description: 'An existing description',
        enabled: false,
        featured: false,
      },
    })
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/project/$projectId',
      params: { projectId: '42' },
    })
  })

  it('navigates to the project detail page when Cancel is clicked, without submitting', async () => {
    const user = userEvent.setup()
    render(<ManageProjectEdit />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(updateMutateAsync).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/project/$projectId',
      params: { projectId: '42' },
    })
  })
})
