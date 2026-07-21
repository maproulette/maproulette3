import { describe, expect, it } from 'vitest'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { canManageChallenge } from './challengePermissions.ts'

const ROLE_SUPER_USER = -1
const ROLE_ADMIN = 1
const ROLE_WRITE_ACCESS = 2
const ROLE_READ_ONLY = 3

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

function makeChallenge(props: { owner?: number; parent?: number } = {}): Challenge {
  return {
    owner: props.owner,
    parent: props.parent,
  } as Challenge
}

describe('canManageChallenge', () => {
  it('returns false when the user is missing', () => {
    const user = null
    const challenge = makeChallenge({ owner: 1, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(false)
  })

  it('returns false when the challenge is missing', () => {
    const user = makeUser({ osmId: 1 })
    const challenge = null
    expect(canManageChallenge(user, challenge)).toBe(false)
  })

  it('returns true when the user is the challenge owner', () => {
    const user = makeUser({ osmId: 42 })
    const challenge = makeChallenge({ owner: 42, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(true)
  })

  it('returns true when the user holds a super-user grant', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_SUPER_USER }] })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(true)
  })

  it('returns true when the user has admin access on the parent project', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_ADMIN, targetId: 10 }] })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(true)
  })

  it('returns true when the user has write access on the parent project', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_WRITE_ACCESS, targetId: 10 }] })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(true)
  })

  it('returns false when the only grant is on a different project', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_ADMIN, targetId: 99 }] })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(false)
  })

  it('returns false when the project grant is read-only', () => {
    const user = makeUser({ osmId: 1, grants: [{ role: ROLE_READ_ONLY, targetId: 10 }] })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(false)
  })

  it('returns false for an unrelated user with no grants', () => {
    const user = makeUser({ osmId: 1 })
    const challenge = makeChallenge({ owner: 999, parent: 10 })
    expect(canManageChallenge(user, challenge)).toBe(false)
  })
})
