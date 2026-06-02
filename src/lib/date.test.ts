import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { daysSince, formatDate, formatDateTime, formatLongDate, formatTimeAgo } from './date.ts'

const LOCALE = 'en-US'

describe('formatDate', () => {
  it('formats a date in medium style', () => {
    expect(formatDate(new Date('2026-02-01T12:00:00Z'), LOCALE)).toBe('Feb 1, 2026')
  })
})

describe('formatLongDate', () => {
  it('formats a date in long style', () => {
    expect(formatLongDate(new Date('2026-02-01T12:00:00Z'), LOCALE)).toBe('February 1, 2026')
  })
})

describe('formatDateTime', () => {
  it('includes both date and time components', () => {
    const result = formatDateTime(new Date('2026-04-01T14:30:00Z'), LOCALE)
    expect(result).toMatch(/Apr 1, 2026/)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "now" for the current instant', () => {
    expect(formatTimeAgo(new Date('2026-06-02T12:00:00Z'), LOCALE)).toBe('now')
  })

  it('formats minutes in the past', () => {
    expect(formatTimeAgo(new Date('2026-06-02T11:55:00Z'), LOCALE)).toBe('5 minutes ago')
  })

  it('formats hours in the past', () => {
    expect(formatTimeAgo(new Date('2026-06-02T09:00:00Z'), LOCALE)).toBe('3 hours ago')
  })

  it('formats one day in the past as "yesterday"', () => {
    expect(formatTimeAgo(new Date('2026-06-01T12:00:00Z'), LOCALE)).toBe('yesterday')
  })

  it('formats one day in the future as "tomorrow"', () => {
    expect(formatTimeAgo(new Date('2026-06-03T12:00:00Z'), LOCALE)).toBe('tomorrow')
  })

  it('formats multiple days in the past', () => {
    expect(formatTimeAgo(new Date('2026-05-30T12:00:00Z'), LOCALE)).toBe('3 days ago')
  })
})

describe('daysSince', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for the current instant', () => {
    expect(daysSince(new Date('2026-06-02T12:00:00Z'))).toBe(0)
  })

  it('returns whole days for past dates', () => {
    expect(daysSince(new Date('2026-05-30T12:00:00Z'))).toBe(3)
  })

  it('floors partial days', () => {
    expect(daysSince(new Date('2026-06-01T18:00:00Z'))).toBe(0)
  })

  it('returns a negative value for future dates', () => {
    expect(daysSince(new Date('2026-06-05T12:00:00Z'))).toBe(-3)
  })
})
