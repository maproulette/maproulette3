import { afterEach, describe, expect, it } from 'vitest'
import type { User } from '@/types/User'
import { canPerformAdminActions, getEmailEnforcement, isMissingEmail } from './emailEnforcement.ts'

const setEnforcement = (value: string | undefined) => {
  ;(window.env as unknown as Record<string, string | undefined>).VITE_EMAIL_ENFORCEMENT = value
}

const makeUser = (email?: string): User =>
  ({
    settings: email === undefined ? undefined : { email },
  }) as User

afterEach(() => {
  setEnforcement(undefined)
})

describe('getEmailEnforcement', () => {
  it.each([
    ['required', 'required'],
    ['none', 'none'],
    [undefined, 'encouraged'],
    ['bogus', 'encouraged'],
  ] as const)('given configured value %s, returns %s', (configured, expected) => {
    setEnforcement(configured)
    expect(getEmailEnforcement()).toBe(expected)
  })
})

describe('isMissingEmail', () => {
  it.each([
    ['returns false when the user is undefined', undefined, false],
    ['returns true when settings are absent', {} as User, true],
    ['returns true when the email setting is absent', makeUser(undefined), true],
    ['returns true when the email setting is an empty string', makeUser(''), true],
    ['returns false when the email setting is present', makeUser('user@example.com'), false],
  ] as const)('%s', (_label, user, expected) => {
    expect(isMissingEmail(user)).toBe(expected)
  })
})

describe('canPerformAdminActions', () => {
  it('returns true when enforcement is not required, regardless of email', () => {
    setEnforcement('encouraged')
    expect(canPerformAdminActions(undefined)).toBe(true)
    expect(canPerformAdminActions(makeUser(undefined))).toBe(true)
  })

  it('returns true when enforcement is none, regardless of email', () => {
    setEnforcement('none')
    expect(canPerformAdminActions(makeUser(undefined))).toBe(true)
  })

  it('returns false when enforcement is required and the user is missing an email', () => {
    setEnforcement('required')
    expect(canPerformAdminActions(makeUser(undefined))).toBe(false)
  })

  it('returns true when enforcement is required and the user is undefined, since isMissingEmail short-circuits to false for a missing user', () => {
    setEnforcement('required')
    expect(canPerformAdminActions(undefined)).toBe(true)
  })

  it('returns true when enforcement is required and the user has an email', () => {
    setEnforcement('required')
    expect(canPerformAdminActions(makeUser('user@example.com'))).toBe(true)
  })
})
