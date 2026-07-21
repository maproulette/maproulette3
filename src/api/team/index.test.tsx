import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { Team, TeamUser } from '@/types/Team'

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

import { team } from './index'

function makeTeam(id: number): Team {
  return { id } as Team
}

function makeTeamUser(id: number): TeamUser {
  return { id } as TeamUser
}

describe('team', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  describe('get', () => {
    it('fetches a team by id', async () => {
      const teamData = makeTeam(3)
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(teamData) })

      const { result } = renderHookWithClient(() => team.get(3))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/team/3')
      expect(result.current.data).toEqual(teamData)
    })

    it('is disabled when teamId is undefined', () => {
      const { result } = renderHookWithClient(() => team.get(undefined))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('members', () => {
    it('fetches the members of a team', async () => {
      const members = [makeTeamUser(1), makeTeamUser(2)]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(members) })

      const { result } = renderHookWithClient(() => team.members(3))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/team/3/userMembers')
      expect(result.current.data).toEqual(members)
    })

    it('is disabled when teamId is undefined', () => {
      const { result } = renderHookWithClient(() => team.members(undefined))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('findTeamsByName', () => {
    it('searches teams by name using a query search param', async () => {
      const teams = [makeTeam(1)]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(teams) })

      const { result } = renderHookWithClient(() => team.findTeamsByName('mappers'))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/teams/find', {
        searchParams: { query: 'mappers' },
      })
      expect(result.current.data).toEqual(teams)
    })

    it('is disabled when the query string is empty', () => {
      const { result } = renderHookWithClient(() => team.findTeamsByName(''))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('is disabled when enabled=false even with a non-empty query', () => {
      const { result } = renderHookWithClient(() => team.findTeamsByName('mappers', false))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('useCreateTeam', () => {
    it('posts the payload and invalidates the user query on success', async () => {
      const created = makeTeam(4)
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(created) })

      const { result, queryClient } = renderHookWithClient(() => team.useCreateTeam())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ name: 'New Team', description: 'desc' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/team', {
        json: { name: 'New Team', description: 'desc' },
      })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
    })
  })

  describe('useUpdateTeam', () => {
    it('puts the payload and invalidates the specific team query on success', async () => {
      const updated = makeTeam(4)
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updated) })

      const { result, queryClient } = renderHookWithClient(() => team.useUpdateTeam())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ teamId: 4, payload: { name: 'Renamed' } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/team/4', {
        json: { name: 'Renamed' },
      })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 4] })
    })
  })

  describe('useDeleteTeam', () => {
    it('deletes the team and invalidates the user and team queries on success', async () => {
      apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

      const { result, queryClient } = renderHookWithClient(() => team.useDeleteTeam())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(4)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/team/4')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team'] })
    })
  })

  describe('useInviteMember', () => {
    it('puts to the invite endpoint and invalidates the members query on success', async () => {
      const invited = makeTeamUser(9)
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(invited) })

      const { result, queryClient } = renderHookWithClient(() => team.useInviteMember())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ teamId: 4, userId: 9, role: 1 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/team/4/user/9/invite/1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 4, 'members'] })
    })
  })

  describe('useAcceptInvite', () => {
    it('puts to the accept endpoint and invalidates team and user queries on success', async () => {
      const accepted = makeTeamUser(9)
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(accepted) })

      const { result, queryClient } = renderHookWithClient(() => team.useAcceptInvite())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(4)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/team/4/invite/accept')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 4] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
    })
  })

  describe('useDeclineInvite', () => {
    it('deletes the invite and invalidates the user query on success', async () => {
      apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

      const { result, queryClient } = renderHookWithClient(() => team.useDeclineInvite())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(4)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/team/4/invite')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
    })
  })

  describe('useChangeRole', () => {
    it('puts the new role and invalidates the members query on success', async () => {
      const changed = makeTeamUser(9)
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(changed) })

      const { result, queryClient } = renderHookWithClient(() => team.useChangeRole())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ teamId: 4, userId: 9, role: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/team/4/user/9/role/2')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 4, 'members'] })
    })
  })

  describe('useRemoveMember', () => {
    it('deletes the member and invalidates the members query on success', async () => {
      apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

      const { result, queryClient } = renderHookWithClient(() => team.useRemoveMember())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ teamId: 4, userId: 9 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/team/4/user/9/')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 4, 'members'] })
    })
  })
})
