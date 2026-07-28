import { describe, expect, it } from 'vitest'
import { TeamRoleLabel, toTeamRole } from './Team.ts'

describe('TeamRoleLabel', () => {
  it('labels every team role', () => {
    expect(TeamRoleLabel).toEqual({
      0: 'Invited',
      1: 'Member',
      2: 'Admin',
    })
  })
})

describe('toTeamRole', () => {
  it.each([0, 1, 2])('returns %i as-is when it is a valid TeamRole', (status) => {
    expect(toTeamRole(status)).toBe(status)
  })

  it.each([-1, 3, 100])('returns undefined for out-of-union value %i', (status) => {
    expect(toTeamRole(status)).toBeUndefined()
  })
})
