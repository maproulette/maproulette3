import { connect } from 'react-redux'
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import { setSort,
         removeSort,
         clearSort } from '../../../services/Sort/Sort'
import { extendedFind } from '../../../services/Challenge/Challenge'
import WithSearchQuery from '../WithSearchQuery/WithSearchQuery'
import WithChallengeFilters from '../WithChallengeFilters/WithChallengeFilters'
import { SORT_NAME, SORT_CREATED } from '../../../services/Sort/Sort'


const SORT_GROUP = 'challenge'

const fetchResults = _debounce((query, dispatch) => {
  dispatch(extendedFind(query))
}, 500, {leading: true})

/**
 * WithChallengeSort passes down challenge sort criteria from the redux
 * store to the wrapped component, and also provides functions for altering and
 * removing that criteria.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithChallengeSort = WrappedComponent =>
   connect(mapStateToProps, mapDispatchToProps)(WithChallengeFilters(WithSearchQuery(WrappedComponent)))

export const mapStateToProps = state => {
  const challengeCriteria = _get(state, `currentSort.${SORT_GROUP}`, {})

  return {
    challengeCriteria,
    challengeSort: _pick(challengeCriteria, ['sortBy', 'direction']),
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => ({
  setChallengeSort: sortCriteria => {
      const sortBy = _get(sortCriteria, 'sortBy')
      let sort = null

      switch(sortBy) {
        case SORT_NAME:
          sort = {sortBy, direction: 'desc'}
          break
        case SORT_CREATED:
          sort = {sortBy, direction: 'asc'}
          break
        default:
          sort = {sortBy: null, direction: null}
          break
      }

      dispatch(setSort(SORT_GROUP, sort))

      const queryString = _get(ownProps, "searchQueries.challenges.searchQuery.query")
      const filters = _get(ownProps, "challengeFilter")
      fetchResults({searchQuery: queryString, filters, sortCriteria: sort}, dispatch)
    },

  removeChallengeSort:
    criteriaNames => dispatch(removeSort(SORT_GROUP, criteriaNames)),

  clearChallengeSort: () => dispatch(clearSort(SORT_GROUP)),
})


export default WithChallengeSort
