import WithSearch from '../HOCs/WithSearch/WithSearch'
import WithSearchRoute from '../HOCs/WithSearchRoute/WithSearchRoute'

const SEARCH_GROUP = 'challenges'

export default (WrappedComponent) => {
  return WithSearch(
    WithSearchRoute(WrappedComponent, SEARCH_GROUP),
    SEARCH_GROUP,
    () => null
  )
}
