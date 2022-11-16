import { performChallengeSearch }
       from '../../../services/Challenge/Challenge'
import WithSearch from '../WithSearch/WithSearch'
import WithSearchRoute from '../WithSearchRoute/WithSearchRoute'

const SEARCH_GROUP = 'challenges'

const WithChallengeSearch = (WrappedComponent, config) => {
  return WithSearch(
    WithSearchRoute(WrappedComponent, SEARCH_GROUP),
    SEARCH_GROUP,
    config?.frontendSearch ? () => null : performChallengeSearch
  )
}

export default WithChallengeSearch
