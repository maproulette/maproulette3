import { addMinutes, isAfter } from 'date-fns'
import { isJosmEditor, sendJOSMCommand } from '../Editor/Editor'
import { fromLatLngBounds } from '../MapBounds/MapBounds'

/**
 * View the AOI defined by the given bounds (either LatLngBounds or an array)
 * as of the given date via Overpass attic query
 */
export const viewAtticOverpass = (selectedEditor, actionDate, bounds, ignoreAtticOffset = false) => {
  let adjustedDateString = offsetAtticDateMoment(actionDate).toISOString()
  if (ignoreAtticOffset) {
    adjustedDateString = actionDate
  }

  const bbox = overpassBBox(bounds).join(',')
  const query =
    `[out:xml][timeout:150][bbox:${bbox}][date:"${adjustedDateString}"];` +
    `( node(${bbox}); <; >; );` +
    'out meta;'

  // Try sending to JOSM if it's user's chosen editor, otherwise Overpass Turbo.
  if (isJosmEditor(selectedEditor)) {
    const overpassApiURL = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query)
    sendJOSMCommand('http://127.0.0.1:8111/import?new_layer=true&layer_name=' +
                     adjustedDateString + '&upload_policy=never&download_policy=never&url=' +
                     encodeURIComponent(overpassApiURL))
  }
  else {
    const overpassTurboURL = 'https://overpass-turbo.eu/map.html?Q=' + encodeURIComponent(query)
    window.open(overpassTurboURL)
  }
}

/**
 * View augmented diff in achavi of the AOI defined by the given bounds (either
 * LatLngBounds or an array) for the two given dates
 */
export const viewDiffOverpass = (bounds, firstDate, secondDate) => {
  // order firstDate and secondDate into earlierDate and laterDate
  let earlierDate = new Date(firstDate)
  let laterDate = new Date(secondDate)

  if (isAfter(earlierDate, laterDate)) {
    earlierDate = new Date(secondDate)
    laterDate = new Date(firstDate)
  }

  const bbox = overpassBBox(bounds).join(',')
  const query =
    `[out:xml][timeout:25][bbox:${bbox}]` +
    `[adiff:"${earlierDate.toISOString()}","${offsetAtticDateMoment(laterDate).toISOString()}"];` +
    `( node(${bbox}); <; >; );` +
    'out meta geom qt;'

  // Send users to achavi for visualization of augmented diff
  const overpassURL = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query)
  const achaviURL = 'https://overpass-api.de/achavi/?url=' + encodeURIComponent(overpassURL)
  window.open(achaviURL)
}


/**
 * Returns a Moment instance representing the action date of the given
 * item. The timestamp is offset by the configured `atticQueryOffsetMinutes`
 * number of minutes.
 */
const offsetAtticDateMoment = actionDate => {
  return addMinutes(actionDate,
                    window.env?.REACT_APP_ATTIC_QUERY_OFFSET_MINUTES ?? 10);
}

/**
 * Get the task bounding box, transforming to SWNE (min lat, min lon, max lat, max lon) array
 * as preferred by Overpass.
 */
const overpassBBox = bounds => {
  const bbox = fromLatLngBounds(bounds)
  // Transform WSEN to SWNE that Overpass prefers
  return [bbox[1], bbox[0], bbox[3], bbox[2]]
}
