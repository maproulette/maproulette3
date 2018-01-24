import { connect } from 'react-redux'
import { isEmpty as _isEmpty,
         get as _get } from 'lodash'
import { toLatLngBounds } from '../../../services/MapBounds/MapBounds'

const convertBounds = (boundsObject) => {
  if (_isEmpty(boundsObject) || _isEmpty(boundsObject.bounds)) {
    return boundsObject
  }

  return Object.assign(
    {},
    boundsObject,
    {bounds: toLatLngBounds(boundsObject.bounds)},
  )
}

const mapStateToProps = state => ({
  mapBounds: {
    locator: convertBounds(_get(state, 'currentMapBounds.locator')),
    task: convertBounds(_get(state, 'currentMapBounds.task')),
  }
})

const WithMapBoundsState =
  WrappedComponent => connect(mapStateToProps)(WrappedComponent)

export default WithMapBoundsState
