import { describe, expect, it } from 'vitest'
import { TeamRoleLabel } from './Team.ts'

describe('TeamRoleLabel', () => {
  it('labels every team role', () => {
    expect(TeamRoleLabel).toEqual({
      0: 'Invited',
      1: 'Member',
      2: 'Admin',
    })
  })
})
