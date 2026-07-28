import { describe, expect, it } from 'vitest'
import type { TranslateFn } from '@/i18n'
import { getGitHubErrorMessage, getParentInfo } from './ReportModalHelpers'

// Mimics the real t() default-message fallback: since the message catalog
// isn't loaded in this test, always return the provided default message
// (or the id itself if no default was given).
const t: TranslateFn = (_id, _values, defaultMessage) => defaultMessage ?? _id

describe('getGitHubErrorMessage', () => {
  it('returns the auth error message when the message includes "Bad credentials"', () => {
    const result = getGitHubErrorMessage(t, 500, 'Bad credentials')
    expect(result).toBe(
      'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions.'
    )
  })

  it('returns the auth error message when status is 401, regardless of message text', () => {
    const result = getGitHubErrorMessage(t, 401, 'Unauthorized')
    expect(result).toBe(
      'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions.'
    )
  })

  it('returns the forbidden error message when status is 403', () => {
    const result = getGitHubErrorMessage(t, 403, 'Forbidden')
    expect(result).toBe(
      'GitHub API access forbidden. The token may not have the required permissions or the repository may be private.'
    )
  })

  it('returns the not-found error message when status is 404', () => {
    const result = getGitHubErrorMessage(t, 404, 'Not Found')
    expect(result).toBe(
      'GitHub repository not found. Please check that the repository exists and is accessible.'
    )
  })

  it('falls back to the raw message for an unrecognized status/message combination', () => {
    const result = getGitHubErrorMessage(t, 500, 'Internal Server Error')
    expect(result).toBe('Internal Server Error')
  })

  it('prioritizes the "Bad credentials" message check even when status is unrelated', () => {
    const result = getGitHubErrorMessage(t, 422, 'Bad credentials')
    expect(result).toBe(
      'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions.'
    )
  })
})

describe('getParentInfo', () => {
  it('extracts id and name from a parent object', () => {
    const result = getParentInfo({ id: 42, name: 'My Project' })
    expect(result).toEqual({ id: 42, name: 'My Project' })
  })

  it('defaults name to "Unknown Project" when the parent object has no name', () => {
    const result = getParentInfo({ id: 42 })
    expect(result).toEqual({ id: 42, name: 'Unknown Project' })
  })

  it('defaults name to "Unknown Project" when the parent object has an empty name', () => {
    const result = getParentInfo({ id: 42, name: '' })
    expect(result).toEqual({ id: 42, name: 'Unknown Project' })
  })

  it('defaults id to null when the parent object has no id', () => {
    const result = getParentInfo({ name: 'Orphan Project' })
    expect(result).toEqual({ id: null, name: 'Orphan Project' })
  })

  it('treats a numeric parent as the id, with an unknown name', () => {
    const result = getParentInfo(10)
    expect(result).toEqual({ id: 10, name: 'Unknown Project' })
  })

  it('treats a string parent as the id, with an unknown name', () => {
    const result = getParentInfo('project-10')
    expect(result).toEqual({ id: 'project-10', name: 'Unknown Project' })
  })

  it('returns null id and unknown name for null parent', () => {
    const result = getParentInfo(null)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })

  it('returns null id and unknown name for undefined parent', () => {
    const result = getParentInfo(undefined)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })

  it('returns null id and unknown name for other malformed input (e.g. a boolean)', () => {
    const result = getParentInfo(true)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })
})
