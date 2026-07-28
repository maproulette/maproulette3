// @vitest-environment happy-dom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '@/types/User'
import { isSuperUser, SuperAdminGuard } from './SuperAdminGuard.tsx'

const ROLE_SUPER_USER = -1
const ROLE_ADMIN = 1
const ROLE_WRITE_ACCESS = 2
const ROLE_READ_ONLY = 3

const mockUseAuthContext = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) =>
    createElement('div', { 'data-testid': 'navigate', 'data-to': to }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}))

vi.mock('@/i18n', () => ({
  useIntl: () => ({
    t: (id: string, _values?: unknown, defaultMessage?: string) => defaultMessage ?? id,
  }),
}))

function renderComponent(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return {
    container,
    unmount() {
      act(() => root.unmount())
      container.remove()
    },
  }
}

type GrantFixture = { role: number; targetId?: number }

function makeUser(props: { osmId?: number; grants?: GrantFixture[] } = {}): User {
  return {
    osmProfile: props.osmId != null ? { id: props.osmId } : undefined,
    grants: props.grants?.map((g) => ({
      role: g.role,
      target: g.targetId != null ? { objectId: g.targetId } : undefined,
    })),
  } as User
}

describe('isSuperUser', () => {
  it('returns false when the user is null', () => {
    expect(isSuperUser(null)).toBe(false)
  })

  it('returns false when the user is undefined', () => {
    expect(isSuperUser(undefined)).toBe(false)
  })

  it('returns false when the user has no grants', () => {
    const user = makeUser({ osmId: 1 })
    expect(isSuperUser(user)).toBe(false)
  })

  it('returns false when the user has an empty grants array', () => {
    const user = makeUser({ osmId: 1, grants: [] })
    expect(isSuperUser(user)).toBe(false)
  })

  it('returns true when the user holds a super-user grant', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_SUPER_USER }] })
    expect(isSuperUser(user)).toBe(true)
  })

  it('returns true when the user holds a super-user grant among other grants', () => {
    const user = makeUser({
      osmId: 1,
      grants: [{ role: ROLE_READ_ONLY, targetId: 5 }, { role: ROLE_SUPER_USER }],
    })
    expect(isSuperUser(user)).toBe(true)
  })

  it('returns false when the user only has an admin grant', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_ADMIN, targetId: 10 }] })
    expect(isSuperUser(user)).toBe(false)
  })

  it('returns false when the user only has a write-access grant', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_WRITE_ACCESS, targetId: 10 }] })
    expect(isSuperUser(user)).toBe(false)
  })

  it('returns false when the user only has a read-only grant', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_READ_ONLY, targetId: 10 }] })
    expect(isSuperUser(user)).toBe(false)
  })
})

describe('SuperAdminGuard', () => {
  it('redirects to home when there is no logged-in user', () => {
    mockUseAuthContext.mockReturnValue({ user: null })
    const { container, unmount } = renderComponent(
      createElement(SuperAdminGuard, null, createElement('div', null, 'secret'))
    )

    const navigate = container.querySelector('[data-testid="navigate"]')
    expect(navigate).not.toBeNull()
    expect(navigate?.getAttribute('data-to')).toBe('/')
    expect(container.textContent).not.toContain('secret')

    unmount()
  })

  it('renders the default access-denied message for a logged-in non-super-user', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_ADMIN, targetId: 10 }] })
    mockUseAuthContext.mockReturnValue({ user })
    const { container, unmount } = renderComponent(
      createElement(SuperAdminGuard, null, createElement('div', null, 'secret'))
    )

    expect(container.textContent).toContain('Access Denied')
    expect(container.textContent).not.toContain('secret')

    unmount()
  })

  it('renders the provided fallback instead of the default message for a non-super-user', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_ADMIN, targetId: 10 }] })
    mockUseAuthContext.mockReturnValue({ user })
    const { container, unmount } = renderComponent(
      createElement(
        SuperAdminGuard,
        { fallback: createElement('div', null, 'custom fallback') } as unknown as Parameters<
          typeof SuperAdminGuard
        >[0],
        createElement('div', null, 'secret')
      )
    )

    expect(container.textContent).toContain('custom fallback')
    expect(container.textContent).not.toContain('Access Denied')
    expect(container.textContent).not.toContain('secret')

    unmount()
  })

  it('renders the children for a super-user', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_SUPER_USER }] })
    mockUseAuthContext.mockReturnValue({ user })
    const { container, unmount } = renderComponent(
      createElement(SuperAdminGuard, null, createElement('div', null, 'secret'))
    )

    expect(container.textContent).toContain('secret')

    unmount()
  })
})
