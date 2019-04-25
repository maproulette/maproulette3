import _isEmpty from 'lodash/isEmpty'
import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'
import _max from 'lodash/max'
import _split from 'lodash/split'
import _isString from 'lodash/isString'
import { LatLngBounds, LatLng } from 'leaflet'

/** Default map bounds in absence of any state */
export const DEFAULT_MAP_BOUNDS = [
  -6.152343750000001, // west
  -22.512556954051437, // south
  96.15234375, // east
  22.51255695405145, // north
]

// utility functions

/**
 * Converts a leaflet LatLngBounds instance to an array of [west, south, east,
 * north].
 *
 * > Note that if an array is given instead of a LatLngBounds, it is simply
 * > returned -- so it's safe to invoke this method on bounds if you're not
 * > sure whether they've already been converted or not, but you know you
 * > need them as an array.
 *
 * @param {Object} boundsObject - LatLngBounds to convert into an array
 *
 * @returns an array of [west, south, east, north]
 */
export const fromLatLngBounds = function(boundsObject) {
  if (_isEmpty(boundsObject)) {
    return null
  }
  else if (_isFunction(boundsObject.toBBoxString)) {
    return [boundsObject.getWest(), boundsObject.getSouth(),
            boundsObject.getEast(), boundsObject.getNorth()]
  }
  else if (_isArray(boundsObject) && boundsObject.length === 4) {
    // They gave us an array of bounds. Just return it.
    return boundsObject
  }
  else {
    throw new Error("Invalid bounds object given")
  }
}

/**
 * Converts an arrayBounds of [west, south, east, north] to a
 * leaflet LatLngBounds instance.
 *
 * > Note that if a LatLngBounds instance is given instead, it
 * > is simply returned -- so it's safe to invoke this method
 * > on bounds if you're not sure whether they've already been
 * > converted or not, but you know you need them as a LatLngBounds.
 *
 * @param {array} arrayBounds - [west, south, east, north] bounds
 *        to convert into LatLngBounds
 *
 * @returns a LatLngBounds instance
 */
export const toLatLngBounds = function(arrayBounds) {
  if (_isEmpty(arrayBounds)) {
    return null
  }
  else if (_isArray(arrayBounds) && arrayBounds.length === 4) {
    const southWest = new LatLng(arrayBounds[1], arrayBounds[0])
    const northEast = new LatLng(arrayBounds[3], arrayBounds[2])
    return new LatLngBounds(southWest, northEast)
  }
  else if (_isFunction(arrayBounds.toBBoxString)) {
    // they gave us a LatLngBounds. Just return it.
    return arrayBounds
  }
  else if (_isString(arrayBounds)) {
    const bounds = _split(arrayBounds, ',')
    if (bounds && bounds.length === 4) {
      return toLatLngBounds(bounds)
    }
    else {
      throw new Error("Invalid bounds given: " + arrayBounds)
    }
  }
  else {
    throw new Error("Invalid bounds array given")
  }
}

/**
 * Determines if the largest dimension of the given bounding box is less
 * than the given maxAllowedDegrees.
 */
export const boundsWithinAllowedMaxDegrees = function(bounds, maxAllowedDegrees) {
  const normalizedBounds = toLatLngBounds(bounds)
  return maxAllowedDegrees >
         _max([normalizedBounds.getEast() - normalizedBounds.getWest(),
               normalizedBounds.getNorth() - normalizedBounds.getSouth()])
}

/**
 * Determines if the two bounds are within the given degress apart from each other.
 */
export const boundsWithinDegrees = function(bounds1, bounds2, maxAllowedDegrees) {
  const normalizedBounds1 = toLatLngBounds(bounds1)
  const normalizedBounds2 = toLatLngBounds(bounds2)
  return maxAllowedDegrees >
         _max([Math.abs(normalizedBounds1.getEast() - normalizedBounds2.getEast()),
               Math.abs(normalizedBounds1.getWest() - normalizedBounds2.getWest()),
               Math.abs(normalizedBounds1.getNorth() - normalizedBounds2.getNorth()),
               Math.abs(normalizedBounds1.getSouth() - normalizedBounds2.getSouth())])
}
