import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { TaskGetResponse } from '@/types/Task'
import type { User } from '@/types/User'
import { ManageTaskEdit } from './index'

const {
  getTaskMock,
  getChallengeMock,
  useUpdateTaskMock,
  useAuthContextMock,
  useParamsMock,
  navigateMock,
  updateTaskMutateAsync,
} = vi.hoisted(() => ({
  getTaskMock: vi.fn(),
  getChallengeMock: vi.fn(),
  useUpdateTaskMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  useParamsMock: vi.fn(),
  navigateMock: vi.fn(),
  updateTaskMutateAsync: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useParams: useParamsMock,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      task: {
        ...actual.api.task,
        getTask: getTaskMock,
        useUpdateTask: useUpdateTaskMock,
      },
      challenge: {
        ...actual.api.challenge,
        getChallenge: getChallengeMock,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const superUser = { osmProfile: { id: 1 }, grants: [{ role: -1 }] } as unknown as User
const regularUser = { osmProfile: { id: 1 }, grants: [] } as unknown as User

const baseTask = {
  id: 42,
  name: 'Fix the sidewalk',
  instruction: 'Please fix it',
  parent: 10,
  status: 0,
  errorTags: '',
  geometries: { type: 'Point', coordinates: [0, 0] },
} as unknown as TaskGetResponse

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  useParamsMock.mockReturnValue({ taskId: '42' })
  useAuthContextMock.mockReturnValue({
    user: superUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  getTaskMock.mockReturnValue({ data: baseTask, isLoading: false, isError: false })
  getChallengeMock.mockReturnValue({ data: { id: 10, parent: 5, owner: 1 }, isLoading: false })
  useUpdateTaskMock.mockReturnValue({ mutateAsync: updateTaskMutateAsync })
  updateTaskMutateAsync.mockResolvedValue(undefined)
})

describe('ManageTaskEdit', () => {
  it('shows a loading placeholder while the task is being fetched', () => {
    getTaskMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    render(<ManageTaskEdit />)

    expect(screen.getByText('Task Details')).toBeDefined()
    expect(screen.queryByPlaceholderText('Task name')).toBeNull()
  })

  it('shows an access-denied message for a non-owner, non-admin user', () => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    getChallengeMock.mockReturnValue({ data: { id: 10, parent: 5, owner: 999 }, isLoading: false })

    render(<ManageTaskEdit />)

    expect(screen.getByText('Access denied')).toBeDefined()
    expect(screen.queryByPlaceholderText('Task name')).toBeNull()
  })

  it('falls back to the loading state when the task query errors with no data', () => {
    // Reason: index.tsx checks `!task` before `isError`, so an errored query
    // with no cached data renders the loading skeleton rather than an error.
    getTaskMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    render(<ManageTaskEdit />)

    expect(screen.getByText('Task Details')).toBeDefined()
    expect(screen.queryByPlaceholderText('Task name')).toBeNull()
    expect(screen.queryByText('Access denied')).toBeNull()
  })

  it('renders the TaskForm pre-filled with the loaded task for an authorized user', () => {
    render(<ManageTaskEdit />)

    expect(screen.getByDisplayValue('Fix the sidewalk')).toBeDefined()
  })

  it('submits the updated task and navigates to the task detail page', async () => {
    const user = userEvent.setup()
    render(<ManageTaskEdit />)

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(updateTaskMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 42,
        body: expect.objectContaining({ name: 'Fix the sidewalk', parent: 10 }),
      })
    )
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/task/$taskId',
      params: { taskId: '42' },
    })
  })

  it('cancelling navigates back to the task detail page without saving', async () => {
    const user = userEvent.setup()
    render(<ManageTaskEdit />)

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(updateTaskMutateAsync).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/manage/task/$taskId',
      params: { taskId: '42' },
    })
  })
})
