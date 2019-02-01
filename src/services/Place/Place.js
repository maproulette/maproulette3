import { schema } from 'normalizr'
import RequestStatus from '../Server/RequestStatus'
import { fetchContent } from '../Server/Server'
import genericEntityReducer from '../Server/GenericEntityReducer'
import _map from 'lodash/map'

/** normalizr schema for places */
export const placeSchema = function() {
  return new schema.Entity('places', {}, {idAttribute: 'place_id'})
}

// redux actions
export const RECEIVE_PLACE = 'RECEIVE_PLACE'

// redux action creators

/**
 * Add or update place data in the redux store
 */
export const receivePlace = function(normalizedEntities) {
  return {
    type: RECEIVE_PLACE,
    status: RequestStatus.success,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Retrieve a description of the place at the given latititude and longitude.
 */
export const fetchPlace = function(lat, lng) {
  const placeURI =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

  return function(dispatch) {
    return fetchContent(placeURI, placeSchema()).then(normalizedResults => {
      dispatch(receivePlace(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Retrieve a bounding box location of the place given.
 *
 * @param placeSearch - place search string
 * @return boundingBox array
 */
export const fetchPlaceLocation = function(placeSearch) {
  const placeURI =
    `https://nominatim.openstreetmap.org/search?q=${escape(placeSearch)}&format=json&limit=1`

  return fetchContent(placeURI).then(placeResults => {
    if (placeResults.length > 0) {
      const bounds = _map(placeResults[0].boundingbox, (point) => parseFloat(point))

      // (from Nominatim) NSWE => (expected) WSEN
      return [bounds[2], bounds[1], bounds[3], bounds[0]]
    }
    else {
      return null
    }
  })
}

// redux reducers
export const placeEntities = genericEntityReducer(RECEIVE_PLACE, 'places')
