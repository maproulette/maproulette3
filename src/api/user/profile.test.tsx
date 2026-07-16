import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { UserSettings } from '@/types/User'

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest: apiRequestMock }
})

import { userProfile } from './profile'

describe('userProfile', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.put.mockReset()
  })

  it('getUser fetches a user by id', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ id: 5 }) })

    const { result } = renderHookWithClient(() => userProfile.getUser(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5')
    expect(result.current.data).toEqual({ id: 5 })
  })

  it('getUser is disabled when the userId is falsy', () => {
    const { result } = renderHookWithClient(() => userProfile.getUser(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('activity fetches the user activity feed', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1 }]) })

    const { result } = renderHookWithClient(() => userProfile.activity())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/user/activity')
    expect(result.current.data).toEqual([{ id: 1 }])
  })

  it('metrics fetches user metrics with the default monthDuration', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ total: 10 }) })

    const { result } = renderHookWithClient(() => userProfile.metrics(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/user/5/metrics', {
      searchParams: { monthDuration: -1 },
    })
    expect(result.current.data).toEqual({ total: 10 })
  })

  it('metrics forwards an explicit monthDuration', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ total: 3 }) })

    const { result } = renderHookWithClient(() => userProfile.metrics(5, 6))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/user/5/metrics', {
      searchParams: { monthDuration: 6 },
    })
  })

  it('metrics is disabled when there is no userId', () => {
    const { result } = renderHookWithClient(() => userProfile.metrics(undefined))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('topChallenges fetches with default paging params', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1 }]) })

    const { result } = renderHookWithClient(() => userProfile.topChallenges(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/user/5/topChallenges', {
      searchParams: { monthDuration: -1, limit: 10, offset: 0 },
    })
  })

  it('topChallenges forwards explicit paging params', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() =>
      userProfile.topChallenges(5, { monthDuration: 3, limit: 25, offset: 50 })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/user/5/topChallenges', {
      searchParams: { monthDuration: 3, limit: 25, offset: 50 },
    })
  })

  it('savedChallenges fetches with the given limit and page', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 9 }]) })

    const { result } = renderHookWithClient(() => userProfile.savedChallenges(5, 20, 1))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5/saved', {
      searchParams: { limit: 20, page: 1 },
    })
    expect(result.current.data).toEqual([{ id: 9 }])
  })

  it('savedTasks fetches with the given limit and page', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 11 }]) })

    const { result } = renderHookWithClient(() => userProfile.savedTasks(5, 20, 1))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5/savedTasks', {
      searchParams: { limit: 20, page: 1 },
    })
    expect(result.current.data).toEqual([{ id: 11 }])
  })

  it('lockedTasks fetches with the default limit', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 4 }]) })

    const { result } = renderHookWithClient(() => userProfile.lockedTasks(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5/lockedTasks', {
      searchParams: { limit: 50 },
    })
  })

  it('teamMemberships fetches the memberships for a user', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 2 }]) })

    const { result } = renderHookWithClient(() => userProfile.teamMemberships(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/team/all/user/5/memberships')
    expect(result.current.data).toEqual([{ id: 2 }])
  })

  it('teamMemberships is disabled when there is no userId', () => {
    const { result } = renderHookWithClient(() => userProfile.teamMemberships(undefined))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useUpdateUserSettings PUTs settings and stringifies properties, then updates the whoami cache', async () => {
    const updatedUser = { id: 5, name: 'Updated' }
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updatedUser) })

    const { result, queryClient } = renderHookWithClient(() => userProfile.useUpdateUserSettings())
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    result.current.mutate({
      userId: 5,
      settings: { defaultEditor: 1 } as unknown as UserSettings,
      properties: { theme: 'dark' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5', {
      json: { defaultEditor: 1, properties: JSON.stringify({ theme: 'dark' }) },
    })
    expect(setQueryDataSpy).toHaveBeenCalledWith(['user', 'whoami'], updatedUser)
  })

  it('useUpdateUserSettings omits the properties field when none are given', async () => {
    const updatedUser = { id: 5, name: 'Updated' }
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updatedUser) })

    const { result } = renderHookWithClient(() => userProfile.useUpdateUserSettings())

    result.current.mutate({
      userId: 5,
      settings: { defaultEditor: 1 } as unknown as UserSettings,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5', {
      json: { defaultEditor: 1 },
    })
  })

  it('useRegenerateApiKey PUTs to the apikey endpoint, updates the whoami cache, and invalidates the user query', async () => {
    const updatedUser = { id: 5, apiKey: 'new-key' }
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updatedUser) })

    const { result, queryClient } = renderHookWithClient(() => userProfile.useRegenerateApiKey())
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5/apikey')
    expect(setQueryDataSpy).toHaveBeenCalledWith(['user', 'whoami'], updatedUser)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 5] })
  })
})
