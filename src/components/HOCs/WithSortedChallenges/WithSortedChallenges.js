import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import _toLower from 'lodash/toLower'
import { isCooperative }
       from '../../../services/Challenge/CooperativeType/CooperativeType'
import WithChallengeSearch from '../WithSearch/WithChallengeSearch'
import { SORT_NAME, SORT_CREATED, SORT_OLDEST, SORT_POPULARITY, SORT_COOPERATIVE_WORK, SORT_COMPLETION, SORT_TASKS_REMAINING }
       from '../../../services/Search/Search'

const FEATURED_POINTS = -1
const SAVED_POINTS = -2

export const sortChallenges = function(props, challengesProp='challenges') {
  const sortCriteria = _get(props, 'searchSort.sortBy')
  let sortedChallenges = props[challengesProp]

  if (sortCriteria === SORT_NAME) {
    sortedChallenges = _sortBy(sortedChallenges, (c) => _toLower(c.name))
  }
  else if (sortCriteria === SORT_CREATED) {
    sortedChallenges = _reverse(_sortBy(sortedChallenges,
      c => c.created ? c.created : ''))
  }
  else if (sortCriteria === SORT_OLDEST) {
    sortedChallenges = (_sortBy(sortedChallenges, 
      c => c.created ? c.created : ''))
  }
  else if (sortCriteria === SORT_COMPLETION) {
    sortedChallenges = sortedChallenges.filter(challenge => challenge.completionPercentage !== 100);
    sortedChallenges = _reverse(_sortBy(sortedChallenges, 
      c => c.completionPercentage ? c.completionPercentage : ''))
  }
  else if (sortCriteria === SORT_TASKS_REMAINING) {
    sortedChallenges = sortedChallenges.filter(challenge => challenge.tasksRemaining !== 0);
    sortedChallenges = (_sortBy(sortedChallenges, 
      c => c.tasksRemaining ? c.tasksRemaining : ''))
  }
  else if (sortCriteria === SORT_POPULARITY) {
    sortedChallenges = _reverse(_sortBy(sortedChallenges,
      c => _isFinite(c.popularity) ? c.popularity : 0))
  }
  else if (sortCriteria === SORT_COOPERATIVE_WORK) {
    sortedChallenges = _sortBy(sortedChallenges, c => isCooperative(c.cooperativeType) ? 0 : 1)
  }
  else {
    // default sort. Prioritizes featured and user-saved challenges,
    // followed by popular challenges
    const savedChallenges = _get(props, 'user.savedChallenges', [])

    sortedChallenges = _sortBy(sortedChallenges, [challenge => {
      let score = 0
      score += challenge.featured ? FEATURED_POINTS : 0
      score += _findIndex(savedChallenges, {id: challenge.id}) !== -1 ?
               SAVED_POINTS : 0
      return score
    }, challenge => -1 * challenge.popularity])
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

      return <WrappedComponent {...{[outputProp]: sortedChallenges}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithSortedChallenges.propTypes = {
    user: PropTypes.object,
    challenges: PropTypes.array,
  }

  return WithChallengeSearch(WithSortedChallenges)
}
