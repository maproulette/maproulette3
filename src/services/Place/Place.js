import { schema } from 'normalizr'
import RequestStatus from '../Server/RequestStatus'
import { fetchContent } from '../Server/Server'
import genericEntityReducer from '../Server/GenericEntityReducer'

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

// redux reducers
export const placeEntities = genericEntityReducer(RECEIVE_PLACE, 'places')
