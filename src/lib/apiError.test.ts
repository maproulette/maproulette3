import type { NormalizedOptions } from 'ky'
import { HTTPError } from 'ky'
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiError.ts'

const makeHttpError = (body: unknown, status = 400) => {
  const response = new Response(JSON.stringify(body), { status })
  const request = new Request('http://example.test/api')
  return new HTTPError(response, request, {} as NormalizedOptions)
}

describe('getApiErrorMessage', () => {
  it('returns undefined for a plain Error', async () => {
    await expect(getApiErrorMessage(new Error('boom'))).resolves.toBeUndefined()
  })

  it('returns undefined for non-error values', async () => {
    await expect(getApiErrorMessage('nope')).resolves.toBeUndefined()
    await expect(getApiErrorMessage(undefined)).resolves.toBeUndefined()
    await expect(getApiErrorMessage(null)).resolves.toBeUndefined()
  })

  it('extracts the message field from the backend error body', async () => {
    const error = makeHttpError({ status: 'KO', message: 'Challenge not found' })
    await expect(getApiErrorMessage(error)).resolves.toBe('Challenge not found')
  })

  it('returns undefined when the body has no message field', async () => {
    const error = makeHttpError({ status: 'KO' })
    await expect(getApiErrorMessage(error)).resolves.toBeUndefined()
  })

  it('returns undefined when the message field is not a string', async () => {
    const error = makeHttpError({ status: 'KO', message: 123 })
    await expect(getApiErrorMessage(error)).resolves.toBeUndefined()
  })

  it('returns undefined when the response body is not valid JSON', async () => {
    const response = new Response('not json', { status: 500 })
    const request = new Request('http://example.test/api')
    const error = new HTTPError(response, request, {} as NormalizedOptions)
    await expect(getApiErrorMessage(error)).resolves.toBeUndefined()
  })
})
