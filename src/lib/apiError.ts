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

/** Describes the lock a user already holds elsewhere, as returned on a 409 conflict. */
export interface LockConflict {
  lockedTaskId: number
  parentName?: string
  bundledTasks: number[]
  startedAt?: string
}

/**
 * A user may only hold one active edit lock at a time. Locking a task (or creating/updating
 * a bundle) while already holding a different lock returns 409 with details of that lock, so
 * the UI can offer to release it and retry. Returns undefined for any other kind of error.
 */
export const getLockConflict = async (error: unknown): Promise<LockConflict | undefined> => {
  if (!(error instanceof HTTPError) || error.response.status !== 409) return undefined

  try {
    const body = await error.response.json()
    if (typeof body?.lockedTaskId !== 'number') return undefined
    return {
      lockedTaskId: body.lockedTaskId,
      parentName: typeof body.parentName === 'string' ? body.parentName : undefined,
      bundledTasks: Array.isArray(body.bundledTasks) ? body.bundledTasks : [],
      startedAt: typeof body.startedAt === 'string' ? body.startedAt : undefined,
    }
  } catch {
    return undefined
  }
}
