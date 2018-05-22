import _range from 'lodash/range'

/**
 * Constants related to zoom levels. These are based on
 * OpenStreetMap zoom levels.
 *
 * @see See https://wiki.openstreetmap.org/wiki/Zoom_levels
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */

/** Minimum possible zoom */
export const MIN_ZOOM = 0

/** Maximum possible zoom */
export const MAX_ZOOM = 19

/** Default zoom level */
export const DEFAULT_ZOOM = 13

/** Array of all zoom levels */
export const ZOOM_LEVELS = Object.freeze(_range(MIN_ZOOM, MAX_ZOOM + 1))
