import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'

import messages from './Messages'

export default class ChallengeOwnerLeaderboard extends Component {
  render() {
    if (!this.props.leaderboard) {
      return null
    }

    const showNumberTasks = this.props.leaderboard.length > 0 ?
      this.props.leaderboard[0].completedTasks > 0 : false

    const leaders = _map(
      this.props.leaderboard.slice(0, 9), leader => {
        const avgTimeSpent = leader.avgTimeSpent && leader.avgTimeSpent > 0 ?
          `${Math.floor(leader.avgTimeSpent / 1000 / 60)}m ${Math.floor(leader.avgTimeSpent / 1000) % 60}s`
          : null

        return (
          <li key={leader.userId} className="mr-mb-2 mr-flex mr-justify-between">
            <div className="mr-text-sm">
              <span className="mr-text-pink mr-font-mono mr-mr-4">
                <FormattedNumber value={leader.rank} />.
              </span>
              <Link to={`/user/metrics/${leader.userId}`}>
                {leader.name}
              </Link>
            </div>
            <div className="mr-flex mr-justify-end mr-text-right mr-text-sm">
              <div className="mr-w-16 mr-ml-2">{leader.score}</div>
              {showNumberTasks &&
                <React.Fragment>
                  <div className="mr-w-16 mr-ml-2">{leader.completedTasks}</div>
                  <div className="mr-w-16 mr-ml-2">{avgTimeSpent}</div>
                </React.Fragment>
              }
            </div>
          </li>
        )
      }
    )

    return (
      <React.Fragment>
        {leaders.length > 0 &&
          <div className="mr-flex mr-justify-between mr-text-pink mr-mb-2">
            <div></div>
            <div className="mr-flex mr-justify-end mr-text-right mr-text-sm">
              <div className="mr-w-16 mr-ml-2">
                <FormattedMessage {...messages.pointsLabel} />
              </div>
              {showNumberTasks &&
                <React.Fragment>
                  <div className="mr-w-16 mr-ml-2">
                    <FormattedMessage {...messages.tasksCompletedLabel}/>
                  </div>
                  <div className="mr-w-16 mr-ml-2">
                    <FormattedMessage {...messages.averageTimeLabel}/>
                  </div>
                </React.Fragment>
              }
            </div>
          </div>
        }
        <ol className="mr-list-reset mr-links-green-lighter mr-text-lg">
          {leaders}
        </ol>
      </React.Fragment>
    )
  }
}

ChallengeOwnerLeaderboard.propTypes = {
  leaderboard: PropTypes.array,
}
