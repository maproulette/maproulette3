/**
 * Structural types for the subset of the Rapid editor API that MapRoulette
 * interacts with. Rapid is loaded as a script bundle inside
 * `public/rapid-editor.html` with no published `.d.ts` files, so these
 * interfaces only cover the methods we actually call.
 */

export interface RapidEditorSystem {
  on: (event: string, cb: () => void) => void
  hasChanges: () => boolean
}

export interface RapidContext {
  systems?: {
    editor?: RapidEditorSystem
  }
}

/** Window type for the iframe hosting `public/rapid-editor.html`, which
 *  exposes `setupRapid()` after the bundled script loads. */
export type RapidIframeWindow = Window & {
  setupRapid?: () => Promise<RapidContext>
}
