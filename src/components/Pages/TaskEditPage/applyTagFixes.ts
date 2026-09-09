import { applyTagFix, type TagFix } from '@/lib/cooperativeWork'
import { logger } from '@/lib/logger'
import { type IdContext, type IdGlobal, isEntityLoaded } from '@/types/iDEditor'

/**
 * Apply a tag-fix challenge's proposed tag changes to the elements loaded in
 * iD, as pending edits the mapper can review, adjust or undo before saving.
 *
 * Returns the entity ids that were changed. Elements iD has not loaded yet are
 * skipped rather than guessed at, so the caller can retry as data arrives.
 */
export const applyTagFixesInId = (
  context: IdContext,
  iDGlobal: IdGlobal | undefined,
  fixes: TagFix[]
): string[] => {
  if (!iDGlobal?.actionChangeTags) return []

  const applied: string[] = []
  for (const fix of fixes) {
    try {
      const entity = context.hasEntity(fix.entityId)
      if (!entity) continue

      const nextTags = applyTagFix(entity.tags ?? {}, fix)
      // Nothing to do when the element already carries the proposed tags —
      // performing the action anyway would put a no-op on the undo stack and
      // make the task look edited when it isn't.
      if (JSON.stringify(nextTags) === JSON.stringify(entity.tags ?? {})) continue

      context.perform(
        iDGlobal.actionChangeTags(fix.entityId, nextTags),
        'MapRoulette suggested tag change'
      )
      applied.push(fix.entityId)
    } catch (error) {
      logger.warn('Could not apply suggested tag change', { entityId: fix.entityId, error })
    }
  }
  return applied
}

/**
 * The tags an element should carry for the challenge's suggestion to be
 * satisfied: how it looked before any editing, with the fix applied.
 */
const targetTags = (context: IdContext, fix: TagFix): Record<string, string> => {
  const base = context.history?.().base?.().hasEntity(fix.entityId)?.tags ?? {}
  return applyTagFix(base, fix)
}

const sameTags = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key])
}

/**
 * Tag fixes whose elements no longer look the way the challenge suggested,
 * whether because the mapper undid the change or because they edited the
 * element further.
 *
 * Elements iD has not loaded are treated as matching, so a slow download does
 * not momentarily look like the mapper changed something.
 */
export const divergedTagFixes = (context: IdContext, fixes: TagFix[]): TagFix[] =>
  fixes.filter((fix) => {
    try {
      const entity = context.hasEntity(fix.entityId)
      if (!entity) return false
      return !sameTags(entity.tags ?? {}, targetTags(context, fix))
    } catch {
      return false
    }
  })

/**
 * Put the tag-fix elements back exactly as the challenge suggested: their
 * original tags with the fix applied, discarding anything else the mapper did
 * to them.
 *
 * This is a reset rather than a re-apply — re-applying only the suggested tags
 * would leave unrelated edits on the element in place, which is not what
 * someone asking to go back to the suggestion means.
 */
export const resetTagFixesInId = (
  context: IdContext,
  iDGlobal: IdGlobal | undefined,
  fixes: TagFix[]
): string[] => {
  if (!iDGlobal?.actionChangeTags) return []

  const reset: string[] = []
  for (const fix of fixes) {
    try {
      const entity = context.hasEntity(fix.entityId)
      if (!entity) continue

      const target = targetTags(context, fix)
      if (sameTags(entity.tags ?? {}, target)) continue

      context.perform(
        iDGlobal.actionChangeTags(fix.entityId, target),
        'Reset to MapRoulette suggested tags'
      )
      reset.push(fix.entityId)
    } catch (error) {
      logger.warn('Could not reset to suggested tags', { entityId: fix.entityId, error })
    }
  }
  return reset
}

/**
 * Undo a tag fix without disturbing anything else on the element: keys the fix
 * set go back to their original values (or away, if the fix introduced them),
 * and keys it removed come back.
 *
 * Used when a task leaves the bundle — its suggestion should stop applying,
 * but any editing the mapper did to that element themselves is theirs to keep.
 */
export const revertTagFixesInId = (
  context: IdContext,
  iDGlobal: IdGlobal | undefined,
  fixes: TagFix[]
): string[] => {
  if (!iDGlobal?.actionChangeTags) return []

  const reverted: string[] = []
  for (const fix of fixes) {
    try {
      const entity = context.hasEntity(fix.entityId)
      if (!entity) continue

      const base = context.history?.().base?.().hasEntity(fix.entityId)?.tags ?? {}
      const next = { ...(entity.tags ?? {}) }
      for (const key of Object.keys(fix.setTags)) {
        if (key in base) next[key] = base[key]
        else delete next[key]
      }
      for (const key of fix.unsetTags) {
        if (key in base) next[key] = base[key]
      }

      if (sameTags(entity.tags ?? {}, next)) continue
      context.perform(
        iDGlobal.actionChangeTags(fix.entityId, next),
        'Removed MapRoulette suggested tag change'
      )
      reverted.push(fix.entityId)
    } catch (error) {
      logger.warn('Could not revert suggested tag change', { entityId: fix.entityId, error })
    }
  }
  return reverted
}

/**
 * The tag fixes an editing session owes, and the ones it has already made.
 *
 * A fix cannot be applied until iD has downloaded its element, and that can
 * happen at any point — a mapper who opens the editor zoomed out sees nothing
 * downloaded until they zoom in. So fixes wait here until their element turns
 * up rather than being attempted for a few seconds and then dropped, and what
 * has landed is remembered so nothing is applied twice or reverted blindly.
 */
export const createTagFixQueue = () => {
  const waiting = new Map<string, TagFix>()
  const done = new Map<string, TagFix>()

  return {
    /**
     * Line the queue up with the fixes now wanted — the bundle's, which changes
     * as tasks join and leave it. Fixes that are no longer wanted are undone,
     * and ones not yet made are queued for the next flush.
     */
    sync: (context: IdContext, iDGlobal: IdGlobal | undefined, fixes: TagFix[]) => {
      const wanted = new Map(fixes.map((fix) => [fix.entityId, fix]))

      const dropped = [...done.values()].filter((fix) => !wanted.has(fix.entityId))
      if (dropped.length > 0) {
        revertTagFixesInId(context, iDGlobal, dropped)
        for (const fix of dropped) done.delete(fix.entityId)
      }
      for (const entityId of [...waiting.keys()]) {
        if (!wanted.has(entityId)) waiting.delete(entityId)
      }

      for (const [entityId, fix] of wanted) {
        if (!done.has(entityId)) waiting.set(entityId, fix)
      }
    },

    /**
     * Apply every queued fix whose element iD has since loaded, leaving the
     * rest queued. Returns the entity ids that came off the queue.
     */
    flush: (context: IdContext, iDGlobal: IdGlobal | undefined): string[] => {
      const loaded = [...waiting.values()].filter((fix) => isEntityLoaded(context, fix.entityId))
      if (loaded.length === 0) return []

      applyTagFixesInId(context, iDGlobal, loaded)
      // A loaded element is settled whether or not there was an edit to make:
      // one that already carries the suggested tags needs no change.
      for (const fix of loaded) {
        waiting.delete(fix.entityId)
        done.set(fix.entityId, fix)
      }
      return loaded.map((fix) => fix.entityId)
    },

    /** How many fixes are still waiting on iD to download their element. */
    waitingCount: () => waiting.size,
  }
}
