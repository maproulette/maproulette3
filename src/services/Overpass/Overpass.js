import addMinutes from 'date-fns/add_minutes'
import isAfter from 'date-fns/is_after'
import format from 'date-fns/format'
import { JOSM, isJosmEditor, sendJOSMCommand } from '../Editor/Editor'
import _get from 'lodash/get'

/**
 * View the task AOI as of the given date via Overpass attic query.
 * @param atticDate
 */
export const viewAtticOverpass = (selectedEditor, actionDate, actionBBox) => {
  const adjustedDateString = offsetAtticDateMoment(actionDate).toISOString()
  const bbox = overpassBBox(actionBBox).join(',');
  const query =
    '[out:xml][timeout:25][bbox:' + bbox + '][date:"' + adjustedDateString + '"];' +
    '( node(' + bbox + '); <; >; );' +
    'out meta;';

  // Try sending to JOSM if it's user's chosen editor, otherwise Overpass Turbo.
  var overpassApiURL = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  if (isJosmEditor(selectedEditor)) {
    sendJOSMCommand('http://127.0.0.1:8111/import?new_layer=true&layer_name=' +
                     adjustedDateString + '&layer_locked=true&url=' +
                     encodeURIComponent(overpassApiURL)
    )
  }
  else {
    const overpassTurboURL = 'https://overpass-turbo.eu/map.html?Q=' + encodeURIComponent(query);
    window.open(overpassTurboURL);
  }
}

/**
 * View augmented diff in achavi of the task AOI for the two given items
 * @param actionBBox
 * @param firstItem
 * @param secondItem
 */
 export const viewDiffOverpass = (actionBBox, firstDate, secondDate) => {
   // order firstItem and secondItem into earlierItem and laterItem
   let earlierDate = new Date(firstDate)
   let laterDate = new Date(secondDate)

   if (isAfter(earlierDate, laterDate)) {
     earlierDate = new Date(secondDate)
     laterDate = new Date(firstDate)
   }

   const bbox = overpassBBox(actionBBox).join(',');
   let query =
     '[out:xml][timeout:25][bbox:' + bbox + ']' +
     '[adiff:"' + earlierDate.toISOString() + '","' +
                  offsetAtticDateMoment(laterDate).toISOString() + '"];' +
     '( node(' + bbox + '); <; >; );' +
     'out meta geom qt;';


   // Send users to achavi for visualization of augmented diff
   let overpassURL = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
   let achaviURL = 'https://overpass-api.de/achavi/?url=' + encodeURIComponent(overpassURL);
   window.open(achaviURL)
 }

/**
 * View changesets in OSM Cha. Sets up filters for task bbox, start date of
 * first edit, and participating usernames.
 **/
export const viewOSMCha = (actionBBox, earliestDate, participantUsernames) => {
  const filterParams = []
  // Setup bbox filter
  const bbox = actionBBox.join(',')
  filterParams.push('"in_bbox":[{"label":"' + bbox + '","value":"' + bbox + '"}]')

  if (earliestDate) {
    // Setup start-date filter
    const startDate = format(earliestDate, "YYYY-MM-DD")
    filterParams.push('"date__gte":[{"label":"' + startDate + '","value":"' + startDate + '"}]')
  }

  // Setup user filter
  if (participantUsernames && participantUsernames.length > 0) {
    const userList = participantUsernames.map((username) => {
       return '{"label":"' + username + '","value":"' + username + '"}'
      })
    filterParams.push('"users":[' + userList.join(',') + ']')
  }

  window.open('https://osmcha.mapbox.com/?filters=' +
          encodeURIComponent('{' + filterParams.join(',') + '}'))
}

/**
 * Returns a Moment instance representing the action date of the given
 * item. The timestamp is offset by the configured `atticQueryOffsetMinutes`
 * number of minutes.
 *
 * @param actionDate
 */
const offsetAtticDateMoment = (actionDate) => {
  return addMinutes(actionDate,
    _get(process.env, 'REACT_APP_ATTIC_QUERY_OFFSET_MINUTES', 10))
}

/**
 * Get the task bounding box, transforming to SWNE (min lat, min lon, max lat, max lon) array
 * as preferred by Overpass.
 */
const overpassBBox = (bbox) => {
  // Transform WSEN to SWNE that Overpass prefers
  return [bbox[1], bbox[0], bbox[3], bbox[2]];
}
