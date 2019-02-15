import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber } from 'react-intl'
import _map from 'lodash/map'

export default class ChallengeOwnerLeaderboard extends Component {
  render() {
    if (!this.props.leaderboard) {
      return null
    }

    const leaders = _map(
      this.props.leaderboard.slice(0, 9), leader => (
        <li key={leader.userId}>
          <span className="mr-font-bold">
            <FormattedNumber value={leader.rank} />.
          </span> {leader.name}
        </li>
      )
    )

    return (
      <ol className="mr-list-reset mr-text-blue mr-text-lg">
        {leaders}
      </ol>
    )
  }
}

ChallengeOwnerLeaderboard.propTypes = {
  leaderboard: PropTypes.array,
}
