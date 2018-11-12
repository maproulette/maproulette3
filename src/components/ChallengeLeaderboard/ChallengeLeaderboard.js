import React, { Component } from 'react'
import Leaderboard from '../Leaderboard/Leaderboard'
import WithChallenge from '../HOCs/WithChallenge/WithChallenge'
import _get from 'lodash/get'

export class ChallengeLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterChallenges: true}}
                        suppressTopChallenges
                        challenges={[{id: this.props.match.params.challengeId}]}
                        displayName={_get(this.props.challenge, 'name')}
                        {...this.props} />
  }
}

export default WithChallenge(ChallengeLeaderboard)
