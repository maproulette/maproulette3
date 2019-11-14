import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import WithChallenge from '../../components/HOCs/WithChallenge/WithChallenge'
import Leaderboard from './Leaderboard'

export class ChallengeLeaderboard extends Component {
  render() {
    if (!this.props.challenge) {
      return <Leaderboard />
    }

    const challengeNameLink = (
      <span className="mr-links-inverse">
        <Link
          to={`/browse/challenges/${this.props.challenge.id}`}
          title={this.props.challenge.name}
        >
          {this.props.challenge.name}
        </Link>
      </span>
    )

    return <Leaderboard leaderboardOptions={{onlyEnabled: false, filterChallenges: true}}
                        suppressTopChallenges
                        suppressCountrySelection
                        challenges={[{id: this.props.match.params.challengeId}]}
                        displayName={challengeNameLink}
                        {...this.props} />
  }
}

export default WithChallenge(ChallengeLeaderboard)
