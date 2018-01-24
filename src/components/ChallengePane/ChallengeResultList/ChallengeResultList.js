import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get as _get } from 'lodash'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengeFilters from '../../HOCs/WithChallengeFilters/WithChallengeFilters'
import WithMapBoundsState from '../../HOCs/WithMapBounds/WithMapBoundsState'
import WithFilteredChallenges from '../../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithSortedChallenges from '../../HOCs/WithSortedChallenges/WithSortedChallenges'
import WithSearchResults from '../../HOCs/WithSearchResults/WithSearchResults'
import ChallengeResultItem from '../ChallengeResultItem/ChallengeResultItem'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'
import './ChallengeResultList.css'

/**
 * ChallengeResultList applies the current challenge filters and the given
 * search to the given challenges, displaying the results as a list of
 * ChallengeResultItems.
 *
 * @see See ChallengeResultItem
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeResultList extends Component {
  render() {
    let results = null
    if (this.props.challenges.length === 0) {
      results = (
        <div className='challenge-result-list__challenge-list no-results'>
          <span><FormattedMessage {...messages.noResults} /></span>
          {_get(this.props, 'fetchingChallenges', []).length > 0 &&
           <BusySpinner />
          }
        </div>
      )
    }
    else {
      const challenges = this.props.challenges.map(challenge => (
        <li key={challenge.id}>
          <ChallengeResultItem challenge={challenge} {...this.props} />
        </li>
      ))

      results = (
        <ul className="challenge-result-list__challenge-list">
          {challenges}
        </ul>
      )
    }

    return (
      <div className={classNames("challenge-result-list", this.props.className)}>
        <div className="level challenge-result-list--heading">
          <div className="level-left">
            <h2 className="title is-4">
              <FormattedMessage {...messages.heading} />
            </h2>
          </div>
        </div>

        {results}
      </div>
    )
  }
}

ChallengeResultList.propTypes = {
  /**
   * Candidate challenges to which any current filters, search, etc. should be
   * applied
   */
  challenges: PropTypes.array.isRequired,
}

export default function(searchName='challenges') {
  return WithCurrentUser(
    WithChallengeFilters(
      WithMapBoundsState(
        WithFilteredChallenges(
          WithSearchResults(
            WithSortedChallenges(
              ChallengeResultList
            ),
            searchName,
            'challenges'
          ),
        )
      )
    )
  )
}
