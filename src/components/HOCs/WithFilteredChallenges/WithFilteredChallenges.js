import React, { Component } from 'react';
import { every as _every,
         filter as _filter,
         omit as _omit } from 'lodash'
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
