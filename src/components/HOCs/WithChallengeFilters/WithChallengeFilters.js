import { connect } from 'react-redux'
import { get as _get,
         pick as _pick,
         debounce as _debounce } from 'lodash'
import { setFilters,
         removeFilters } from '../../../services/Filter/Filter'
import { fetchChallengesWithKeywords } from '../../../services/Challenge/Challenge'

const FILTER_NAME = 'challenge'

/**
 * WithChallengeFilters passes down challenge filter criteria from the redux
 * store to the wrapped component, and also provides functions for altering and
 * removing that criteria.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeFilters =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

const mapStateToProps = state => {
  const challengeCriteria = _get(state, `currentFilters[${FILTER_NAME}]`, {})

  return {
    challengeCriteria,
    challengeFilter: _pick(challengeCriteria,
                           ['difficulty', 'featured', 'keywords', 'location']),
  }
}

const mapDispatchToProps = dispatch => ({
  setChallengeFilters:
    filterCriteria => dispatch(setFilters(FILTER_NAME, filterCriteria)),

  removeChallengeFilters:
    criteriaNames => dispatch(removeFilters(FILTER_NAME, criteriaNames)),

  setKeywordFilter: keywords => {
    if (keywords.length > 0) {
      refreshChallengesWithKeywords(dispatch, keywords)
    }

    dispatch(setFilters(FILTER_NAME, {keywords}))
  },
})

const refreshChallengesWithKeywords = _debounce(
  (dispatch, keywords) => dispatch(fetchChallengesWithKeywords(keywords)),
  500, {leading: true} // half second
)

export default WithChallengeFilters
