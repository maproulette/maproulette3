import { describe, expect, it } from 'vitest'
import { formSchema } from './formSchema.ts'

const validInput = {
  defaultEditor: 1,
  defaultBasemap: 'MAPNIK',
  defaultBasemapId: 'custom-basemap-id',
  locale: 'en-US',
  email: 'user@example.com',
  emailOptIn: true,
  leaderboardOptOut: false,
  needsReview: 2,
  isReviewer: true,
  allowFollowing: true,
  theme: 1,
  seeTagFixSuggestions: true,
  disableTaskConfirm: false,
}

describe('formSchema', () => {
  it('accepts a fully populated valid input', () => {
    const result = formSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts the minimal input with only the required field set', () => {
    const result = formSchema.safeParse({ defaultBasemap: -1 })
    expect(result.success).toBe(true)
  })

  it('rejects input missing the required defaultBasemap field', () => {
    const { defaultBasemap: _defaultBasemap, ...rest } = validInput
    const result = formSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects a defaultEditor value not present in editorOptions', () => {
    const result = formSchema.safeParse({ ...validInput, defaultEditor: 999 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Invalid editor option')).toBe(
        true
      )
    }
  })

  it('accepts every documented editor option value', () => {
    for (const value of [-1, 0, 1, 2, 3, 4, 5]) {
      const result = formSchema.safeParse({ ...validInput, defaultEditor: value })
      expect(result.success).toBe(true)
    }
  })

  it('rejects a defaultBasemap value not present in baseMapOptions', () => {
    const result = formSchema.safeParse({ ...validInput, defaultBasemap: 'NotARealBasemap' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Invalid basemap option')).toBe(
        true
      )
    }
  })

  it('accepts both numeric and string basemap option values', () => {
    expect(formSchema.safeParse({ ...validInput, defaultBasemap: -1 }).success).toBe(true)
    expect(formSchema.safeParse({ ...validInput, defaultBasemap: 'Bing' }).success).toBe(true)
  })

  it('rejects a locale value not present in localeOptions', () => {
    const result = formSchema.safeParse({ ...validInput, locale: 'xx-XX' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Invalid language option')).toBe(
        true
      )
    }
  })

  it('omits the optional locale field without failing', () => {
    const { locale: _locale, ...rest } = validInput
    const result = formSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it('accepts a well-formed email address', () => {
    const result = formSchema.safeParse({ ...validInput, email: 'someone@maproulette.org' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty string for email', () => {
    const result = formSchema.safeParse({ ...validInput, email: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed email address', () => {
    const result = formSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative needsReview value', () => {
    const result = formSchema.safeParse({ ...validInput, needsReview: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts a needsReview value of zero', () => {
    const result = formSchema.safeParse({ ...validInput, needsReview: 0 })
    expect(result.success).toBe(true)
  })

  it('rejects a theme value below the minimum', () => {
    const result = formSchema.safeParse({ ...validInput, theme: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects a theme value above the maximum', () => {
    const result = formSchema.safeParse({ ...validInput, theme: 3 })
    expect(result.success).toBe(false)
  })

  it('accepts theme values at the boundaries', () => {
    expect(formSchema.safeParse({ ...validInput, theme: 0 }).success).toBe(true)
    expect(formSchema.safeParse({ ...validInput, theme: 2 }).success).toBe(true)
  })

  it('rejects a non-boolean value for a boolean field', () => {
    const result = formSchema.safeParse({ ...validInput, emailOptIn: 'yes' })
    expect(result.success).toBe(false)
  })
})
