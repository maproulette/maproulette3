import { connect } from 'react-redux'
import _debounce from 'lodash/debounce'
import _isEmpty from 'lodash/isEmpty'
import _uniqueId from 'lodash/uniqueId'
import { setLocatorMapBounds, setTaskMapBounds }
       from '../../../services/MapBounds/MapBounds'
import { fetchChallengesWithinBoundingBox }
       from '../../../services/Challenge/Challenge'
import { pushFetchChallenges,
         popFetchChallenges } from '../../../services/Status/Status'
import { userLocation } from '../../../services/User/User'
import { buildError, addError } from '../../../services/Error/Error'

const mapStateToProps = state => ({currentMapBounds: null})

const updateChallenges = _debounce((dispatch, bounds) => {
  const fetchId = _uniqueId('fetch')
  dispatch(pushFetchChallenges(fetchId))
  dispatch(fetchChallengesWithinBoundingBox(bounds)).then(() =>
    dispatch(popFetchChallenges(fetchId))
  )
}, 1000, {leading: true})

const mapDispatchToProps = dispatch => {
  return {
    setLocatorMapBounds: (bounds, zoom, fromUserAction=false) => {
      dispatch(setLocatorMapBounds(bounds, fromUserAction))
    },

    updateBoundedChallenges: bounds => {
      if (!_isEmpty(bounds)) {
        updateChallenges(dispatch, bounds)
      }
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
        updateChallenges(dispatch, userBounds)
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
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)
