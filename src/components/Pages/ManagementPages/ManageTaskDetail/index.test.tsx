import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { TaskGetResponse } from '@/types/Task'
import type { User } from '@/types/User'
import { ManageTaskDetail } from './index'

const { getTaskMock, getChallengeMock, useAuthContextMock, useParamsMock } = vi.hoisted(() => ({
  getTaskMock: vi.fn(),
  getChallengeMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  useParamsMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useParams: useParamsMock,
    Link: ({
      children,
      to,
      params,
      ...props
    }: {
      children?: React.ReactNode
      to?: string
      params?: Record<string, string>
    } & Record<string, unknown>) => {
      let href = to ?? ''
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          href = href.replace(`$${key}`, value)
        }
      }
      return (
        <a href={href} {...props}>
          {children}
        </a>
      )
    },
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
  geometries: { type: 'FeatureCollection', features: [] },
  created: '2024-01-01T00:00:00.000Z',
  modified: '2024-02-01T00:00:00.000Z',
} as unknown as TaskGetResponse

const baseChallenge = {
  id: 10,
  parent: 5,
  owner: 1,
} as unknown as Record<string, unknown>

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
  getChallengeMock.mockReturnValue({ data: baseChallenge, isLoading: false })
})

describe('ManageTaskDetail', () => {
  it('shows an error message when the task fails to load', () => {
    getTaskMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    render(<ManageTaskDetail />)

    expect(screen.getByText(/failed to load task/i)).toBeDefined()
  })

  it('shows access denied for a non-owner, non-admin user', () => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    getChallengeMock.mockReturnValue({
      data: { id: 10, parent: 5, owner: 999 },
      isLoading: false,
    })

    render(<ManageTaskDetail />)

    expect(screen.getByText('Access denied')).toBeDefined()
    expect(screen.queryByText('Fix the sidewalk')).toBeNull()
  })

  it('renders full task details for a super user, including status and edit link', () => {
    render(<ManageTaskDetail />)

    expect(screen.getByText('Fix the sidewalk')).toBeDefined()
    expect(screen.getByText('Created')).toBeDefined()
    const editLink = screen.getByRole('link', { name: /edit task/i })
    expect(editLink.getAttribute('href')).toBe('/manage/task/42/edit')
  })

  it('renders links to browse and manage the parent challenge', () => {
    render(<ManageTaskDetail />)

    expect(screen.getByRole('link', { name: /browse challenge/i }).getAttribute('href')).toBe(
      '/challenge/10'
    )
    expect(screen.getByRole('link', { name: /manage challenge/i }).getAttribute('href')).toBe(
      '/manage/challenge/10'
    )
  })

  it('does not render an instructions dialog trigger when the task has no instruction', () => {
    getTaskMock.mockReturnValue({
      data: { ...baseTask, instruction: '' },
      isLoading: false,
      isError: false,
    })

    render(<ManageTaskDetail />)

    expect(screen.queryByRole('button', { name: /^instructions$/i })).toBeNull()
  })

  it('opens the task information dialog and shows created/modified/status details', async () => {
    const user = userEvent.setup()
    render(<ManageTaskDetail />)

    await user.click(screen.getByRole('button', { name: /task information/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Created')
    expect(dialog.textContent).toContain('Modified')
    expect(dialog.textContent).toContain('Status')
  })

  it('opens the GeoJSON dialog and shows the serialized geometry', async () => {
    const user = userEvent.setup()
    render(<ManageTaskDetail />)

    await user.click(screen.getByRole('button', { name: /^geojson$/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('FeatureCollection')
  })
})
