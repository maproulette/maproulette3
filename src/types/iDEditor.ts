/**
 * Structural types for the subset of the iD editor API that MapRoulette
 * interacts with. iD ships as a minified JS bundle via `@openstreetmap/id`
 * with no published `.d.ts` files, so these interfaces are hand-written to
 * mirror only the methods we actually call.
 */

export interface IdSelection {
  selectAll: (selector: string) => IdSelection
  classed: (cls: string, on: boolean) => IdSelection
}

export interface IdMap {
  extent: (padded: [[number, number], [number, number]]) => void
  centerZoom: (center: [number, number], zoom: number) => void
  center: () => [number, number]
  zoom: () => number
  on: (event: string, cb: (() => void) | null) => void
}

export interface IdHistory {
  on: (event: string, cb: (() => void) | null) => void
  changes: () => { modified: unknown[]; created: unknown[]; deleted: unknown[] }
}

export interface IdContext {
  map: () => IdMap
  history: () => IdHistory
  surface: () => IdSelection | null
  hasEntity: (id: string) => unknown
  enter: (mode: unknown) => void
  defaultChangesetComment: (comment: string) => void
}

export interface IdGlobal {
  modeSelect: (ctx: IdContext, ids: string[]) => unknown
  utilHighlightEntities: (ids: string[], on: boolean, ctx: IdContext) => void
}

/** Window type for the iframe hosting `public/id-editor.html`, which exposes
 *  `setupiD()` and the `iD` global after the bundled script loads. */
export type IdIframeWindow = Window & {
  setupiD?: () => IdContext
  iD?: IdGlobal
}

export const getIdGlobal = (win: Window | null | undefined): IdGlobal | undefined =>
  (win as IdIframeWindow | null | undefined)?.iD
