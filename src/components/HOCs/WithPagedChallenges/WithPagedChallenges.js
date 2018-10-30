import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isEmpty from 'lodash/isEmpty'
import _slice from 'lodash/slice'
import { RESULTS_PER_PAGE } from '../../../services/Search/Search'

export default function(WrappedComponent,
                        challengesProp='challenges',
                        outputProp) {
  class WithPagedChallenges extends Component {
    render() {
      const currentPage = _get(this.props, 'searchPage.currentPage') || 0
      const resultsPerPage = _get(this.props, 'searchPage.resultsPerPage') || RESULTS_PER_PAGE
      const numberResultsToShow = (currentPage + 1) * resultsPerPage

      let pagedChallenges = this.props[challengesProp]

      const hasMoreResults = (pagedChallenges.length > numberResultsToShow) || this.props.isLoading
      pagedChallenges = _slice(pagedChallenges, 0, numberResultsToShow)

      if (_isEmpty(outputProp)) {
        outputProp = challengesProp
      }

      return <WrappedComponent hasMoreResults={hasMoreResults}
                               {...{[outputProp]: pagedChallenges}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithPagedChallenges.propTypes = {
    user: PropTypes.object,
    challenges: PropTypes.array,
  }

  return WithPagedChallenges
}
