import { HTTPError } from 'ky'

/**
 * Extracts the backend's `{status: "KO", message: "..."}` error body from a
 * failed ky request, if present.
 */
export const getApiErrorMessage = async (error: unknown): Promise<string | undefined> => {
  if (!(error instanceof HTTPError)) return undefined

  try {
    const body = await error.response.json()
    return typeof body?.message === 'string' ? body.message : undefined
  } catch {
    return undefined
  }
}
