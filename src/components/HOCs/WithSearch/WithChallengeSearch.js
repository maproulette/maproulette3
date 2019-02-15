import { performChallengeSearch }
       from '../../../services/Challenge/Challenge'
import WithSearch from '../WithSearch/WithSearch'
import WithSearchRoute from '../WithSearchRoute/WithSearchRoute'

const SEARCH_GROUP = 'challenges'

export default WrappedComponent => {
  return WithSearch(
    WithSearchRoute(WrappedComponent, SEARCH_GROUP),
    SEARCH_GROUP,
    performChallengeSearch
  )
}
