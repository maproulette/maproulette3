import addMinutes from 'date-fns/add_minutes'
import isAfter from 'date-fns/is_after'
import format from 'date-fns/format'
import { isJosmEditor, sendJOSMCommand } from '../Editor/Editor'
import { fromLatLngBounds } from '../MapBounds/MapBounds'
import _get from 'lodash/get'

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
 * View changesets in OSMCha. Sets up filters for given bbox, the given start
 * date (typically the earliest relevant date in the task history), and
 * participating usernames
 */
export const viewOSMCha = (bboxArray, earliestDate, participantUsernames) => {
  const filterParams = []
  // Setup bbox filter
  const bbox = bboxArray.join(',')
  filterParams.push(`"in_bbox":[{"label":"${bbox}","value":"${bbox}"}]`)

  if (earliestDate) {
    // Setup start-date filter
    const startDate = format(earliestDate, "YYYY-MM-DD")
    filterParams.push(`"date__gte":[{"label":"${startDate}","value":"${startDate}"}]`)
  }

  // Setup user filter
  if (participantUsernames && participantUsernames.length > 0) {
    const userList =
      participantUsernames.map(username => `{"label":"${username}","value":"${username}"}`)
    filterParams.push(`"users":[${userList.join(',')}]`)
  }

  window.open('https://osmcha.mapbox.com/?filters=' +
              encodeURIComponent(`{${filterParams.join(',')}}`))
}

/**
 * Returns a Moment instance representing the action date of the given
 * item. The timestamp is offset by the configured `atticQueryOffsetMinutes`
 * number of minutes.
 */
const offsetAtticDateMoment = actionDate => {
  return addMinutes(actionDate,
                    _get(process.env, 'REACT_APP_ATTIC_QUERY_OFFSET_MINUTES', 10))
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
