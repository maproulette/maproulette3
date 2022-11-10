import { performChallengeSearch } from "../../services/Challenge/Challenge"
import WithSearch from "../HOCs/WithSearch/WithSearch"
import WithSearchRoute from "../HOCs/WithSearchRoute/WithSearchRoute"

const SEARCH_GROUP = 'challenges'

export default WrappedComponent => {
  const performChallenge = function (
    searchObject,
    limit = 50000
  ) {
    searchObject = {...searchObject, onlyEnabled: false}
    return performChallengeSearch(searchObject, limit);
  }

  return (
    WithSearch(
      WithSearchRoute(WrappedComponent, SEARCH_GROUP),
      SEARCH_GROUP,
      performChallenge
    ))
}