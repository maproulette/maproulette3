import addMinutes from 'date-fns/add_minutes'
import { JOSM, sendJOSMCommand } from '../Editor/Editor'
import _get from 'lodash/get'

/**
 * View the task AOI as of the given date via Overpass attic query.
 * @param atticDate
 */
export const viewAtticOverpass = (selectedEditor, actionDate, actionBBox) => {
  const adjustedDateString = offsetAtticDateMoment(actionDate).toISOString();
  const bbox = overpassBBox(actionBBox).join(',');
  const query =
    '[out:xml][timeout:25][bbox:' + bbox + '][date:"' + adjustedDateString + '"];' +
    '( node(' + bbox + '); <; >; );' +
    'out meta;';

  // Try sending to JOSM if it's user's chosen editor, otherwise Overpass Turbo.
  var overpassApiURL = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  if (selectedEditor === JOSM) {
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
 * Returns a Moment instance representing the action date of the given
 * item. The timestamp is offset by the configured `atticQueryOffsetMinutes`
 * number of minutes.
 *
 * @param actionDate
 */
const offsetAtticDateMoment = (actionDate) => {
  console.log("ActionDate is: " + actionDate)
  console.log("OFfset is: " + process.env.REACT_APP_ATTIC_QUERY_OFFSET_MINUTES)
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
