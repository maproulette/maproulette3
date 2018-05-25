import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _debounce from 'lodash/debounce'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'
import { setFilters,
         removeFilters,
         clearFilters } from '../../../services/Filter/Filter'
import { fetchChallengesWithKeywords,
         searchChallenges } from '../../../services/Challenge/Challenge'

const FILTER_NAME = 'challenge'

/**
 * WithChallengeFilters passes down challenge filter criteria from the redux
 * store to the wrapped component, and also provides functions for altering and
 * removing that criteria.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithChallengeFilters = function(WrappedComponent, updateResults) {
  return class extends Component {
    state = {
      loadingFilteredResults: null,
    }

    /**
     * Fetch challenges from the server matching the current filter set.
     *
     * @private
     */
    fetchFilteredResults = () => {
      this.setState({loadingFilteredResults: true})

      this.props.searchFilteredChallenges(this.props.challengeFilter).then(() => {
        this.setState({loadingFilteredResults: false})
      })
    }

    componentDidMount() {
      if (updateResults) {
        this.fetchFilteredResults()
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (updateResults) {
        if (!_isEqual(this.props.challengeFilter, prevProps.challengeFilter)) {
          this.fetchFilteredResults()
        }
      }
    }

    render() {
      return (
        <WrappedComponent loadingFilteredResults = {this.state.loadingFilteredResults}
                          {..._omit(this.props, ['searchFilteredChallenges'])} />
      )
    }
  }
}

export const mapStateToProps = state => {
  const challengeCriteria = _get(state, `currentFilters[${FILTER_NAME}]`, {})

  return {
    challengeCriteria,
    challengeFilter: _pick(challengeCriteria,
                           ['difficulty', 'featured', 'keywords', 'location']),
  }
}

export const mapDispatchToProps = dispatch => ({
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

  clearChallengeFilters: () => dispatch(clearFilters(FILTER_NAME)),

  searchFilteredChallenges: filters => dispatch(searchChallenges(null, filters)),
})

const refreshChallengesWithKeywords = _debounce(
  (dispatch, keywords) => dispatch(fetchChallengesWithKeywords(keywords)),
  500, {leading: true} // half second
)

export default (WrappedComponent, updateResults=false) =>
  connect(mapStateToProps, mapDispatchToProps)(WithChallengeFilters(WrappedComponent, updateResults))
