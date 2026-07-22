import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'

const { apiProjectMock, useAuthContextMock, navigateMock } = vi.hoisted(() => ({
  apiProjectMock: {
    useCreateProject: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { project: apiProjectMock },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

import { ManageProjectNew } from './index'

const fakeUser = { grants: [] } as unknown as User

let createMutateAsync: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  createMutateAsync = vi.fn().mockResolvedValue({ id: 99 })
  apiProjectMock.useCreateProject.mockReturnValue({ mutateAsync: createMutateAsync })
})

afterEach(() => cleanup())

const fillAndSubmit = async () => {
  const user = userEvent.setup()
  render(<ManageProjectNew />)
  await user.type(screen.getByPlaceholderText('my-project'), 'my-project')
  await user.type(screen.getByPlaceholderText('My Project'), 'My Project')
  await user.click(screen.getByRole('button', { name: /create project/i }))
}

describe('ManageProjectNew', () => {
  it('submits the entered values to useCreateProject without a project id', async () => {
    await fillAndSubmit()

    expect(createMutateAsync).toHaveBeenCalledWith({
      name: 'my-project',
      displayName: 'My Project',
      description: undefined,
      enabled: true,
      featured: false,
    })
  })

  it('navigates to the new project detail page when creation returns an id', async () => {
    await fillAndSubmit()

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/project/$projectId',
      params: { projectId: '99' },
    })
  })

  it('falls back to navigating to the projects list when creation returns no id', async () => {
    createMutateAsync.mockResolvedValue({})

    await fillAndSubmit()

    expect(navigateMock).toHaveBeenCalledWith({ to: '/manage/projects' })
  })

  it('navigates to the projects list when Cancel is clicked, without submitting', async () => {
    const user = userEvent.setup()
    render(<ManageProjectNew />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(createMutateAsync).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({ to: '/manage/projects' })
  })
})
