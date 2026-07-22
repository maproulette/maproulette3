import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ManageTasksOpen } from './index'

const { useAuthContextMock, navigateMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-stub">{to}</div>,
    Link: ({
      children,
      to,
      ...props
    }: { children?: React.ReactNode; to?: string } & Record<string, unknown>) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const superUser = { grants: [{ role: -1 }] } as unknown as User
const regularUser = { grants: [] } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ManageTasksOpen', () => {
  it('renders an access-denied message for a non-super user', () => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageTasksOpen />)

    expect(screen.getByText('Access Denied')).toBeDefined()
    expect(screen.queryByText('Open a task by ID')).toBeNull()
  })

  it('redirects when there is no logged-in user', () => {
    useAuthContextMock.mockReturnValue({
      user: undefined,
      isAuthenticated: false,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageTasksOpen />)

    expect(screen.getByTestId('navigate-stub').textContent).toBe('/')
  })

  describe('as a super user', () => {
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

    it('disables both action buttons until a valid task id is entered', async () => {
      const user = userEvent.setup()
      render(<ManageTasksOpen />)

      const viewButton = screen.getByRole('button', { name: /view task/i })
      const editButton = screen.getByRole('button', { name: /edit task/i })
      expect(viewButton).toHaveProperty('disabled', true)
      expect(editButton).toHaveProperty('disabled', true)

      await user.type(screen.getByLabelText('Task ID'), '123')

      expect(viewButton).toHaveProperty('disabled', false)
      expect(editButton).toHaveProperty('disabled', false)
    })

    it('keeps the buttons disabled for a zero or negative task id', async () => {
      const user = userEvent.setup()
      render(<ManageTasksOpen />)

      await user.type(screen.getByLabelText('Task ID'), '0')

      expect(screen.getByRole('button', { name: /view task/i })).toHaveProperty('disabled', true)
    })

    it('navigates to the task detail page on submit', async () => {
      const user = userEvent.setup()
      render(<ManageTasksOpen />)

      await user.type(screen.getByLabelText('Task ID'), '456')
      await user.click(screen.getByRole('button', { name: /view task/i }))

      expect(navigateMock).toHaveBeenCalledWith({
        to: '/manage/task/$taskId',
        params: { taskId: '456' },
      })
    })

    it('navigates to the task edit page when the edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<ManageTasksOpen />)

      await user.type(screen.getByLabelText('Task ID'), '789')
      await user.click(screen.getByRole('button', { name: /edit task/i }))

      expect(navigateMock).toHaveBeenCalledWith({
        to: '/manage/task/$taskId/edit',
        params: { taskId: '789' },
      })
    })

    it('renders quick links to Projects and Challenges', () => {
      render(<ManageTasksOpen />)

      expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('href')).toBe(
        '/manage/projects'
      )
      expect(screen.getByRole('link', { name: 'Challenges' }).getAttribute('href')).toBe(
        '/manage/challenges'
      )
    })
  })
})
