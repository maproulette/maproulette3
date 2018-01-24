import { connect } from 'react-redux'
import { debounce as _debounce,
         isEmpty as _isEmpty,
         uniqueId as _uniqueId,
         get as _get } from 'lodash'
import { setLocatorMapBounds, setTaskMapBounds }
       from '../../../services/MapBounds/MapBounds'
import { fetchChallengesWithinBoundingBox }
       from '../../../services/Challenge/Challenge'
import { pushFetchChallenges,
         popFetchChallenges } from '../../../services/Status/Status'
import { ChallengeLocation }
       from '../../../services/Challenge/ChallengeLocation/ChallengeLocation'
import WithChallengeFilters from '../WithChallengeFilters/WithChallengeFilters'
import { userLocation } from '../../../services/User/User'
import { buildError, addError } from '../../../services/Error/Error'

const mapStateToProps = state => ({currentMapBounds: null})

const updateChallenges = _debounce((dispatch, bounds, ownProps) => {
  // If we're currently filtering on map bounds, fetch new challenges associated
  // with our new map bounds.
  if (ownProps.challengeFilter &&
      ownProps.challengeFilter.location === ChallengeLocation.withinMapBounds) {
    const fetchId = _uniqueId('fetch')
    dispatch(pushFetchChallenges(fetchId))
    dispatch(fetchChallengesWithinBoundingBox(bounds)).then(() =>
      dispatch(popFetchChallenges(fetchId))
    )
  }
}, 1000, {leading: true})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocatorMapBounds: (bounds, zoom, fromUserAction=false) => {
      dispatch(setLocatorMapBounds(bounds, fromUserAction))
      updateChallenges(dispatch, bounds, ownProps)
    },

    locateMapToUser: (user) => {
      const userCenterpoint = userLocation(user)

      if (!_isEmpty(userCenterpoint)) {
        const nearbyLongitude = parseFloat(process.env.REACT_APP_NEARBY_LONGITUDE_LENGTH)
        const nearbyLatitude = parseFloat(process.env.REACT_APP_NEARBY_LATITUDE_LENGTH)

        const userBounds = [
          userCenterpoint.longitude - (nearbyLongitude / 2.0),
          userCenterpoint.latitude - (nearbyLatitude / 2.0),
          userCenterpoint.longitude + (nearbyLongitude / 2.0),
          userCenterpoint.latitude + (nearbyLatitude / 2.0)
        ]

        dispatch(setLocatorMapBounds(userBounds, true))
        updateChallenges(dispatch, userBounds, ownProps)
      }
      else {
        dispatch(addError(buildError(
          "User.missingHomeLocation",
          "No home location found. Please set your home location in your openstreetmap.org settings and then refresh this page to try again.")))
      }
    },

    setTaskMapBounds: (bounds, zoom, fromUserAction=false) => {
      dispatch(setTaskMapBounds(bounds, zoom, fromUserAction))
    },

    updateMapBoundedChallenges: () => {
      const locatorBounds = _get(ownProps, 'mapBounds.locator.bounds')
      if (locatorBounds) {
        dispatch(fetchChallengesWithinBoundingBox(locatorBounds))
      }
    }
  }
}

const WithMapBoundsDispatch = WrappedComponent => WithChallengeFilters(
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)
)

export default WithMapBoundsDispatch
