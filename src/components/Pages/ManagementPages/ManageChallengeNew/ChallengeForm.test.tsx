import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { ChallengeForm } from './ChallengeForm.tsx'

const { apiProjectMock, useAuthContextMock, useChallengeFormContextMock } = vi.hoisted(() => ({
  apiProjectMock: {
    getProject: vi.fn(),
    getManagedProjects: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
  useChallengeFormContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: {
        ...actual.api.project,
        getProject: apiProjectMock.getProject,
        getManagedProjects: apiProjectMock.getManagedProjects,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@/contexts/ChallengeFormContext', () => ({
  useChallengeFormContext: useChallengeFormContextMock,
}))

const fakeUser = { osmProfile: { id: 1, displayName: 'TestUser' }, grants: [] } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  apiProjectMock.getProject.mockReturnValue({ data: undefined, isLoading: false })
  apiProjectMock.getManagedProjects.mockReturnValue({
    data: [],
    isLoading: false,
    isFetching: false,
  })
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

const renderCreateForm = (projectId?: number) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  useChallengeFormContextMock.mockReturnValue({
    challenge: undefined,
    projectId,
    isLoading: false,
    onSubmit,
    onCancel,
  })
  render(<ChallengeForm />)
  return { onSubmit, onCancel }
}

const renderEditForm = (challenge: Challenge) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  useChallengeFormContextMock.mockReturnValue({
    challenge,
    projectId: challenge.parent,
    isLoading: false,
    onSubmit,
    onCancel,
  })
  render(<ChallengeForm />)
  return { onSubmit, onCancel }
}

describe('ChallengeForm validation (create mode)', () => {
  it('shows every required-field error when submitting a blank form', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderCreateForm(undefined)

    await user.click(screen.getByRole('button', { name: /create challenge/i }))

    expect(await screen.findByText('Please select a project')).toBeDefined()
    expect(screen.getByText('Challenge name must be at least 3 characters')).toBeDefined()
    expect(screen.getByText('Description is required')).toBeDefined()
    expect(screen.getByText('Instructions are required')).toBeDefined()
    expect(screen.getByText('An Overpass query is required')).toBeDefined()
    expect(
      screen.getByText('You must read and accept the Automated Edits code of conduct')
    ).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires a GeoJSON URL when the remote GeoJSON data source is selected', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderCreateForm(undefined)

    await user.click(screen.getByRole('radio', { name: /I have a URL to the GeoJSON data/i }))
    await user.click(screen.getByRole('button', { name: /create challenge/i }))

    expect(await screen.findByText('A GeoJSON URL is required')).toBeDefined()
    expect(screen.queryByText('An Overpass query is required')).toBeNull()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits successfully once all required create-mode fields are provided', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderCreateForm(42)

    await user.type(screen.getByPlaceholderText(/Challenge/), 'My New Challenge')
    await user.type(
      screen.getByPlaceholderText('Describe what this challenge is about...'),
      'A description'
    )
    await user.type(
      screen.getByPlaceholderText('Instructions for completing tasks...'),
      'Some instructions'
    )
    await user.type(
      screen.getByPlaceholderText('[out:xml][timeout:25];(way[highway=primary];);out meta;'),
      'a valid overpass query'
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /I have read and understand the OSM Automated Edits code of conduct/i,
      })
    )
    await user.click(screen.getByRole('button', { name: /create challenge/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 42,
        name: 'My New Challenge',
        description: 'A description',
        instruction: 'Some instructions',
        dataSource: 'overpass',
        overpassQL: 'a valid overpass query',
        automatedEditsCodeAgreement: true,
      })
    )
  })
})

describe('ChallengeForm validation (edit mode)', () => {
  const existingChallenge = {
    id: 5,
    parent: 10,
    name: 'Existing Challenge',
    description: 'Existing description',
    instruction: 'Existing instructions',
    difficulty: 2,
    overpassQL: 'existing overpass query',
    remoteGeoJson: '',
  } as unknown as Challenge

  it('submits successfully without requiring project selection or the agreement checkbox', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderEditForm(existingChallenge)

    await user.click(screen.getByRole('button', { name: /update challenge/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 10,
        name: 'Existing Challenge',
        automatedEditsCodeAgreement: true,
      })
    )
  })

  it('does not render the automated edits agreement checkbox when editing', () => {
    renderEditForm(existingChallenge)

    expect(
      screen.queryByRole('checkbox', {
        name: /I have read and understand the OSM Automated Edits code of conduct/i,
      })
    ).toBeNull()
  })
})
