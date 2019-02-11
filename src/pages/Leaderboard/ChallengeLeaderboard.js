import React, { Component } from 'react'
import _get from 'lodash/get'
import WithChallenge from '../../components/HOCs/WithChallenge/WithChallenge'
import Leaderboard from './Leaderboard'

export class ChallengeLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterChallenges: true}}
                        suppressTopChallenges
                        suppressCountrySelection
                        challenges={[{id: this.props.match.params.challengeId}]}
                        displayName={_get(this.props.challenge, 'name')}
                        {...this.props} />
  }
}

export default WithChallenge(ChallengeLeaderboard)
