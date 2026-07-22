import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'

interface StubLinkProps {
  to?: string
  params?: Record<string, string>
  search?: Record<string, unknown>
  className?: string
  children?: ReactNode
}

const { apiProjectMock, apiUserMock, useAuthContextMock, useQueryMock } = vi.hoisted(() => ({
  apiProjectMock: {
    getManagedProjects: vi.fn(),
    useUpdateProject: vi.fn(),
    useDeleteProject: vi.fn(),
    exportProjectTasksCsv: vi.fn(),
  },
  apiUserMock: {
    useUpdateUserSettings: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
  useQueryMock: vi.fn(),
}))

// The provider always issues a challenge-listing query via the raw `useQuery` hook
// (rather than one of our own API hooks); stubbing it here avoids needing a real
// QueryClientProvider just to exercise this page's wiring.
vi.mock('@/api', () => ({
  api: {
    project: apiProjectMock,
    user: apiUserMock,
    challenge: {
      getChallengesListingOptions: vi.fn().mockReturnValue({ queryKey: ['test'] }),
    },
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, className, children }: StubLinkProps) => {
    const href = params
      ? Object.entries(params).reduce(
          (acc, [key, value]) => acc.replace(`$${key}`, value),
          to ?? ''
        )
      : to
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

import { ManageProjects } from './index'

const fakeUser = { id: 1, grants: [] } as unknown as User

const makeProject = (overrides: Partial<Project>): Project =>
  ({
    name: overrides.name ?? 'project',
    enabled: true,
    deleted: false,
    featured: false,
    ...overrides,
  }) as Project

beforeEach(() => {
  vi.clearAllMocks()
  useAuthContextMock.mockReturnValue({ user: fakeUser })
  useQueryMock.mockReturnValue({ data: [] })
  apiProjectMock.useUpdateProject.mockReturnValue({ mutate: vi.fn() })
  apiProjectMock.useDeleteProject.mockReturnValue({ mutate: vi.fn() })
  apiUserMock.useUpdateUserSettings.mockReturnValue({ mutate: vi.fn() })
})

afterEach(() => cleanup())

describe('ManageProjects (provider + content integration)', () => {
  it('renders nothing project-related while the managed-projects query is loading', () => {
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    })

    render(<ManageProjects />)

    expect(screen.queryByText('Project One')).toBeNull()
    expect(screen.queryByText('No projects found')).toBeNull()
  })

  it('renders the fetched projects (default grid view) once loaded', () => {
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: [makeProject({ id: 1, displayName: 'Project One' })],
      isLoading: false,
      isFetching: false,
    })

    render(<ManageProjects />)

    expect(screen.getByRole('heading', { name: 'Project One' })).toBeDefined()
  })

  it('shows an empty state when the query resolves with no projects', () => {
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    })

    render(<ManageProjects />)

    expect(screen.getByText('No projects found')).toBeDefined()
  })
})
