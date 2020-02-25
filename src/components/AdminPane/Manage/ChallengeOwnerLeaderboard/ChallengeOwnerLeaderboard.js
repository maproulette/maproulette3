import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'

export default class ChallengeOwnerLeaderboard extends Component {
  render() {
    if (!this.props.leaderboard) {
      return null
    }

    const leaders = _map(
      this.props.leaderboard.slice(0, 9), leader => (
        <li key={leader.userId} className="mr-mb-2">
          <span className="mr-text-pink mr-font-mono mr-mr-4">
            <FormattedNumber value={leader.rank} />.
          </span>
          <Link to={`/user/metrics/${leader.userId}`}>
            {leader.name}
          </Link>
        </li>
      )
    )

    return (
      <ol className="mr-list-reset mr-links-green-lighter mr-text-lg">
        {leaders}
      </ol>
    )
  }
}

ChallengeOwnerLeaderboard.propTypes = {
  leaderboard: PropTypes.array,
}
