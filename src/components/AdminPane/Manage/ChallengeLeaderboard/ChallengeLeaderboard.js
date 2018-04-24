import React, { Component } from 'react'
import _omit from 'lodash/omit'
import Leaderboard from '../../../Leaderboard/Leaderboard'

export default class ChallengeLeaderboard extends Component {
  render() {
    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterChallenges: true}}
                        challenges={[this.props.challenge]}
                        topLeaderCount={0}
                        suppressTopChallenges
                        compactView
                        {..._omit(this.props, 'challenges')} />
  }
}
