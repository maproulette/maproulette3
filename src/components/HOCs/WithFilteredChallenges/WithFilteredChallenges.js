import React, { Component } from 'react';
import _every from 'lodash/every'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import { challengePassesDifficultyFilter }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { challengePassesKeywordFilter }
       from '../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import { challengePassesLocationFilter }
       from '../../../services/Challenge/ChallengeLocation/ChallengeLocation'

const allFilters = [
  challengePassesDifficultyFilter,
  challengePassesKeywordFilter,
  challengePassesLocationFilter,
]

export default function WithFilteredChallenges(WrappedComponent) {
  return class extends Component {
    challengePassesAllFilters(challenge) {
      return _every(allFilters,
                    passes => passes(this.props.challengeFilter, challenge, this.props))
    }

    render() {
      const filteredChallenges = _filter(this.props.challenges,
                                         challenge => this.challengePassesAllFilters(challenge))

      return <WrappedComponent challenges={filteredChallenges}
                               {..._omit(this.props, 'challenges')} />
    }
  }
}
