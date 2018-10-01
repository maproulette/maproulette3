import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import _sortBy from 'lodash/sortBy'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import WithChallengeSort from '../WithChallengeSort/WithChallengeSort'
import { SORT_NAME, SORT_CREATED, ALL_SORT_OPTIONS }
       from '../../../services/Sort/Sort'

const FEATURED_POINTS = -1
const SAVED_POINTS = -2

export const sortChallenges = function(props, challengesProp='challenges') {
  const sortCriteria = _get(props, 'challengeSort.sortBy')

  let sortedChallenges = props[challengesProp]

  if (sortCriteria === SORT_NAME) {
    sortedChallenges = _sortBy(sortedChallenges, 'name')
  }
  else if (sortCriteria === SORT_CREATED) {
    sortedChallenges = _sortBy(sortedChallenges, 'created')
  }
  else {
    // default "smart" sort. Prioritizes featured and user-saved challenges
    const savedChallenges = _get(props, 'user.savedChallenges', [])

    sortedChallenges = _sortBy(sortedChallenges, challenge => {
      let score = 0
      score += challenge.featured ? FEATURED_POINTS : 0
      score += _findIndex(savedChallenges, {id: challenge.id}) !== -1 ?
               SAVED_POINTS : 0
      return score
    })
  }

  return sortedChallenges
}


export default function(WrappedComponent,
                        challengesProp='challenges',
                        outputProp) {
  class WithSortedChallenges extends Component {

    render() {
      const sortedChallenges = sortChallenges(this.props, challengesProp)

      if (_isEmpty(outputProp)) {
        outputProp = challengesProp
      }

      return <WrappedComponent sortOptions = {ALL_SORT_OPTIONS}
                               {...{[outputProp]: sortedChallenges}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithSortedChallenges.propTypes = {
    user: PropTypes.object,
    challenges: PropTypes.array,
  }

  return WithChallengeSort(WithSortedChallenges)
}
