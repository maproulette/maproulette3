import React, { Component } from 'react'
import Leaderboard from '../../../Leaderboard/Leaderboard'

export default class ChallengeLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterChallenges: true}}
                        topLeaderCount={0}
                        suppressTopChallenges
                        compactView
                        {...this.props} />
  }
}
